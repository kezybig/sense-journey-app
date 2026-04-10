# 登录/注册页面 (PortalScreen) 实现归档

## 设计理念

### 1. 沉浸式背景
- **背景色**：使用深蓝色 (#1a1a2e) 作为主背景，营造深度和宁静感
- **粒子效果**：添加20个金色粒子，随机分布在屏幕上，增强视觉层次感
- **整体氛围**：创造出一种逃离喧嚣、进入宁静空间的感觉

### 2. 极简交互
- **Logo**：小巧的 "SJ" 抽象符号，位于页面顶部，简洁优雅
- **问候语**："READY TO ESCAPE THE NOISE?" 直接击中用户痛点
- **输入框**：微光输入线设计，随着用户触摸而变色，没有边框，保持极简风格
- **行动按钮**："LAUNCH YOUR ESCAPE" 作为主按钮，带有阴影效果，突出视觉焦点
- **替代选项**："FIRST TIME? CREATE A CAPSULE" 链接和第三方登录图标，设计成与背景融合的微光符号

## 技术实现

### 1. 页面结构
```jsx
<View style={styles.container}>
  {/* 背景粒子效果 */}
  {renderParticles()}
  
  {/* 背景渐变 */}
  <View style={styles.backgroundGradient} />
  
  <View style={styles.content}>
    {/* Logo */}
    <View style={styles.logo}>
      <Text style={styles.logoText}>SJ</Text>
    </View>
    
    {/* 问候语 */}
    <Text style={styles.greeting}>READY TO ESCAPE THE NOISE?</Text>
    
    {/* 表单 */}
    <View style={styles.form}>
      {/* Email 输入框 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, isFocused.email && styles.inputFocused]}
          placeholder="Email or Phone"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setIsFocused({ ...isFocused, email: true })}
          onBlur={() => setIsFocused({ ...isFocused, email: false })}
        />
        <View style={[styles.inputLine, isFocused.email && styles.inputLineFocused]} />
      </View>
      
      {/* 密码输入框 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, isFocused.password && styles.inputFocused]}
          placeholder="Password"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onFocus={() => setIsFocused({ ...isFocused, password: true })}
          onBlur={() => setIsFocused({ ...isFocused, password: false })}
        />
        <View style={[styles.inputLine, isFocused.password && styles.inputLineFocused]} />
      </View>
      
      {/* 主按钮 */}
      <TouchableOpacity 
        style={styles.mainButton} 
        onPress={handleLogin}
        activeOpacity={0.8}
      >
        <Text style={styles.mainButtonText}>LAUNCH YOUR ESCAPE</Text>
      </TouchableOpacity>
      
      {/* 创建账户链接 */}
      <TouchableOpacity onPress={handleCreateAccount}>
        <Text style={styles.createAccountText}>FIRST TIME? CREATE A CAPSULE</Text>
      </TouchableOpacity>
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
```

### 2. 核心功能
- **状态管理**：使用 useState 管理输入框内容和焦点状态
- **粒子效果**：通过 map 函数生成随机分布的粒子
- **输入框交互**：根据焦点状态改变输入线颜色
- **登录/注册逻辑**：模拟登录和创建账户功能，跳转到主控台页面

### 3. 样式设计
- **颜色方案**：深蓝色背景 (#1a1a2e)，紫色主按钮 (#6a1b9a)，金色粒子 (rgba(255, 215, 0, 0.6))
- **字体**：无衬线字体，简洁现代
- **布局**：居中布局，垂直排列，适当的间距和留白
- **响应式**：适配不同屏幕尺寸

## 问题修复

### 1. 点击输入框跳转到黑屏
- **原因**：Animated.View 在 Web 平台上与 TextInput 存在兼容性问题
- **解决方案**：将 Animated.View 替换为普通的 View 组件，移除可能导致问题的动画代码

### 2. Web 平台兼容性
- **原因**：某些 React Native 动画特性在 Web 平台上不被支持
- **解决方案**：简化动画效果，使用 Web 平台支持的组件和样式

### 3. 性能优化
- **原因**：粒子动画可能影响性能
- **解决方案**：减少粒子数量，使用更简单的实现方式

## 后续优化方向

1. **添加真实的登录/注册逻辑**：连接后端 API
2. **增强动画效果**：在移动平台上使用更丰富的动画
3. **添加表单验证**：确保输入数据的有效性
4. **优化响应式设计**：适配更多屏幕尺寸
5. **添加国际化支持**：支持多语言

## 技术栈

- **前端框架**：React Native + Expo
- **状态管理**：React useState
- **样式**：React Native StyleSheet
- **导航**：React Navigation

## 运行方式

```bash
# 启动开发服务器
npx expo start --web --port 8082

# 在浏览器中访问
http://localhost:8082
```