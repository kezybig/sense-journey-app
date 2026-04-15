import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Animated, Easing, PanResponder, Alert, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// API 配置
const getApiBaseUrl = () => {
  // 如果是Web平台且通过ngrok访问，使用当前ngrok隧道URL
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('ngrok-free.dev') || hostname.includes('loca.lt') || hostname.includes('github.io')) {
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

// 检测是否为GitHub Pages环境
const isGitHubPages = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname.includes('github.io');
  }
  return false;
};

const Lever = ({ options, value, onValueChange, handleColor, label }) => {
  const trackHeight = 100; // leverTrack 的总高度
  const handleHeight = 20; // 稍微增加手柄高度以便更好抓取
  const availableHeight = trackHeight - handleHeight; // 手柄可滑动的实际高度
  const optionHeight = availableHeight / (options.length - 1); // 每个选项的间隔距离

  const handleTop = useRef(new Animated.Value(0)).current; // 手柄的垂直位置 (0 到 availableHeight)
  const [displayValue, setDisplayValue] = useState(value); // 用于显示的值
  const isDragging = useRef(new Animated.Value(0)).current; // 拖动状态动画
  const pulseAnim = useRef(new Animated.Value(1)).current; // 数值变化脉冲动画
  const leverTrackBreathAnim = useRef(new Animated.Value(0)).current; // 轨道呼吸灯动画

  // 根据当前值设置手柄的初始位置
  useEffect(() => {
    const initialIndex = options.indexOf(value);
    if (initialIndex !== -1) {
      handleTop.setValue(initialIndex * optionHeight);
      setDisplayValue(value);
    }
  }, [value, options, optionHeight]);

  // 监听 displayValue 变化，触发脉冲动画
  useEffect(() => {
    if (displayValue !== value) {
      // 触发脉冲动画：快速放大然后恢复
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [displayValue]);

  // 轨道呼吸灯动画
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(leverTrackBreathAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(leverTrackBreathAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDragging.setValue(1);
        handleTop.setOffset(handleTop._value); // 记录按下时的位置
        handleTop.setValue(0);
      },
      onPanResponderMove: (event, gestureState) => {
        // 计算新的位置
        let newTop = handleTop._offset + gestureState.dy;
        
        // 严格限制在轨道内部 [0, availableHeight]
        if (newTop < 0) newTop = 0;
        if (newTop > availableHeight) newTop = availableHeight;
        
        // 更新动画值 (减去偏移量，因为 Animated 内部会处理 offset)
        handleTop.setValue(newTop - handleTop._offset);

        // 实时更新显示的值
        const closestIndex = Math.round(newTop / optionHeight);
        if (options[closestIndex] !== displayValue) {
          setDisplayValue(options[closestIndex]);
        }
      },
      onPanResponderRelease: (event, gestureState) => {
        isDragging.setValue(0);
        handleTop.flattenOffset(); // 合并偏移量到当前值

        // 获取最终位置并限制范围
        let finalTop = handleTop._value;
        if (finalTop < 0) finalTop = 0;
        if (finalTop > availableHeight) finalTop = availableHeight;

        // 计算最近的吸附点
        const closestIndex = Math.round(finalTop / optionHeight);
        const snappedTop = closestIndex * optionHeight;

        // 增强吸附动画效果：更低的 friction 和更高的 tension 产生更有弹性的效果
        Animated.spring(handleTop, {
          toValue: snappedTop,
          useNativeDriver: false,
          friction: 6,
          tension: 70,
          velocity: 0.5,
        }).start(() => {
          onValueChange(options[closestIndex]);
          setDisplayValue(options[closestIndex]);
        });
      },
    })
  ).current;

  const handleScale = isDragging.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  // 文本脉冲缩放变换
  const textScale = pulseAnim.interpolate({
    inputRange: [1, 1.3],
    outputRange: [1, 1.3],
  });

  return (
    <View style={styles.leverGroup}>
      <Text style={styles.leverLabel}>{label}</Text>
      <Animated.View style={[styles.leverTrack, {
        borderColor: leverTrackBreathAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['rgba(255, 255, 255, 0.1)', 'rgba(0, 206, 209, 0.6)']
        })
      }]}>
        <Animated.View
          style={[
            styles.leverHandle,
            handleColor,
            { 
              top: handleTop,
              transform: [{ scale: handleScale }]
            }
          ]}
          {...panResponder.panHandlers}
        >
          <Animated.Text style={[styles.leverValueDisplay, { transform: [{ scale: textScale }] }]}>
            {displayValue}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default function LaunchPadScreen({ navigation, route }) {
  // 状态管理
  const [budget, setBudget] = useState('1500'); // 默认选中 1500
  const [time, setTime] = useState('1-2'); // 默认选中 1-2
  const [distance, setDistance] = useState('1-3H'); // 默认选中 1-3H
  const [moods, setMoods] = useState(['安静独处']); // 默认选中 Quiet，支持多选
  const [transportType, setTransportType] = useState('公共交通'); // 出行类型：公共交通、自驾、高铁、飞机
  const [uid, setUid] = useState(null); // 用户ID
  
  // 从路由参数中获取用户ID
  useEffect(() => {
    if (route?.params?.uid) {
      console.log('从路由参数获取uid:', route.params.uid);
      setUid(route.params.uid);
    } else {
      // 如果没有uid，尝试从GitHub Pages环境中使用默认值
      if (isGitHubPages()) {
        console.log('GitHub Pages环境，使用默认uid: rM5U9RN2pa');
        setUid('rM5U9RN2pa'); // GitHub Pages环境使用默认用户ID（Hashid格式）
      } else {
        console.log('没有uid，设置为null');
      }
    }
  }, [route?.params?.uid]);
  
  // 出行类型选择处理
  const handleTransportPress = () => {
    const transportOptions = ['公共交通', '自驾', '高铁', '飞机'];
    Alert.alert(
      '选择出行类型',
      '请选择您的出行方式',
      transportOptions.map(option => ({
        text: `${getTransportIcon(option)} ${option}`,
        onPress: () => setTransportType(option),
      })).concat([
        { text: '取消', style: 'cancel' }
      ])
    );
  };
  
  // 动画值
  const pedestalAnim = useRef(new Animated.Value(0)).current; // 控制台升起动画
  const logoAnim = useRef(new Animated.Value(0)).current; // Logo 显现动画
  const leverAnim = useRef(new Animated.Value(0)).current; // 拉杆动画
  const sigilAnim = useRef(new Animated.Value(0)).current; // 符号显现动画
  const launchButtonAnim = useRef(new Animated.Value(0)).current; // 发射按钮入场动画
  const launchButtonPulseAnim = useRef(new Animated.Value(0)).current; // 发射按钮呼吸动画
  const launchButtonPressAnim = useRef(new Animated.Value(0)).current; // 发射按钮按下状态动画
  const logoPulseAnim = useRef(new Animated.Value(0)).current; // Logo核心呼吸动画
  
  // 入场动画序列
  useEffect(() => {
    Animated.sequence([
      Animated.timing(pedestalAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(leverAnim, {
          toValue: 1,
          duration: 600,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sigilAnim, {
          toValue: 1,
          duration: 600,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(launchButtonAnim, {
          toValue: 1,
          duration: 500,
          delay: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // 入场动画结束后，启动呼吸动画
      Animated.parallel([
        // 发射按钮呼吸动画
        Animated.loop(
          Animated.sequence([
            Animated.timing(launchButtonPulseAnim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(launchButtonPulseAnim, {
              toValue: 0,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ),
        // Logo核心呼吸动画
        Animated.loop(
          Animated.sequence([
            Animated.timing(logoPulseAnim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(logoPulseAnim, {
              toValue: 0,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    });
  }, []);

  // 选项数据
  const budgetOptions = ['0', '500', '1000', '1500', '2000', '2500', '3000', '3000+'];
  const timeOptions = ['1-2', '3-5', '5-7', '7+'];
  const distanceOptions = ['1-3H', '3-5H', '5-7H', '7+H'];
  const transportOptions = ['公共交通', '自驾', '高铁', '飞机'];
  const moodOptions = ['安静独处', '运动释放', '需要绿色', '想喝一杯', '冒险探索'];
  
  const handleLaunch = async () => {
    console.log('handleLaunch 被调用', { uid, budget, time, distance, transportType, moods });
    // 验证输入
    if (!budget || !time || !distance || !transportType || moods.length === 0) {
      Alert.alert('请设置物理边界和情绪标定');
      return;
    }
    
    // 检查用户ID
    if (!uid) {
      console.log('uid 为空，阻止请求');
      Alert.alert('用户未登录', '请先登录以保存您的旅程选择');
      return;
    }
    
    try {
      // 验证uid是否存在（现在uid是Hashid字符串）
      if (typeof uid !== 'string' || uid.trim() === '') {
        Alert.alert('用户ID无效', '请重新登录');
        return;
      }
      
      // 构建请求数据
      const journeyData = {
        uid: uid,
        budget: budget,
        duration: time,
        proximity: distance,
        transport: transportType,
        moods: moods
      };
      console.log('发送旅程数据:', journeyData);
      console.log('API基础URL:', getApiBaseUrl());
      
      // 调用API保存旅程选择
      const response = await fetch(`${getApiBaseUrl()}/api/journey-selections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(journeyData),
      });
      
      const data = await response.json();
      console.log('API响应:', { status: response.status, ok: response.ok, data });
      
      if (response.ok) {
        // 保存成功，导航到雷达页面
        Alert.alert('旅程选择已保存', '正在为您生成个性化推荐...');
        setTimeout(() => {
          navigation.navigate('Radar', { uid: uid });
        }, 1500);
      } else {
        Alert.alert('保存失败', data.error || '请稍后重试');
      }
    } catch (error) {
      Alert.alert('网络错误', '无法连接到服务器，请检查网络连接');
    }
  };

  const handleButtonPressIn = () => {
    Animated.timing(launchButtonPressAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.timing(launchButtonPressAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const toggleMood = (option) => {
    if (moods.includes(option)) {
      // 如果已选中，则移除
      setMoods(moods.filter(m => m !== option));
    } else {
      // 如果未选中，检查是否超过3个
      if (moods.length < 3) {
        setMoods([...moods, option]);
      } else {
        // 超过3个时给予提示
        Alert.alert('最多只能选择3个情绪标签');
      }
    }
  };
  
  // 按钮按下状态缩放插值
  const buttonPressScale = launchButtonPressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />
      
      {/* 顶部 Logo */}
      <Animated.View style={[styles.topLogoContainer, { opacity: logoAnim, transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }] }]}>
        <View style={styles.singularityOuter}>
          <View style={styles.singularityMiddle}>
            <View style={styles.singularityInner}>
              <Animated.View style={[
                styles.singularityCore, 
                { 
                  opacity: logoPulseAnim,
                  transform: [
                    { 
                      scale: logoPulseAnim.interpolate({ 
                        inputRange: [0, 1], 
                        outputRange: [0.8, 1.2] 
                      }) 
                    }
                  ]
                }
              ]} />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* 全息状态显示屏 */}
      <Animated.View style={[styles.statusDisplay, { opacity: logoAnim, transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }] }]}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>BUDGET</Text>
          <Text style={styles.statusValue}>{budget}</Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>DURATION</Text>
          <Text style={styles.statusValue}>{time}</Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>PROXIMITY</Text>
          <Text style={styles.statusValue}>{distance}</Text>
        </View>
        <View style={styles.statusDivider} />
        <TouchableOpacity 
          style={styles.statusItem}
          onPress={handleTransportPress}
          activeOpacity={0.7}
        >
          <Text style={styles.statusLabel}>TRANSPORT</Text>
          <Text style={styles.statusValue}>{transportType ? getTransportIcon(transportType) : '---'}</Text>
        </TouchableOpacity>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>MOODS</Text>
          <Text style={styles.statusValue}>{moods.length > 0 ? moods.map(m => getMoodIcon(m)).join(' ') : '---'}</Text>
        </View>
      </Animated.View>

      {/* 控制台基座 */}
      <Animated.View style={[styles.pedestal, { transform: [{ translateY: pedestalAnim.interpolate({ inputRange: [0, 1], outputRange: [height / 2, 0] }) }] }]}>
        <View style={styles.pedestalTop} />
        <View style={styles.pedestalBody}>
          {/* 物理边界设定器 */}
          <Animated.View style={[styles.leversContainer, { opacity: leverAnim, transform: [{ translateY: leverAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>
            {/* 预算拉杆 */}
            <Lever
              options={budgetOptions}
              value={budget}
              onValueChange={setBudget}
              handleColor={styles.leverHandleGreen}
              label="CAPSULE DEPOSIT"
            />

            {/* 时间拉杆 */}
            <Lever
              options={timeOptions}
              value={time}
              onValueChange={setTime}
              handleColor={styles.leverHandleBlue}
              label="DURATION"
            />

            {/* 距离拉杆 */}
            <Lever
              options={distanceOptions}
              value={distance}
              onValueChange={setDistance}
              handleColor={styles.leverHandleGold}
              label="PROXIMITY"
            />

            {/* 交通方式拉杆 */}
            <Lever
              options={transportOptions}
              value={transportType}
              onValueChange={setTransportType}
              handleColor={styles.leverHandlePurple}
              label="TRANSPORT"
            />
          </Animated.View>

          {/* 情绪标定 (全息 Sigils) */}
          <Animated.View style={[styles.sigilsContainer, { opacity: sigilAnim, transform: [{ translateY: sigilAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }]}>
            {moodOptions.map((option, index) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sigilButton,
                  moods.includes(option) && styles.sigilButtonActive
                ]}
                onPress={() => toggleMood(option)}
              >
                <Text style={styles.sigilIcon}>{getMoodIcon(option)}</Text>
                <Text style={styles.sigilText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* 行动核心 (LAUNCH ESCAPE 按钮) */}
          <Animated.View style={[
            styles.launchCoreContainer, 
            { 
              opacity: launchButtonAnim, 
              transform: [
                { scale: launchButtonAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
                { scale: buttonPressScale }
              ],
              borderColor: launchButtonPulseAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: ['#00ced1', '#00ffff', '#00ced1']
              }),
              shadowColor: launchButtonPulseAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: ['#00ced1', '#00ffff', '#00ced1']
              }),
              shadowOpacity: launchButtonPulseAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.6, 1.0, 0.6]
              }),
              shadowRadius: launchButtonPulseAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [15, 30, 15]
              }),
            }
          ]}>
            <TouchableOpacity 
              style={styles.launchButton} 
              onPress={handleLaunch}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              activeOpacity={0.8}
            >
              <Text style={styles.launchButtonText}>LAUNCH ESCAPE</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        <View style={styles.pedestalBase} />
      </Animated.View>
      
      {/* 个人中心入口 */}
      <TouchableOpacity 
        style={styles.archiveButton} 
        onPress={() => navigation.navigate('Archive')}
      >
        <Text style={styles.archiveButtonText}>逃跑档案</Text>
      </TouchableOpacity>
    </View>
  );
}

// 情绪图标映射
const getMoodIcon = (mood) => {
  switch (mood) {
    case '安静独处': return '🌳'; // 孤树
    case '运动释放': return '🏃‍♂️'; // 跑步运动
    case '需要绿色': return '🌿'; // 绿色植物
    case '想喝一杯': return '🍷'; // 极简酒杯
    case '冒险探索': return '🚀'; // 火箭
    default: return '✨';
  }
};

// 出行类型图标映射
const getTransportIcon = (transport) => {
  switch (transport) {
    case '公共交通': return '🚌'; // 公交车
    case '自驾': return '🚗'; // 汽车
    case '高铁': return '🚄'; // 高铁
    case '飞机': return '✈️'; // 飞机
    default: return '🚀';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    alignItems: 'center',
    justifyContent: 'flex-end', // 控制台从底部升起
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
  topLogoContainer: {
    position: 'absolute',
    top: 40,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
  },
  statusDisplay: {
    position: 'absolute',
    top: 130, // 位于 Logo 下方
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 206, 209, 0.05)', // 半透明背景
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 209, 0.2)', // 发光边框
    shadowColor: '#00ced1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    zIndex: 9,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    color: '#00ced1',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 206, 209, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  statusDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
  },
  // 沿用 PortalScreen 的 Logo 样式
  singularityOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  singularityMiddle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  singularityInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  singularityCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  pedestal: {
    width: '100%',
    height: height * 0.75, // 控制台占据屏幕大部分
    backgroundColor: 'rgba(25, 25, 35, 0.95)', // 拉丝钛金属感
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    borderTopWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#00ced1',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  pedestalTop: {
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pedestalBody: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  pedestalBase: {
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  leversContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  leverGroup: {
    alignItems: 'center',
    width: '22%',
  },
  leverLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 10,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  leverTrack: {
    width: 20,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    position: 'relative',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  leverHandle: {
    position: 'absolute',
    width: 30,
    height: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center', // 使文本居中
    justifyContent: 'center', // 使文本居中
    userSelect: 'none', // 禁用文本选择
    cursor: 'pointer', // 鼠标移入时显示手型
  },
  leverValueDisplay: {
    color: '#00ced1',
    fontSize: 10,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 206, 209, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
    userSelect: 'none', // 禁用文本选择
  },
  leverHandleGreen: {
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
    shadowColor: '#00ff00',
  },
  leverHandleBlue: {
    backgroundColor: 'rgba(0, 0, 255, 0.3)',
    shadowColor: '#0000ff',
  },
  leverHandleGold: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    shadowColor: '#ffd700',
  },
  leverHandlePurple: {
    backgroundColor: 'rgba(147, 112, 219, 0.3)', // 中等紫罗兰色
    shadowColor: '#9370db',
  },
  sigilsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  sigilButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sigilButtonActive: {
    borderColor: '#00ced1',
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
    shadowColor: '#00ced1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 5,
  },
  sigilIcon: {
    fontSize: 30,
    marginBottom: 5,
  },
  sigilText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: 'bold',
  },
  launchCoreContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
    borderWidth: 2,
    borderColor: '#00ced1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00ced1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, // 恢复静态值，动态部分在 JSX 中
    shadowRadius: 20, // 恢复静态值，动态部分在 JSX 中
    elevation: 15,
  },
  launchButton: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  launchButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  archiveButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    padding: 10,
    zIndex: 10,
  },
  archiveButtonText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});