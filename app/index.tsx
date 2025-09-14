import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { database } from '../utils/database';

export default function HomeScreen() {
  useEffect(() => {
    initDatabaseAndRedirect();
  }, []);

  const initDatabaseAndRedirect = async () => {
    try {
      console.log('首页：开始初始化数据库...');
      await database.init();
      console.log('首页：数据库初始化成功');
      
      // 数据库初始化完成后，立即导航到score页面
      router.replace('/(tabs)/score');
    } catch (error) {
      console.error('首页：数据库初始化失败:', error);
      // 即使数据库初始化失败，也导航到score页面
      router.replace('/(tabs)/score');
    }
  };

  // 只显示一个简单的加载指示器，用户几乎看不到
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
});