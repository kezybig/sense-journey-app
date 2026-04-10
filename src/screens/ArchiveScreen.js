import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';

export default function ArchiveScreen({ navigation }) {
  // 模拟数据
  const userStats = {
    escapeCount: 5,
    totalHours: 72,
    badges: [
      { id: 1, name: '断网大师', icon: '📵' },
      { id: 2, name: '自然探索者', icon: '🌿' },
      { id: 3, name: '茶道专家', icon: '🍵' },
      { id: 4, name: '日出观赏者', icon: '🌅' },
    ],
    pastJourneys: [
      {
        id: 1,
        date: '2026-04-01',
        title: '春日茶园之旅',
        duration: '2天',
        mood: '平静',
      },
      {
        id: 2,
        date: '2026-03-15',
        title: '山间冥想 retreat',
        duration: '3天',
        mood: '放松',
      },
      {
        id: 3,
        date: '2026-02-28',
        title: '海边日出之行',
        duration: '1天',
        mood: '活力',
      },
    ],
  };
  
  const [selectedBadge, setSelectedBadge] = useState(null);
  
  const handleShare = () => {
    // 模拟分享功能
    alert('分享到社交网络');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.backgroundGradient} />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>逃跑档案</Text>
        <Text style={styles.subtitle}>你的避世履历</Text>
        
        {/* 用户统计 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.escapeCount}</Text>
            <Text style={styles.statLabel}>逃离次数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.totalHours}</Text>
            <Text style={styles.statLabel}>避世总时长(小时)</Text>
          </View>
        </View>
        
        {/* 徽章展示 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>获得徽章</Text>
          <View style={styles.badgesContainer}>
            {userStats.badges.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={[
                  styles.badgeItem,
                  selectedBadge === badge.id && styles.badgeItemSelected
                ]}
                onPress={() => setSelectedBadge(badge.id)}
              >
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* 历史行程 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>历史行程</Text>
          {userStats.pastJourneys.map((journey) => (
            <View key={journey.id} style={styles.journeyItem}>
              <View style={styles.journeyInfo}>
                <Text style={styles.journeyDate}>{journey.date}</Text>
                <Text style={styles.journeyTitle}>{journey.title}</Text>
                <View style={styles.journeyDetails}>
                  <Text style={styles.journeyDetail}>{journey.duration}</Text>
                  <Text style={styles.journeyMood}>{journey.mood}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.journeyButton}>
                <Text style={styles.journeyButtonText}>查看详情</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        
        {/* 社交分享 */}
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Text style={styles.shareButtonText}>生成分享海报</Text>
        </TouchableOpacity>
        
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
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ced1',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 206, 209, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
    letterSpacing: 1,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  badgeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    width: '44%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeItemSelected: {
    backgroundColor: 'rgba(0, 206, 209, 0.15)',
    borderColor: '#00ced1',
  },
  badgeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  journeyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  journeyInfo: {
    flex: 1,
  },
  journeyDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 4,
  },
  journeyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  journeyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  journeyDetail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: 16,
  },
  journeyMood: {
    fontSize: 11,
    color: '#00ced1',
    backgroundColor: 'rgba(0, 206, 209, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 206, 209, 0.2)',
  },
  journeyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  journeyButtonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  shareButton: {
    backgroundColor: '#00ced1',
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#00ced1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  shareButtonText: {
    color: '#0a0a1a',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  backButton: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});