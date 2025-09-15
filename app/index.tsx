import { router } from 'expo-router';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { database } from '../utils/database';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<string | null>(null);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStatus, setUpdateStatus] = useState<'checking' | 'downloading' | 'ready' | 'error' | null>(null);
  const [showDebugButton, setShowDebugButton] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  // 启动动画
  const startAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 获取状态文本和图标
  const getStatusInfo = () => {
    switch (updateStatus) {
      case 'checking':
        return { text: '正在检查更新...', icon: '🔍', color: '#007AFF' };
      case 'downloading':
        return { text: '正在下载更新...', icon: '⬇️', color: '#34C759' };
      case 'ready':
        return { text: '更新准备就绪', icon: '✅', color: '#34C759' };
      case 'error':
        return { text: '更新检查失败', icon: '❌', color: '#FF3B30' };
      default:
        return { text: '正在启动应用...', icon: '🚀', color: '#007AFF' };
    }
  };

  useEffect(() => {
    startAnimation();
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

  // 优化的更新检查函数
  const checkForUpdates = async () => {
    try {
      setIsCheckingUpdate(true);
      setUpdateStatus('checking');
      setUpdateInfo('正在检查更新...');
      
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        setUpdateStatus('ready');
        setUpdateInfo('发现新版本！');
        
        // 使用更友好的更新对话框
        Alert.alert(
          '🎉 发现新版本',
          '我们为您准备了新版本，包含性能优化和功能改进。\n\n是否立即更新？',
          [
            {
              text: '稍后再说',
              style: 'cancel',
              onPress: () => {
                setUpdateInfo('继续使用当前版本...');
                setTimeout(() => {
                  router.replace('/(tabs)/score');
                }, 1000);
              }
            },
            {
              text: '立即更新',
              style: 'default',
              onPress: async () => {
                await downloadUpdate();
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        setUpdateInfo('应用已是最新版本');
        setTimeout(() => {
          router.replace('/(tabs)/score');
        }, 1000);
      }
    } catch (error) {
      setUpdateStatus('error');
      setUpdateInfo('更新检查失败，继续启动应用...');
      setTimeout(() => {
        router.replace('/(tabs)/score');
      }, 2000);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  // 下载更新函数
  const downloadUpdate = async () => {
    try {
      setUpdateStatus('downloading');
      setUpdateInfo('正在下载更新...');
      setUpdateProgress(0);
      
      // 模拟下载进度
      const progressInterval = setInterval(() => {
        setUpdateProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);
      
      await Updates.fetchUpdateAsync();
      
      clearInterval(progressInterval);
      setUpdateProgress(100);
      setUpdateStatus('ready');
      setUpdateInfo('更新下载完成！');
      
      Alert.alert(
        '✨ 更新完成',
        '新版本已准备就绪，重启应用即可体验最新功能。',
        [
          {
            text: '立即重启',
            onPress: () => {
              Updates.reloadAsync();
            }
          }
        ]
      );
    } catch (updateError) {
      setUpdateStatus('error');
      setUpdateInfo('更新下载失败，继续使用当前版本...');
      Alert.alert(
        '更新失败',
        '网络连接异常，将使用当前版本继续运行。',
        [{ text: '确定' }]
      );
      setTimeout(() => {
        router.replace('/(tabs)/score');
      }, 2000);
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* 应用图标和标题 */}
        <View style={styles.appHeader}>
          <Text style={styles.appIcon}>🏥</Text>
          <Text style={styles.title}>MedScore</Text>
          <Text style={styles.subtitle}>医疗评分助手</Text>
        </View>

        {/* 状态指示器 */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusIcon, { backgroundColor: statusInfo.color + '20' }]}>
            <Text style={styles.statusEmoji}>{statusInfo.icon}</Text>
          </View>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
          
          {/* 进度条 */}
          {updateStatus === 'downloading' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${updateProgress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{Math.round(updateProgress)}%</Text>
            </View>
          )}
        </View>

        {/* 加载指示器 */}
        {isCheckingUpdate && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={statusInfo.color} />
            <Text style={styles.loadingText}>{updateInfo}</Text>
          </View>
        )}
      </Animated.View>
      
      {/* 更新状态覆盖层 - 只在有更新时显示 */}
      {updateInfo && updateStatus && (
        <Modal
          transparent={true}
          visible={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalIcon}>{statusInfo.icon}</Text>
                <Text style={styles.modalTitle}>
                  {updateStatus === 'checking' ? '检查更新中' : 
                   updateStatus === 'downloading' ? '下载更新中' :
                   updateStatus === 'ready' ? '更新就绪' : '更新失败'}
                </Text>
              </View>
              
              <Text style={styles.modalText}>{updateInfo}</Text>
              
              {/* 进度条 */}
              {updateStatus === 'downloading' && (
                <View style={styles.modalProgressContainer}>
                  <View style={styles.modalProgressBar}>
                    <View 
                      style={[
                        styles.modalProgressFill, 
                        { width: `${updateProgress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.modalProgressText}>
                    {Math.round(updateProgress)}% 完成
                  </Text>
                </View>
              )}
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  content: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  appHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#8E8E93',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusEmoji: {
    fontSize: 32,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    margin: 20,
    alignItems: 'center',
    minWidth: width * 0.85,
    maxWidth: width * 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalProgressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  modalProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalProgressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  modalProgressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 12,
    fontWeight: '500',
  },
});