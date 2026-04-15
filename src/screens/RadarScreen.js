import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Platform } from 'react-native';

export default function RadarScreen({ navigation, route }) {
  // 状态管理
  const [countdown, setCountdown] = useState(86400); // 24小时倒计时
  const [showSOS, setShowSOS] = useState(false);
  const [journeyPhase, setJourneyPhase] = useState('preparing'); // preparing, ongoing, completed
  const uid = route.params?.uid;
  
  // 动画值
  const pulseAnim = new Animated.Value(1);
  
  useEffect(() => {
    // 启动脉冲动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // 倒计时逻辑
    if (journeyPhase === 'preparing') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            setJourneyPhase('ongoing');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [journeyPhase]);
  
  // 格式化倒计时
  const formatCountdown = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${days}天 ${hours}小时 ${minutes}分钟 ${secs}秒`;
  };
  
  // 切换SOS模式
  const toggleSOS = () => {
    setShowSOS(!showSOS);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>动态雷达</Text>
        <Text style={styles.subtitle}>行程追踪中</Text>
        {uid && <Text style={styles.uidText}>用户：{uid}</Text>}
        
        {/* 雷达区域 */}
        <View style={styles.radarContainer}>
          <Animated.View 
            style={[
              styles.radarPulse,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0.6, 0]
                })
              }
            ]}
          />
          <View style={styles.radarCenter}>
            <View style={styles.radarInnerRing}>
              <Text style={styles.radarText}>
                {journeyPhase === 'preparing' ? '准备中' : 
                 journeyPhase === 'ongoing' ? '进行中' : '已完成'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* 行程信息 */}
        <View style={styles.infoSection}>
          {journeyPhase === 'preparing' ? (
            <>
              <Text style={styles.infoTitle}>出发倒计时</Text>
              <Text style={styles.countdownText}>{formatCountdown(countdown)}</Text>
              
              <Text style={styles.infoTitle}>打包指南</Text>
              <View style={styles.guideContainer}>
                <Text style={styles.guideText}>• 带一件防风外套</Text>
                <Text style={styles.guideText}>• 舒适的步行鞋</Text>
                <Text style={styles.guideText}>• 个人洗漱用品</Text>
                <Text style={styles.guideText}>• 充电宝</Text>
              </View>
            </>
          ) : journeyPhase === 'ongoing' ? (
            <>
              <Text style={styles.infoTitle}>当前位置</Text>
              <Text style={styles.locationText}>神秘目的地</Text>
              
              <Text style={styles.infoTitle}>下一站</Text>
              <Text style={styles.nextStopText}>正在解锁...</Text>
              
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navButtonText}>导航前往</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.infoTitle}>行程完成</Text>
              <Text style={styles.completedText}>感谢您的使用，期待下次相遇</Text>
            </>
          )}
        </View>
        
        {/* SOS按钮 */}
        <TouchableOpacity 
          style={styles.sosButton} 
          onPress={toggleSOS}
          activeOpacity={0.8}
        >
          <Text style={styles.sosButtonText}>SOS</Text>
        </TouchableOpacity>
        
        {/* SOS内容 */}
        {showSOS && (
          <View style={styles.sosContent}>
            <Text style={styles.sosTitle}>行程明细</Text>
            <Text style={styles.sosText}>目的地：莫干山民宿</Text>
            <Text style={styles.sosText}>住宿：云顶山庄</Text>
            <Text style={styles.sosText}>餐饮：山景餐厅</Text>
            <Text style={styles.sosText}>活动：森林徒步、茶道体验</Text>
          </View>
        )}
        
        {/* 返回按钮 */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('LaunchPad')}
        >
          <Text style={styles.backButtonText}>返回主控台</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
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
  contentContainer: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 20,
  },
  uidText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 20,
    textAlign: 'center',
  },
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    marginBottom: 20,
  },
  radarPulse: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(0, 206, 209, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 209, 0.4)',
  },
  radarCenter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  radarInnerRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
    borderWidth: 2,
    borderColor: '#00ced1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00ced1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  radarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countdownText: {
    fontSize: 20,
    color: '#00ced1',
    fontWeight: 'bold',
    marginBottom: 24,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  guideContainer: {
    marginTop: 8,
  },
  guideText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  nextStopText: {
    fontSize: 18,
    color: '#00ced1',
    marginBottom: 24,
  },
  navButton: {
    backgroundColor: '#00ced1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#00ced1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navButtonText: {
    color: '#0a0a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedText: {
    fontSize: 18,
    color: '#ffffff',
    lineHeight: 28,
  },
  sosButton: {
    position: 'absolute',
    right: 24,
    top: 24,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(211, 47, 47, 0.2)',
    borderWidth: 1,
    borderColor: '#d32f2f',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  sosButtonText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sosContent: {
    backgroundColor: 'rgba(211, 47, 47, 0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.2)',
  },
  sosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 16,
  },
  sosText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 10,
    lineHeight: 20,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 30,
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});