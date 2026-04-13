import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Animated, Dimensions, Easing, Alert, Platform, Modal } from 'react-native';

const { width, height } = Dimensions.get('window');

// API 配置
const getApiBaseUrl = () => {
  // 如果是Web平台且通过ngrok访问，使用当前ngrok隧道URL
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('ngrok-free.dev') || hostname.includes('loca.lt')) {
      // 使用当前窗口的origin（协议+主机名），与API在同一域名下
      return window.location.origin;
    }
  }
  
  // 开发环境使用 localhost:8080
  if (__DEV__) {
    return 'http://localhost:8080';
  }
  // 生产环境使用相对路径
  return '';
};

export default function PortalScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isFocused, setIsFocused] = useState({ email: false, password: false, verificationCode: false });
  const [mode, setMode] = useState('login'); // login, register
  const [loginMethod, setLoginMethod] = useState('password'); // password, sms
  const [step, setStep] = useState('email'); // email, code, password (for register)
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 控制密码可见性
  
  // 联动动画值
  const eyeGlowAnim = useRef(new Animated.Value(1)).current;
  const orbitalRotation = useRef(new Animated.Value(0)).current;
  const hudOpacity = useRef(new Animated.Value(0.3)).current;
  const focusGlowAnim = useRef(new Animated.Value(0)).current; // 用于输入框聚焦时的光带动画
  const eyeCloseAnim = useRef(new Animated.Value(0)).current; // 用于吉祥物眼睛闭合动画
  
  // 入场动画专用值
  const entryMeteorAnim = useRef(new Animated.Value(0)).current;
  const mascotEntryAnim = useRef(new Animated.Value(0)).current; // 0 为隐藏/偏离，1 为到达
  const mascotOpacity = useRef(new Animated.Value(0)).current;
  
  // 入场序列动画
  useEffect(() => {
    // 1. 流星从右上划过
    Animated.sequence([
      Animated.timing(entryMeteorAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // 2. 流星消失，吉祥物从右上飘入
      Animated.parallel([
        Animated.timing(mascotEntryAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(mascotOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ]).start(() => {
      // 3. 入场完成后开启循环动画
      startLoopAnimations();
    });
  }, []);

  const startLoopAnimations = () => {
    // 浮动动画 (吉祥物)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // 轨道旋转动画
    Animated.loop(
      Animated.timing(orbitalRotation, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // HUD 呼吸闪烁
    Animated.loop(
      Animated.sequence([
        Animated.timing(hudOpacity, {
          toValue: 0.6,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(hudOpacity, {
          toValue: 0.2,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 脉冲动画 (Logo)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // 吉祥物联动：当输入框聚焦时，眼睛发光
  useEffect(() => {
    const isAnyFocused = Object.values(isFocused).some(v => v);
    const isPasswordFocused = isFocused.password;

    Animated.parallel([
      Animated.timing(eyeGlowAnim, {
        toValue: isAnyFocused ? 2 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(hudOpacity, {
        toValue: isAnyFocused ? 0.8 : 0.3,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(focusGlowAnim, {
        toValue: isAnyFocused ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(eyeCloseAnim, {
        toValue: isPasswordFocused ? 1 : 0, // 密码聚焦时闭眼
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, [isFocused]);

  // 动画值
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // 原有的循环动画移动到 startLoopAnimations 中了，这里不再需要直接在 useEffect 中启动循环
  
  // 自动清除错误信息
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);
  
  // 模式切换时重置状态
  useEffect(() => {
    if (mode === 'login') {
      setStep('email');
      setCountdown(0);
    }
  }, [mode]);
  
  const handleSendCode = () => {
    if (!email) {
      setErrorMsg('请输入邮箱或手机号');
      return;
    }
    // 模拟发送验证码
    Alert.alert('验证码已发送', '我们已向您的邮箱/手机号发送了验证码');
    setCountdown(60);
    setStep('code');
  };
  
  const handleVerifyCode = () => {
    if (!verificationCode) {
      setErrorMsg('请输入验证码');
      return;
    }
    // 模拟验证验证码
    setStep('password');
  };
  
  const handleSetPassword = async () => {
    if (!password || password.length < 6) {
      setErrorMsg('请设置至少6位密码');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: email,
          email: email.includes('@') ? email : '',
          password: password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('注册成功', '欢迎加入逃生舱！');
        navigation.replace('LaunchPad');
      } else {
        Alert.alert('注册失败', data.error || '请稍后重试');
      }
    } catch (error) {
      Alert.alert('错误', '网络连接失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = async () => {
    if (loginMethod === 'password') {
      // 密码登录
      if (!email || !password) {
        setErrorMsg('请输入邮箱/手机号和密码');
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: email,
            password: password,
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // 登录成功
          navigation.replace('LaunchPad');
        } else {
          if (data.error === 'User not found') {
            setShowGuidanceModal(true);
          } else if (data.error === 'Invalid password') {
            setErrorMsg('🔒 密码错误，再试一次？');
          } else {
            setErrorMsg(data.error || '登录失败，请检查账号密码');
          }
        }
      } catch (error) {
        setErrorMsg('网络连接失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    } else {
      // 短信登录
      if (!email || !verificationCode) {
        Alert.alert('提示', '请输入邮箱/手机号和验证码');
        return;
      }
      
      setLoading(true);
      try {
        // 短信登录逻辑（后续实现）
        Alert.alert('提示', '短信登录功能开发中');
      } catch (error) {
        Alert.alert('错误', '网络连接失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // 生成粒子效果
  const renderParticles = () => {
    return Array.from({ length: 100 }).map((_, index) => {
      // 随机大小和透明度
      const size = Math.random() * 4 + 1;
      const opacity = Math.random() * 0.9 + 0.3;
      
      // 60%的粒子是普通星星，40%的粒子是流星
      const isMeteor = Math.random() > 0.6;
      
      // 普通星星的动画参数
      const starDuration = Math.random() * 15000 + 5000;
      const starDelay = Math.random() * 2000;
      
      // 流星的动画参数
      const meteorDuration = Math.random() * 1000 + 300; // 更快的流星
      const meteorDelay = Math.random() * 2000; // 更频繁的流星
      
      // 随机起始位置
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      
      // 普通星星的随机目标位置
      const starEndX = Math.random() * width;
      const starEndY = Math.random() * height;
      
      // 流星的目标位置（从屏幕一侧到另一侧）
      const meteorEndX = isMeteor ? (startX < width / 2 ? width + 200 : -200) : startX;
      const meteorEndY = isMeteor ? (startY + (Math.random() * 400 - 200)) : startY;
      
      // 创建动画值
      const animatedValue = new Animated.Value(0);
      
      // 启动动画
      if (isMeteor) {
        // 流星动画：不循环，有延迟
        Animated.sequence([
          Animated.delay(meteorDelay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: meteorDuration,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.delay(Math.random() * 1000 + 1000), // 更短的流星间隔
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ]).start();
      } else {
        // 星星动画：循环，缓慢移动
        Animated.loop(
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: starDuration,
            delay: starDelay,
            easing: Easing.linear,
            useNativeDriver: false,
          })
        ).start();
      }
      
      // 计算动画位置
      const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [startX, isMeteor ? meteorEndX : starEndX],
      });
      
      const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [startY, isMeteor ? meteorEndY : starEndY],
      });
      
      // 流星的透明度变化
      const meteorOpacity = animatedValue.interpolate({
        inputRange: [0, 0.2, 0.8, 1],
        outputRange: [0, 1, 1, 0],
      });
      
      // 星星的闪烁效果
      const starOpacity = animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [opacity, opacity * 0.5, opacity],
      });
      
      // 流星的大小变化
      const meteorSize = animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [5, 10, 5],
      });
      
      return (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              width: isMeteor ? 3 : size,
              height: isMeteor ? 25 : size,
              opacity: isMeteor ? meteorOpacity : starOpacity,
              backgroundColor: isMeteor ? 'rgba(255, 255, 255, 1)' : (index % 3 === 0 ? 'rgba(255, 215, 0, 1)' : index % 3 === 1 ? 'rgba(106, 27, 154, 1)' : 'rgba(0, 206, 209, 1)'),
              boxShadow: isMeteor ? '0 0 15px 3px rgba(255, 255, 255, 0.9)' : 'none',
              zIndex: isMeteor ? 10 : 1,
              position: 'absolute',
              transform: [
                { translateX },
                { translateY },
                ...(isMeteor ? [{ rotate: '45deg' }] : []),
              ],
            },
          ]}
        />
      );
    });
  };
  
  return (
    <View style={styles.container}>
      {/* 背景渐变 */}
      <View style={styles.backgroundGradient} />
      
      {/* 背景粒子效果 */}
      {renderParticles()}
      
      {/* 入场引导流星 */}
      <Animated.View style={[
        styles.entryMeteor,
        {
          opacity: entryMeteorAnim.interpolate({
            inputRange: [0, 0.1, 0.9, 1],
            outputRange: [0, 1, 1, 0]
          }),
          transform: [
            { translateX: entryMeteorAnim.interpolate({ inputRange: [0, 1], outputRange: [width, width * 0.2] }) },
            { translateY: entryMeteorAnim.interpolate({ inputRange: [0, 1], outputRange: [-200, height * 0.4] }) },
            { rotate: '-135deg' }
          ]
        }
      ]} />
      
      <View style={styles.content}>
        {/* Guidance Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showGuidanceModal}
          onRequestClose={() => setShowGuidanceModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalEmoji}>👽</Text>
              <Text style={styles.modalTitle}>检测到新访客</Text>
              <Text style={styles.modalText}>
                我们好像没见过你！{"\n"}要不要创建一个专属的逃生舱？
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonCancel]} 
                  onPress={() => setShowGuidanceModal(false)}
                >
                  <Text style={styles.modalButtonTextCancel}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonConfirm]} 
                  onPress={() => {
                    setShowGuidanceModal(false);
                    setMode('register');
                  }}
                >
                  <Text style={styles.modalButtonTextConfirm}>创建逃生舱</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 脉冲奇点 Logo */}
        <Animated.View style={[styles.singularityContainer, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.singularityOuter}>
            <View style={styles.singularityMiddle}>
              <View style={styles.singularityInner}>
                <View style={styles.singularityCore} />
              </View>
            </View>
          </View>
        </Animated.View>
        
        {/* 问候语 */}
        <Text style={styles.greeting}>READY TO ESCAPE THE NOISE?</Text>
        
        {/* 错误提示 */}
        {errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}
        
        <View style={styles.form}>
          {/* 登录模式 */}
          {mode === 'login' && (
            <View style={styles.formLayout}>
              {/* 左侧单一大型吉祥物 */}
              <Animated.View style={[
                styles.largeMascotContainer,
                { 
                  opacity: mascotOpacity,
                  transform: [
                    { translateX: mascotEntryAnim.interpolate({ inputRange: [0, 1], outputRange: [width/2, 0] }) },
                    { translateY: mascotEntryAnim.interpolate({ inputRange: [0, 1], outputRange: [-height/2, 0] }) },
                    { scale: mascotEntryAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }
                  ]
                }
              ]}>
                {/* HUD 遥测线条 */}
                <Animated.View style={[styles.hudVerticalLine, { opacity: hudOpacity }]} />
                <Animated.View style={[styles.hudDataBlock, { opacity: hudOpacity, top: 20, left: 10 }]} />
                <Animated.View style={[styles.hudDataBlock, { opacity: hudOpacity, bottom: 20, right: 10 }]} />
                
                <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
                  {/* 轨道环 */}
                  <Animated.View style={[
                    styles.orbitalRing, 
                    { 
                      transform: [
                        { rotate: orbitalRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                        { scaleX: 2.5 }
                      ]
                    }
                  ]} />
                  <Animated.View style={[
                    styles.orbitalRingSmall, 
                    { 
                      transform: [
                        { rotate: orbitalRotation.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] }) },
                        { scaleX: 2 }
                      ]
                    }
                  ]} />
                  
                  <View style={styles.largeMascotBody}>
                    <View style={styles.largeMascotVisor}>
                      <Animated.View style={[
                        styles.largeMascotEye, 
                        { 
                          opacity: eyeGlowAnim.interpolate({
                            inputRange: [1, 2],
                            outputRange: [0.6, 1]
                          }),
                          transform: [
                            { scaleX: eyeCloseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.1] }) }, // 闭眼效果
                            { scaleY: eyeGlowAnim }
                          ]
                        }
                      ]} />
                    </View>
                  </View>
                  <View style={styles.mascotShadow} />
                  
                  {/* 状态文字 */}
                  <Animated.Text style={[styles.mascotStatus, { opacity: hudOpacity }]}>
                    {loading ? '[ PROCESSING ]' : Object.values(isFocused).some(v => v) ? '[ SYNCING... ]' : '[ SYSTEM READY ]'}
                  </Animated.Text>
                </Animated.View>
                
                {/* 连接线 */}
                <Animated.View style={[styles.connectingLine, { opacity: hudOpacity.interpolate({ inputRange: [0.3, 0.8], outputRange: [0.1, 0.4] }) }]} />
              </Animated.View>

              {/* 右侧输入框区域 */}
              <View style={styles.inputsColumn}>
                {/* Email 输入 */}
                <View style={styles.inputFieldContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      isFocused.email && styles.inputFocused
                    ]}
                    placeholder="Email or Phone"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setIsFocused({ ...isFocused, email: true })}
                    onBlur={() => setIsFocused({ ...isFocused, email: false })}
                  />
                  <Animated.View style={[
                    styles.inputFocusGlow,
                    {
                      opacity: isFocused.email ? focusGlowAnim : 0,
                      transform: [{ scaleX: focusGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
                    }
                  ]} />
                  <Animated.View style={[
                    styles.inputFocusGlow,
                    {
                      opacity: isFocused.email ? focusGlowAnim : 0,
                      transform: [{ scaleX: focusGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
                    }
                  ]} />
                </View>
                
                {/* 密码输入（密码登录） */}
                {loginMethod === 'password' && (
                  <View style={styles.inputFieldContainer}>
                    <TextInput
                    style={[
                      styles.input,
                      isFocused.password && styles.inputFocused
                    ]}
                    placeholder="Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    secureTextEntry={!showPassword} // 根据状态控制密码可见性
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setIsFocused({ ...isFocused, password: true })}
                    onBlur={() => setIsFocused({ ...isFocused, password: false })}
                  />
                  <TouchableOpacity 
                    style={styles.passwordToggle} 
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.passwordToggleIcon}>
                      {showPassword ? '👁️' : '🔒'}
                    </Text>
                  </TouchableOpacity>
                  <Animated.View style={[
                    styles.inputFocusGlow,
                    {
                      opacity: isFocused.password ? focusGlowAnim : 0,
                      transform: [{ scaleX: focusGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
                    }
                  ]} />
                  </View>
                )}
                
                {/* 验证码输入（短信登录） */}
                {loginMethod === 'sms' && (
                  <View style={styles.inputFieldContainer}>
                    <TextInput
                    style={[
                      styles.input,
                      isFocused.verificationCode && styles.inputFocused
                    ]}
                    placeholder="Verification Code"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    onFocus={() => setIsFocused({ ...isFocused, verificationCode: true })}
                    onBlur={() => setIsFocused({ ...isFocused, verificationCode: false })}
                    keyboardType="number-pad"
                  />
                  <Animated.View style={[
                    styles.inputFocusGlow,
                    {
                      opacity: isFocused.verificationCode ? focusGlowAnim : 0,
                      transform: [{ scaleX: focusGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
                    }
                  ]} />
                  <Animated.View style={[
                    styles.inputFocusGlow,
                    {
                      opacity: isFocused.verificationCode ? focusGlowAnim : 0,
                      transform: [{ scaleX: focusGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
                    }
                  ]} />
                    
                    {/* 发送验证码按钮 */}
                    <TouchableOpacity 
                      style={styles.resendButton}
                      onPress={handleSendCode}
                      disabled={countdown > 0}
                    >
                      <Text style={[styles.resendButtonText, countdown > 0 && styles.resendButtonTextDisabled]}>
                        {countdown > 0 ? `RESEND IN ${countdown}s` : 'SEND CODE'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
          
          {/* 注册模式 */}
          {mode === 'register' && (
            <View style={styles.formLayout}>
              {/* 左侧单一大型吉祥物 */}
              <Animated.View style={[
                styles.largeMascotContainer,
                { 
                  opacity: mascotOpacity,
                  transform: [
                    { translateX: mascotEntryAnim.interpolate({ inputRange: [0, 1], outputRange: [width/2, 0] }) },
                    { translateY: mascotEntryAnim.interpolate({ inputRange: [0, 1], outputRange: [-height/2, 0] }) },
                    { scale: mascotEntryAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }
                  ]
                }
              ]}>
                {/* HUD 遥测线条 */}
                <Animated.View style={[styles.hudVerticalLine, { opacity: hudOpacity }]} />
                <Animated.View style={[styles.hudDataBlock, { opacity: hudOpacity, top: 20, left: 10 }]} />
                <Animated.View style={[styles.hudDataBlock, { opacity: hudOpacity, bottom: 20, right: 10 }]} />
                
                <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
                  {/* 轨道环 */}
                  <Animated.View style={[
                    styles.orbitalRing, 
                    { 
                      transform: [
                        { rotate: orbitalRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                        { scaleX: 2.5 }
                      ]
                    }
                  ]} />
                  <Animated.View style={[
                    styles.orbitalRingSmall, 
                    { 
                      transform: [
                        { rotate: orbitalRotation.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] }) },
                        { scaleX: 2 }
                      ]
                    }
                  ]} />
                  
                  <View style={styles.largeMascotBody}>
                    <View style={styles.largeMascotVisor}>
                      <Animated.View style={[
                        styles.largeMascotEye, 
                        { 
                          opacity: eyeGlowAnim.interpolate({
                            inputRange: [1, 2],
                            outputRange: [0.6, 1]
                          }),
                          transform: [
                            { scaleX: eyeCloseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.1] }) }, // 闭眼效果
                            { scaleY: eyeGlowAnim }
                          ]
                        }
                      ]} />
                    </View>
                  </View>
                  <View style={styles.mascotShadow} />
                  
                  {/* 状态文字 */}
                  <Animated.Text style={[styles.mascotStatus, { opacity: hudOpacity }]}>
                    {loading ? '[ PROCESSING ]' : Object.values(isFocused).some(v => v) ? '[ SYNCING... ]' : '[ SYSTEM READY ]'}
                  </Animated.Text>
                </Animated.View>
                
                {/* 连接线 */}
                <Animated.View style={[styles.connectingLine, { opacity: hudOpacity.interpolate({ inputRange: [0.3, 0.8], outputRange: [0.1, 0.4] }) }]} />
              </Animated.View>

              <View style={styles.inputsColumn}>
                {step === 'email' && (
                  <View style={styles.inputFieldContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        isFocused.email && styles.inputFocused
                      ]}
                      placeholder="Email or Phone"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setIsFocused({ ...isFocused, email: true })}
                      onBlur={() => setIsFocused({ ...isFocused, email: false })}
                    />
                  </View>
                )}
                
                {step === 'code' && (
                  <View style={styles.inputFieldContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        isFocused.verificationCode && styles.inputFocused
                      ]}
                      placeholder="Verification Code"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      onFocus={() => setIsFocused({ ...isFocused, verificationCode: true })}
                      onBlur={() => setIsFocused({ ...isFocused, verificationCode: false })}
                      keyboardType="number-pad"
                    />
                  </View>
                )}
                
                {step === 'password' && (
                  <View style={styles.inputFieldContainer}>
                    <TextInput
                    style={[
                      styles.input,
                      isFocused.password && styles.inputFocused
                    ]}
                    placeholder="Set Password"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    secureTextEntry={!showPassword} // 根据状态控制密码可见性
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setIsFocused({ ...isFocused, password: true })}
                    onBlur={() => setIsFocused({ ...isFocused, password: false })}
                  />
                  <TouchableOpacity 
                    style={styles.passwordToggle} 
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.passwordToggleIcon}>
                      {showPassword ? '👁️' : '🔒'}
                    </Text>
                  </TouchableOpacity>
                  <Animated.View style={[
                    styles.inputFocusGlow,
                    {
                      opacity: isFocused.password ? focusGlowAnim : 0,
                      transform: [{ scaleX: focusGlowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }]
                    }
                  ]} />
                  </View>
                )}
              </View>
            </View>
          )}

          {/* 公用按钮区域 */}
          {mode === 'login' ? (
            <>
              <TouchableOpacity 
                style={styles.mainButton} 
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={styles.mainButtonText}>{loading ? 'LOGGING IN...' : (loginMethod === 'password' ? 'LOG IN' : 'VERIFY & LOG IN')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setLoginMethod(loginMethod === 'password' ? 'sms' : 'password')}>
                <Text style={styles.createAccountText}>
                  {loginMethod === 'password' ? 'USE SMS CODE TO LOG IN' : 'USE PASSWORD TO LOG IN'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setMode('register')}>
                <Text style={styles.createAccountText}>FIRST TIME? CREATE A CAPSULE</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {step === 'email' && (
                <TouchableOpacity 
                  style={styles.mainButton} 
                  onPress={handleSendCode}
                  activeOpacity={0.8}
                  disabled={loading || countdown > 0}
                >
                  <Text style={styles.mainButtonText}>{loading ? 'SENDING...' : 'GET VERIFICATION CODE'}</Text>
                </TouchableOpacity>
              )}
              {step === 'code' && (
                <TouchableOpacity 
                  style={styles.mainButton} 
                  onPress={handleVerifyCode}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <Text style={styles.mainButtonText}>{loading ? 'VERIFYING...' : 'VERIFY CODE'}</Text>
                </TouchableOpacity>
              )}
              {step === 'password' && (
                <TouchableOpacity 
                  style={styles.mainButton} 
                  onPress={handleSetPassword}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <Text style={styles.mainButtonText}>{loading ? 'CREATING...' : 'SET PASSWORD'}</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity onPress={() => mode === 'register' ? (step === 'email' ? setMode('login') : step === 'code' ? setStep('email') : setStep('code')) : setMode('login')}>
                <Text style={styles.createAccountText}>
                  {step === 'email' ? 'ALREADY HAVE AN ACCOUNT? LOG IN' : 'BACK TO PREVIOUS STEP'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        
        {/* 第三方登录 */}
        <View style={styles.socialLogin}>
          <Text style={styles.socialLoginText}>OR LOG IN WITH</Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialIcon}>
              <Text style={styles.socialIconText}>🍎</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Text style={styles.socialIconText}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Text style={styles.socialIconText}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Text style={styles.socialIconText}>💳</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a1a',
    backgroundImage: 'linear-gradient(135deg, #0a0a1a 0%, #16213e 50%, #1a1a2e 100%)',
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
  },
  entryMeteor: {
    position: 'absolute',
    width: 4,
    height: 150,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    zIndex: 100,
    boxShadow: '0 0 20px 5px rgba(255, 255, 255, 0.8)',
  },
  content: {
    width: '80%',
    alignItems: 'center',
    zIndex: 1,
  },
  // 吉祥物 Echo 样式
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 2,
  },
  mascotBody: {
    width: 40,
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  mascotVisor: {
    width: 30,
    height: 12,
    backgroundColor: '#0a0a1a',
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  mascotEye: {
    width: '100%',
    height: 2,
    backgroundColor: '#00ced1', // 荧光青色眼睛
    shadowColor: '#00ced1',
    shadowRadius: 4,
    shadowOpacity: 1,
  },
  mascotShadow: {
    width: 20,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 2,
    marginTop: 10,
  },

  // 脉冲奇点 Logo 样式
  singularityContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  singularityOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  singularityMiddle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  singularityInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  singularityCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  greeting: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 60,
    textAlign: 'center',
    fontWeight: '300',
  },
  errorContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.5)',
  },
  errorText: {
    color: '#ff5252',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  formLayout: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  largeMascotContainer: {
    width: '35%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  orbitalRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 209, 0.3)',
    top: 0,
    left: -10,
  },
  orbitalRingSmall: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    top: 10,
    left: 0,
  },
  hudVerticalLine: {
    position: 'absolute',
    left: 0,
    top: -20,
    bottom: -20,
    width: 1,
    backgroundColor: 'rgba(0, 206, 209, 0.4)',
  },
  hudDataBlock: {
    position: 'absolute',
    width: 4,
    height: 10,
    backgroundColor: '#00ced1',
  },
  mascotStatus: {
    position: 'absolute',
    bottom: -35,
    width: 120,
    textAlign: 'center',
    color: '#00ced1',
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 1,
    left: -30,
  },
  connectingLine: {
    position: 'absolute',
    right: -20,
    width: 30,
    height: 1,
    backgroundColor: '#00ced1',
  },
  largeMascotBody: {
    width: 60,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 15,
  },
  largeMascotVisor: {
    width: 45,
    height: 18,
    backgroundColor: '#0a0a1a',
    borderRadius: 9,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  largeMascotEye: {
    width: '100%',
    height: 3,
    backgroundColor: '#00ced1',
    shadowColor: '#00ced1',
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  inputsColumn: {
    width: '60%',
    justifyContent: 'center',
  },
  inputFieldContainer: {
    width: '100%',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 48,
    color: '#00ced1', // 荧光青色文字
    fontSize: 16,
    paddingHorizontal: 10,
    backgroundColor: 'transparent', // 透明背景
    textShadowColor: 'rgba(0, 206, 209, 0.5)', // 文字发光
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    caretColor: '#00ced1', // 光标颜色
  },
  inputFocused: {
    color: '#00ced1',
  },
  inputFocusGlow: {
    position: 'absolute',
    bottom: -5, // 位于输入框下方
    left: '10%',
    width: '80%',
    height: 2,
    backgroundColor: '#00ced1',
    borderRadius: 1,
    shadowColor: '#00ced1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  passwordToggle: {
    position: 'absolute',
    right: 0,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  passwordToggleIcon: {
    fontSize: 18,
    color: 'rgba(0, 206, 209, 0.7)',
    textShadowColor: 'rgba(0, 206, 209, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  modalEmoji: {
    fontSize: 50,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 10,
  },
  modalButtonConfirm: {
    backgroundColor: '#00ced1',
    marginLeft: 10,
    shadowColor: '#00ced1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalButtonTextCancel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: '#0a0a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputLine: {
    height: 0, // 隐藏下划线
    backgroundColor: 'transparent',
    width: '100%',
  },
  inputLineFocused: {
    height: 0, // 隐藏下划线
    backgroundColor: 'transparent',
  },
  mainButton: {
    backgroundColor: '#00ced1',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#00ced1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  mainButtonText: {
    color: '#0a0a1a',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  createAccountText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 60,
  },
  resendButton: {
    marginVertical: 10,
  },
  resendButtonText: {
    color: 'rgba(255, 215, 0, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 1,
  },
  resendButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  socialLogin: {
    alignItems: 'center',
  },
  socialLoginText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginBottom: 20,
    letterSpacing: 1,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  socialIconText: {
    fontSize: 20,
  },
});