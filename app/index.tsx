import { router } from 'expo-router';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
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
      
      // 检查更新（更新检查会处理导航逻辑）
      await checkForUpdates();
    } catch (error) {
      console.error('首页：数据库初始化失败:', error);
      // 即使数据库初始化失败，也导航到score页面
      router.replace('/(tabs)/score');
    }
  };

  const checkForUpdates = async () => {
    try {
      console.log('检查应用更新...');
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        console.log('发现新版本，正在下载...');
        
        // 显示更新提示弹窗
        Alert.alert(
          '发现新版本',
          '检测到应用有新版本可用，是否立即更新？',
          [
            {
              text: '稍后更新',
              style: 'cancel',
              onPress: () => {
                console.log('用户选择稍后更新');
                // 继续正常流程
                router.replace('/(tabs)/score');
              }
            },
            {
              text: '立即更新',
              onPress: async () => {
                try {
                  console.log('用户选择立即更新，开始下载...');
                  await Updates.fetchUpdateAsync();
                  console.log('更新下载完成，正在重启应用...');
                  
                  // 显示更新完成提示
                  Alert.alert(
                    '更新完成',
                    '应用将重新启动以应用更新',
                    [
                      {
                        text: '确定',
                        onPress: () => {
                          Updates.reloadAsync();
                        }
                      }
                    ]
                  );
                } catch (updateError) {
                  console.error('更新下载失败:', updateError);
                  Alert.alert(
                    '更新失败',
                    '更新下载失败，请检查网络连接后重试',
                    [{ text: '确定' }]
                  );
                }
              }
            }
          ]
        );
      } else {
        console.log('应用已是最新版本');
        // 没有更新时直接继续
        router.replace('/(tabs)/score');
      }
    } catch (error) {
      console.error('检查更新失败:', error);
      // 更新检查失败不影响应用正常使用
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