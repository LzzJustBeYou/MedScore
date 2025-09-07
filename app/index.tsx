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
import { SearchResult } from '../types';
import { database } from '../utils/database';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initDatabase();
  }, []);

  const initDatabase = async () => {
    try {
      await database.init();
    } catch (error) {
      Alert.alert('错误', '数据库初始化失败');
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
      const results = await database.searchRecords(searchQuery);
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

      setSearchResults(Array.from(patientMap.values()));
    } catch (error) {
      Alert.alert('错误', '搜索失败');
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
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButtonTextDisabled: {
    color: '#999',
  },
  loading: {
    marginTop: 50,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultContent: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  patientId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  recordCount: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 3,
  },
  lastRecord: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  },
  newRecordButton: {
    backgroundColor: '#34C759',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  newRecordButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});