import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { database } from '../../utils/database';

interface PatientRecord {
  id: string;
  name: string;
  patientId: string;
  lastScoreDate: string;
  totalRecords: number;
}

export default function RecordsScreen() {
  const insets = useSafeAreaInsets();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    // 搜索过滤
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [patients, searchQuery]);

  const loadPatients = async () => {
    try {
      await database.init();
      const allPatients = await database.getAllPatients();
      
      // 转换为PatientRecord格式
      const patientList = allPatients.map(patient => ({
        id: patient.patientId,
        name: patient.patientName,
        patientId: patient.patientId,
        lastScoreDate: new Date().toISOString(), // 临时使用当前时间，后续可以从数据库获取
        totalRecords: patient.recordCount,
      }));
      
      setPatients(patientList);
      setFilteredPatients(patientList);
    } catch (error) {
      console.error('加载患者记录失败:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatients();
    setRefreshing(false);
  };

  const handlePatientPress = (patient: PatientRecord) => {
    router.push({
      pathname: '/records/patient-records',
      params: {
        patientId: patient.patientId,
        patientName: patient.name,
      },
    });
  };

  const handleDeletePatient = (patient: PatientRecord) => {
    Alert.alert(
      '删除患者',
      `确定要删除患者 "${patient.name}" 的所有记录吗？此操作不可恢复。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.init();
              // 获取患者的所有记录
              const records = await database.getPatientRecords(patient.patientId, patient.name);
              
              // 删除所有记录
              for (const record of records) {
                if (record.id) {
                  await database.deleteRecord(record.id);
                }
              }
              
              // 重新加载患者列表
              await loadPatients();
              Alert.alert('成功', '患者记录已删除');
            } catch (error) {
              console.error('删除患者记录失败:', error);
              Alert.alert('错误', '删除患者记录失败');
            }
          },
        },
      ]
    );
  };

  const handleClearAllRecords = () => {
    Alert.alert(
      '清除所有记录',
      '确定要清除所有评分记录吗？此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.init();
              // 这里需要添加清除所有记录的方法到数据库类
              // 暂时先清空本地状态
              setPatients([]);
              setFilteredPatients([]);
              Alert.alert('成功', '所有记录已清除');
            } catch (error) {
              Alert.alert('错误', '清除记录失败');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderPatientItem = ({ item }: { item: PatientRecord }) => (
    <TouchableOpacity style={styles.patientItem} onPress={() => handlePatientPress(item)}>
      <View style={styles.patientAvatar}>
        <Ionicons name="person" size={24} color="#007AFF" />
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientId}>ID: {item.patientId}</Text>
        <Text style={styles.lastScoreDate}>
          最新评分: {formatDate(item.lastScoreDate)}
        </Text>
      </View>
      <View style={styles.patientStats}>
        <Text style={styles.recordCount}>{item.totalRecords}</Text>
        <Text style={styles.recordLabel}>条记录</Text>
      </View>
      <View style={styles.patientActions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePatient(item)}
        >
          <Ionicons name="trash" size={18} color="#FF3B30" />
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="list" size={64} color="#C7C7CC" />
      <Text style={styles.emptyTitle}>暂无记录</Text>
      <Text style={styles.emptyDescription}>
        开始使用评分系统创建第一条记录
      </Text>
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => router.push('/(tabs)/score')}
      >
        <Text style={styles.startButtonText}>开始评分</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" translucent={false} />
      <View style={styles.header}>
        <Text style={styles.title}>患者记录</Text>
        <Text style={styles.subtitle}>管理所有患者评分记录</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索患者姓名或ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {filteredPatients.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredPatients}
          renderItem={renderPatientItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1C1C1E',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
  },
  patientItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  patientId: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  lastScoreDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  patientStats: {
    alignItems: 'center',
    marginRight: 12,
  },
  recordCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  recordLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  patientActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
