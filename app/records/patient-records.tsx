import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { badgeStyles, cardStyles, fontSizes, spacing } from '../../constants/CardStyles';
import { ScoringRecord } from '../../types';
import { database } from '../../utils/database';
import { formatDateTime } from '../../utils/dateUtils';

export default function PatientRecordsScreen() {
  const { patientId, patientName: urlPatientName } = useLocalSearchParams<{ 
    patientId: string;
    patientName?: string;
  }>();
  const [records, setRecords] = useState<ScoringRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [patientName, setPatientName] = useState(urlPatientName || '');

  useEffect(() => {
    loadRecords();
  }, [patientId]);

  const loadRecords = async () => {
    if (!patientId) return;

    try {
      await database.init();
      
      if (patientName) {
        // 如果已经有患者姓名，按ID和姓名精确查询
        const patientRecords = await database.getPatientRecords(patientId, patientName);
        setRecords(patientRecords);
      } else {
        // 如果没有患者姓名，先按ID查询所有记录
        const allRecords = await database.getPatientRecords(patientId);
        
        if (allRecords.length > 0) {
          // 按患者姓名分组，只显示第一个姓名的记录
          const firstPatientName = allRecords[0].patientName;
          const filteredRecords = allRecords.filter(record => record.patientName === firstPatientName);
          
          setRecords(filteredRecords);
          setPatientName(firstPatientName);
        } else {
          setRecords([]);
        }
      }
    } catch (error) {
      Alert.alert('错误', '加载记录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = (recordId: number) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条记录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.deleteRecord(recordId);
              await loadRecords();
            } catch (error) {
              Alert.alert('错误', '删除失败');
            }
          }
        }
      ]
    );
  };

  const handleViewRecord = (record: ScoringRecord) => {
    router.push({
      pathname: '/records/record-detail',
      params: {
        recordId: record.id?.toString() || '',
        patientName: record.patientName,
        patientId: record.patientId,
        scoreType: record.scoreType,
        scoreResult: record.scoreResult,
        formData: record.formData,
        createdAt: record.createdAt || ''
      }
    });
  };

  const handleAddNewRecord = () => {
    // 直接跳转到评分类型选择，并传递患者信息
    router.push({
      pathname: '/score/score-types',
      params: {
        patientId: patientId,
        patientName: patientName
      }
    });
  };

  const renderRecord = ({ item }: { item: ScoringRecord }) => (
    <TouchableOpacity
      style={styles.recordItem}
      onPress={() => handleViewRecord(item)}
      activeOpacity={0.7}
    >
      {/* 重新设计的卡片头部 - 垂直布局避免溢出 */}
      <View style={styles.recordHeader}>
        <View style={styles.scoreInfo}>
          <Text style={styles.scoreType}>{item.scoreType}</Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>{item.scoreResult}</Text>
          </View>
        </View>
        <Text style={styles.createdAt}>
          {formatDateTime(item.createdAt)}
        </Text>
      </View>

      {/* 操作按钮 */}
      <View style={styles.recordActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewRecord(item)}
        >
          <Text style={styles.viewButtonText}>查看详情</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteRecord(item.id!)}
        >
          <Text style={styles.deleteButtonText}>删除</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>暂无评分记录</Text>
      <Text style={styles.emptyDescription}>
        该患者还没有任何评分记录
      </Text>
      <TouchableOpacity style={styles.addFirstRecordButton} onPress={handleAddNewRecord}>
        <Text style={styles.addFirstRecordButtonText}>添加第一条记录</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 极简头部设计 */}
      {patientName && (
        <View style={styles.headerContainer}>
          <View style={styles.patientCard}>
            <Text style={styles.patientName} numberOfLines={1}>
              {patientName}
            </Text>
            <View style={styles.patientMeta}>
              <Text style={styles.patientId}>ID: {patientId}</Text>
              <View style={styles.divider} />
              <Text style={styles.recordCount}>{records.length} 条记录</Text>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={records}
        keyExtractor={(item) => item.id?.toString() || ''}
        renderItem={renderRecord}
        style={styles.recordsList}
        contentContainerStyle={[
          styles.recordsListContent,
          records.length === 0 && styles.emptyListContainer
        ]}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
      />

      {/* 底部新增记录按钮 */}
      {records.length > 0 && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity style={styles.addRecordButton} onPress={handleAddNewRecord}>
            <Text style={styles.addRecordButtonText}>新增评分记录</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.md,
    color: '#8E8E93',
  },
  
  // 极简头部设计
  headerContainer: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: '#F8F9FA',
  },
  patientCard: {
    ...cardStyles.listItem,
    padding: spacing.lg,
  },
  patientName: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: spacing.sm,
  },
  patientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientId: {
    fontSize: fontSizes.xs,
    color: '#8E8E93',
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: spacing.md,
    backgroundColor: '#E5E5EA',
    marginHorizontal: spacing.md,
  },
  recordCount: {
    fontSize: fontSizes.xs,
    color: '#007AFF',
    fontWeight: '600',
  },

  // 记录列表
  recordsList: {
    flex: 1,
  },
  recordsListContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyListContainer: {
    flex: 1,
  },
  
  // 重新设计的记录卡片 - 移除冗余ID信息
  recordItem: {
    ...cardStyles.standard,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  recordHeader: {
    marginBottom: spacing.lg,
  },
  scoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  scoreType: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: spacing.md,
  },
  scoreBadge: {
    ...badgeStyles.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  scoreBadgeText: {
    fontSize: fontSizes.sm,
    color: '#34C759',
    fontWeight: '600',
  },
  createdAt: {
    fontSize: fontSizes.sm,
    color: '#8E8E93',
    marginBottom: spacing.sm,
  },
  recordActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  viewButton: {
    backgroundColor: '#F0F8FF',
  },
  viewButtonText: {
    fontSize: fontSizes.xs,
    color: '#007AFF',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#F8D7DA',
  },
  deleteButtonText: {
    fontSize: fontSizes.xs,
    color: '#FF3B30',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  addFirstRecordButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addFirstRecordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 34, // 为安全区域留出空间
    backgroundColor: '#f8f9fa',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5e7',
  },
  addRecordButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addRecordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});