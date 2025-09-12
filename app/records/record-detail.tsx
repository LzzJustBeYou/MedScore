import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getScoreConfig } from '../../configs/scoreConfigs';
import { badgeStyles, cardStyles, fontSizes, spacing } from '../../constants/CardStyles';
import { database } from '../../utils/database';
import { formatDateTime } from '../../utils/dateUtils';

export default function RecordDetailScreen() {
  const {
    recordId,
    patientName,
    patientId,
    scoreType,
    scoreResult,
    formData,
    createdAt
  } = useLocalSearchParams<{
    recordId: string;
    patientName: string;
    patientId: string;
    scoreType: string;
    scoreResult: string;
    formData: string;
    createdAt: string;
  }>();

  const [parsedFormData, setParsedFormData] = useState<any>({});

  React.useEffect(() => {
    try {
      const data = JSON.parse(formData);
      setParsedFormData(data);
    } catch (error) {
      console.error('解析表单数据失败:', error);
    }
  }, [formData]);

  // 获取评分配置 - 支持通过 id 或 name 查找
  const scoreConfig = React.useMemo(() => {
    // 首先尝试通过 id 查找
    let config = getScoreConfig(scoreType);
    
    // 如果没找到，尝试通过 name 查找
    if (!config) {
      const { scoreConfigs } = require('../../configs/scoreConfigs');
      config = scoreConfigs.find((c: any) => c.name === scoreType);
    }
    
    return config;
  }, [scoreType]);

  // 添加调试信息
  React.useEffect(() => {
    console.log('scoreType:', scoreType);
    console.log('scoreConfig:', scoreConfig);
    console.log('parsedFormData:', parsedFormData);
  }, [scoreType, scoreConfig, parsedFormData]);

  const handleEditRecord = () => {
    // 导航到编辑页面，传递当前记录的所有数据
    router.push({
      pathname: '/score/score-form',
      params: {
        editMode: 'true',
        recordId: recordId,
        patientId: patientId,
        patientName: patientName,
        scoreType: scoreType,
        formData: formData,
        scoreResult: scoreResult
      }
    });
  };

  const handleDeleteRecord = () => {
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
              await database.init();
              await database.deleteRecord(Number(recordId));
              Alert.alert('成功', '记录已删除', [
                {
                  text: '确定',
                  onPress: () => router.push(`/records/patient-records?patientId=${patientId}`)
                }
              ]);
            } catch (error) {
              Alert.alert('错误', '删除失败');
            }
          }
        }
      ]
    );
  };

  // 获取字段的中文标签和单位
  const getFieldInfo = (fieldId: string) => {
    if (!scoreConfig) {
      console.log('scoreConfig not found for fieldId:', fieldId);
      return { label: fieldId, unit: '' };
    }
    
    const field = scoreConfig.fields.find(f => f.id === fieldId);
    console.log('field found for', fieldId, ':', field);
    return {
      label: field?.label || fieldId,
      unit: field?.unit || ''
    };
  };

  // 获取选择字段的中文值
  const getSelectFieldValue = (fieldId: string, value: any) => {
    if (!scoreConfig) return String(value);
    
    const field = scoreConfig.fields.find(f => f.id === fieldId);
    if (field?.type === 'select' && field.options) {
      const option = field.options.find(opt => opt.value === value);
      console.log('select field', fieldId, 'value', value, 'option found:', option);
      return option?.label || String(value);
    }
    return String(value);
  };

  const renderFormField = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') return null;

    const fieldInfo = getFieldInfo(key);
    const displayValue = getSelectFieldValue(key, value);
    const unit = fieldInfo.unit || '';

    return (
      <View key={key} style={styles.formField}>
        <Text style={styles.fieldLabel}>{fieldInfo.label}</Text>
        <Text style={styles.fieldValue}>
          {Array.isArray(value) ? value.join(', ') : displayValue}
          {unit && <Text style={styles.unitText}> {unit}</Text>}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* 患者信息 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>患者信息</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>姓名</Text>
                <Text style={styles.infoValue}>{patientName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>患者ID</Text>
                <Text style={styles.infoValue}>{patientId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>记录时间</Text>
                <Text style={styles.infoValue}>
                  {formatDateTime(createdAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* 评分信息 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>评分信息</Text>
            <View style={styles.scoreCard}>
              <View style={styles.scoreHeader}>
                <Text style={styles.scoreType}>{scoreType}</Text>
                <View style={styles.scoreResultBadge}>
                  <Text style={styles.scoreResultText}>{scoreResult}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 表单数据 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>详细数据</Text>
            <View style={styles.formCard}>
              {Object.entries(parsedFormData).map(([key, value]) =>
                renderFormField(key, value)
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作按钮 */}
      <View style={styles.bottomActionSection}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={handleEditRecord}
        >
          <Text style={styles.editButtonText}>编辑记录</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDeleteRecord}
        >
          <Text style={styles.deleteButtonText}>删除记录</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100, // 为底部按钮留出空间
  },
  bottomActionSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 34, // 为安全区域留出空间
    backgroundColor: '#f8f9fa',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5e7',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  infoCard: {
    ...cardStyles.standard,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E7',
  },
  infoLabel: {
    fontSize: fontSizes.sm,
    color: '#8E8E93',
    fontWeight: '400',
  },
  infoValue: {
    fontSize: fontSizes.sm,
    color: '#1C1C1E',
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.lg,
  },
  scoreCard: {
    ...cardStyles.standard,
    padding: spacing.lg,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreType: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  scoreResultBadge: {
    ...badgeStyles.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  scoreResultText: {
    fontSize: fontSizes.sm,
    color: 'white',
    fontWeight: '600',
  },
  formCard: {
    ...cardStyles.standard,
    overflow: 'hidden',
  },
  formField: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e7',
  },
  fieldLabel: {
    fontSize: 13,
    color: '#6e6e73',
    fontWeight: '400',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1d1d1f',
    fontWeight: '400',
    lineHeight: 22,
  },
  unitText: {
    fontSize: 14,
    color: '#6e6e73',
    fontWeight: '400',
  },
});
