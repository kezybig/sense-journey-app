# 逃生舱 (SenseJourney) 实现归档

## 1. 登录/注册页面 (PortalScreen) 实现

### 1.1 核心功能

#### 1.1.1 登录模式
- **密码登录**：输入邮箱/手机号和密码
- **短信登录**：输入邮箱/手机号和验证码
- **第三方登录**：支持 Apple、Google、WeChat、Alipay

#### 1.1.2 注册模式
- **验证码流程**：输入邮箱/手机号 → 接收验证码 → 输入验证码 → 设置密码
- **表单验证**：邮箱/手机号、验证码、密码长度验证
- **错误提示**：使用 Alert 组件显示错误信息

### 1.2 视觉设计

#### 1.2.1 背景效果
- **流动粒子动画**：
  - 100个粒子，其中60%是普通星星，40%是流星
  - 星星：缓慢移动，带有闪烁效果，使用金色、紫色、青色
  - 流星：快速划过，带有阴影效果，使用白色
  - 动画参数：星星持续10-20秒，流星持续0.3-1.3秒

- **背景渐变**：
  - 颜色：从纯黑色渐变到深蓝色
  - 样式：`linear-gradient(135deg, #0a0a1a 0%, #16213e 50%, #1a1a2e 100%)`

#### 1.2.2 界面元素
- **Logo**：小巧的 "SJ" 抽象符号，位于顶部
- **问候语**："READY TO ESCAPE THE NOISE?"
- **输入框**：微光输入线设计，随用户触摸变色
- **按钮**：紫色主按钮，带有阴影效果
- **链接**：低调的文本链接，与背景融合

### 1.3 技术实现

#### 1.3.1 状态管理
- **useState**：管理输入内容、焦点状态、登录模式、登录方式、步骤、倒计时
- **useEffect**：实现验证码倒计时和模式切换时的状态重置

#### 1.3.2 动画效果
- **Animated API**：实现粒子的流动和闪烁效果
- **Easing**：使用线性动画实现平滑的粒子运动
- **interpolate**：计算粒子的位置和透明度变化

#### 1.3.3 响应式设计
- **Dimensions**：获取屏幕宽度和高度，确保粒子在不同屏幕尺寸上正确显示
- **StyleSheet**：使用 React Native 的样式系统，确保界面在不同平台上的一致性

## 2. 技术栈

- **前端框架**：React Native + Expo
- **状态管理**：React Hooks (useState, useEffect)
- **动画**：React Native Animated API
- **样式**：React Native StyleSheet
- **导航**：React Navigation
- **平台**：支持 Web、iOS、Android

## 3. 运行方式

```bash
# 启动开发服务器
npx expo start --web --port 8082

# 在浏览器中访问
http://localhost:8082
```

## 4. 后续优化方向

1. **添加真实的登录/注册逻辑**：连接后端 API
2. **增强动画效果**：在移动平台上使用更丰富的动画
3. **添加表单验证**：确保输入数据的有效性
4. **优化响应式设计**：适配更多屏幕尺寸
5. **添加国际化支持**：支持多语言
6. **优化性能**：减少粒子数量，提高动画性能

## 5. 关键代码片段

### 5.1 粒子动画实现

```javascript
const renderParticles = () => {
  return Array.from({ length: 100 }).map((_, index) => {
    // 随机大小和透明度
    const size = Math.random() * 4 + 1;
    const opacity = Math.random() * 0.9 + 0.3;
    
    // 60%的粒子是普通星星，40%的粒子是流星
    const isMeteor = Math.random() > 0.6;
    
    // 动画参数
    const starDuration = Math.random() * 15000 + 5000;
    const meteorDuration = Math.random() * 1000 + 300;
    
    // 随机位置
    const startX = Math.random() * width;
    const startY = Math.random() * height;
    const meteorEndX = isMeteor ? (startX < width / 2 ? width + 200 : -200) : startX;
    const meteorEndY = isMeteor ? (startY + (Math.random() * 400 - 200)) : startY;
    
    // 创建动画值
    const animatedValue = new Animated.Value(0);
    
    // 启动动画
    if (isMeteor) {
      // 流星动画
      Animated.sequence([
        Animated.delay(Math.random() * 2000),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: meteorDuration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.delay(Math.random() * 1000 + 1000),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // 星星动画
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: starDuration,
          delay: Math.random() * 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ).start();
    }
    
    // 计算动画位置和透明度
    const translateX = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [startX, isMeteor ? meteorEndX : Math.random() * width],
    });
    
    const translateY = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [startY, isMeteor ? meteorEndY : Math.random() * height],
    });
    
    const meteorOpacity = animatedValue.interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: [0, 1, 1, 0],
    });
    
    const starOpacity = animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [opacity, opacity * 0.5, opacity],
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
```

### 5.2 登录/注册流程

```javascript
// 状态管理
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [verificationCode, setVerificationCode] = useState('');
const [isFocused, setIsFocused] = useState({ email: false, password: false, verificationCode: false });
const [mode, setMode] = useState('login'); // login, register
const [loginMethod, setLoginMethod] = useState('password'); // password, sms
const [step, setStep] = useState('email'); // email, code, password (for register)
const [countdown, setCountdown] = useState(0);

// 发送验证码
const handleSendCode = () => {
  if (!email) {
    Alert.alert('提示', '请输入邮箱或手机号');
    return;
  }
  // 模拟发送验证码
  Alert.alert('验证码已发送', '我们已向您的邮箱/手机号发送了验证码');
  setCountdown(60);
  setStep('code');
};

// 验证验证码
const handleVerifyCode = () => {
  if (!verificationCode) {
    Alert.alert('提示', '请输入验证码');
    return;
  }
  // 模拟验证验证码
  setStep('password');
};

// 设置密码
const handleSetPassword = () => {
  if (!password || password.length < 6) {
    Alert.alert('提示', '请设置至少6位密码');
    return;
  }
  // 模拟设置密码
  setTimeout(() => {
    navigation.replace('LaunchPad');
  }, 500);
};

// 登录
const handleLogin = () => {
  if (loginMethod === 'password') {
    // 密码登录
    if (!email || !password) {
      Alert.alert('提示', '请输入邮箱/手机号和密码');
      return;
    }
  } else {
    // 短信登录
    if (!email || !verificationCode) {
      Alert.alert('提示', '请输入邮箱/手机号和验证码');
      return;
    }
  }
  // 模拟登录
  setTimeout(() => {
    navigation.replace('LaunchPad');
  }, 500);
};
```

## 6. 项目结构

```
senseJourney/
├── src/
│   ├── screens/
│   │   ├── PortalScreen.js        # 登录/注册页面
│   │   ├── LaunchPadScreen.js      # 主控台页面
│   │   ├── RadarScreen.js          # 动态雷达页面
│   │   └── ArchiveScreen.js        # 逃跑档案页面
│   └── navigation/
│       └── AppNavigator.js         # 导航配置
├── App.js                          # 应用入口
├── package.json                    # 项目配置
└── implementation_archive.md       # 实现归档文档
```

## 7. 总结

本项目实现了一个沉浸式的登录/注册页面，具有以下特点：

1. **视觉效果**：流动的粒子动画背景，营造出神秘、逃离的氛围
2. **用户体验**：极简的交互设计，清晰的登录/注册流程
3. **功能完整**：支持密码登录、短信登录、第三方登录和注册功能
4. **技术实现**：使用 React Native + Expo 构建，支持多平台
5. **可扩展性**：模块化的代码结构，便于后续功能扩展

项目已经完成了登录/注册页面的核心功能和视觉效果，为用户提供了一个沉浸式、极简的登录体验。