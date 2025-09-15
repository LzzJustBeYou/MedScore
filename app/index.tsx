import { router } from 'expo-router';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { database } from '../utils/database';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<string | null>(null);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStatus, setUpdateStatus] = useState<'checking' | 'downloading' | 'ready' | 'error' | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  // 启动动画
  const startAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 获取状态信息
  const getStatusInfo = () => {
    switch (updateStatus) {
      case 'checking':
        return { text: '检查更新中', icon: '⏳', color: '#007AFF' };
      case 'downloading':
        return { text: '下载更新中', icon: '⬇️', color: '#34C759' };
      case 'ready':
        return { text: '更新就绪', icon: '✅', color: '#34C759' };
      case 'error':
        return { text: '更新失败', icon: '❌', color: '#FF3B30' };
      default:
        return { text: '正在启动', icon: '🚀', color: '#007AFF' };
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
      
      await checkForUpdates();
    } catch (error) {
      console.error('首页：数据库初始化失败:', error);
      router.replace('/(tabs)/score');
    }
  };

  // 更新检查函数
  const checkForUpdates = async () => {
    try {
      setIsCheckingUpdate(true);
      setUpdateStatus('checking');
      setUpdateInfo('正在检查更新...');
      
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        setUpdateStatus('ready');
        setUpdateInfo('发现新版本！');
        
        Alert.alert(
          '发现新版本',
          '我们为您准备了新版本，包含性能优化和功能改进。\n\n是否立即更新？',
          [
            {
              text: '稍后',
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
        '更新完成',
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* 主内容区域 */}
        <View style={styles.mainContent}>
          {/* 应用图标 */}
          <View style={styles.iconContainer}>
            <Image 
              source={require('../assets/images/icon.png')} 
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>
          
          {/* 应用标题 */}
          <Text style={styles.title}>MedScore</Text>
        </View>

        {/* 状态指示器 - 固定高度避免跳动 */}
        <View style={styles.statusSection}>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
          
          {/* 进度条 */}
          {updateStatus === 'downloading' && (
            <View style={styles.progressSection}>
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

        {/* 加载指示器 - 固定高度避免跳动 */}
        <View style={styles.loadingSection}>
          {isCheckingUpdate && (
            <>
              <ActivityIndicator size="small" color={statusInfo.color} />
              <Text style={styles.loadingText}>{updateInfo}</Text>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  appIcon: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1D1D1F',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  statusSection: {
    alignItems: 'center',
    width: '100%',
    minHeight: 60, // 固定最小高度
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  loadingSection: {
    minHeight: 40, // 固定最小高度
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#1D1D1F',
    marginLeft: 8,
    fontWeight: '500',
  },
});