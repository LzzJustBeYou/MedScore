import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { buttonStyles, cardStyles, fontSizes, spacing } from '../constants/CardStyles';
import { SearchResult } from '../types';
import { database } from '../utils/database';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initDatabase();
  }, []);

  useEffect(() => {
    // 数据库初始化完成后，自动导航到tabs
    const timer = setTimeout(() => {
      router.replace('/(tabs)/score');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const initDatabase = async () => {
    try {
      console.log('首页：开始初始化数据库...');
      await database.init();
      console.log('首页：数据库初始化成功');
    } catch (error) {
      console.error('首页：数据库初始化失败:', error);
      Alert.alert('错误', `数据库初始化失败: ${error}`);
    }
  };

  // 搜索函数
  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // 隐藏键盘
    Keyboard.dismiss();

    setIsLoading(true);
    try {
      console.log('开始搜索:', searchQuery);
      const results = await database.searchRecords(searchQuery);
      console.log('搜索结果:', results.length, '条记录');
      
      const patientMap = new Map<string, SearchResult>();

      results.forEach(record => {
        const key = `${record.patientName}-${record.patientId}`;
        if (!patientMap.has(key)) {
          patientMap.set(key, {
            patientName: record.patientName,
            patientId: record.patientId,
            recordCount: 0,
            lastRecordDate: record.createdAt
          });
        }
        const patient = patientMap.get(key)!;
        patient.recordCount++;
        if (!patient.lastRecordDate || record.createdAt! > patient.lastRecordDate) {
          patient.lastRecordDate = record.createdAt;
        }
      });

      const searchResults = Array.from(patientMap.values());
      console.log('处理后的搜索结果:', searchResults.length, '个患者');
      setSearchResults(searchResults);
    } catch (error) {
      console.error('搜索失败:', error);
      Alert.alert('错误', `搜索失败: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInput = (text: string) => {
    setSearchQuery(text);
    // 清空结果，等待用户点击搜索按钮
    if (!text.trim()) {
      setSearchResults([]);
    }
  };

  const handleSearch = () => {
    performSearch();
  };

  const handlePatientSelect = (patientId: string, patientName: string) => {
    router.push(`/records/patient-records?patientId=${patientId}&patientName=${patientName}`);
  };

  const handleNewRecord = () => {
    router.push('/score/score-types');
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handlePatientSelect(item.patientId, item.patientName)}
    >
      <View style={styles.resultContent}>
        <Text style={styles.patientName}>{item.patientName}</Text>
        <Text style={styles.patientId}>ID: {item.patientId}</Text>
        <Text style={styles.recordCount}>
          {item.recordCount} 条记录
        </Text>
        {item.lastRecordDate && (
          <Text style={styles.lastRecord}>
            最近记录: {new Date(item.lastRecordDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>临床监护评分系统</Text>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="输入患者姓名或ID"
            value={searchQuery}
            onChangeText={handleSearchInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={[styles.searchButton, !searchQuery.trim() && styles.searchButtonDisabled]} 
            onPress={handleSearch}
            disabled={!searchQuery.trim()}
          >
            <Text style={[styles.searchButtonText, !searchQuery.trim() && styles.searchButtonTextDisabled]}>
              搜索
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => `${item.patientName}-${item.patientId}`}
          renderItem={renderSearchResult}
          style={styles.resultsList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery ? '未找到相关患者' : '请输入患者信息并点击搜索'}
            </Text>
          }
        />
      )}

      <TouchableOpacity style={styles.newRecordButton} onPress={handleNewRecord}>
        <Text style={styles.newRecordButtonText}>新增评分记录</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    color: '#1C1C1E',
  },
  searchContainer: {
    marginBottom: spacing.xl,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'white',
    fontSize: fontSizes.md,
    color: '#1C1C1E',
  },
  searchButton: {
    ...buttonStyles.primary,
    minWidth: 80,
  },
  searchButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  searchButtonText: {
    color: 'white',
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  searchButtonTextDisabled: {
    color: '#8E8E93',
  },
  loading: {
    marginTop: 50,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    ...cardStyles.standard,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  resultContent: {
    flex: 1,
  },
  patientName: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: spacing.xs,
  },
  patientId: {
    fontSize: fontSizes.sm,
    color: '#8E8E93',
    marginBottom: spacing.xs,
  },
  recordCount: {
    fontSize: fontSizes.sm,
    color: '#007AFF',
    marginBottom: spacing.xs,
  },
  lastRecord: {
    fontSize: fontSizes.xs,
    color: '#8E8E93',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 50,
    fontSize: fontSizes.md,
  },
  newRecordButton: {
    ...buttonStyles.success,
    marginTop: spacing.xl,
  },
  newRecordButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});