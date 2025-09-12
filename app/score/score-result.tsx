import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { buttonStyles, cardStyles, fontSizes, spacing } from '../../constants/CardStyles';
import { database } from '../../utils/database';

export default function ScoreResultScreen() {
  const { scoreType, score, result, description, formData, patientId, patientName } = useLocalSearchParams<{
    scoreType: string;
    score: string;
    result: string;
    description: string;
    formData: string;
    patientId?: string;
    patientName?: string;
  }>();

  const handleSave = async () => {
    if (!patientName || !patientId) {
      Alert.alert('错误', '缺少患者信息');
      return;
    }

    try {
      console.log('开始保存评分记录...');
      await database.init();
      console.log('数据库初始化成功');
      
      const recordId = await database.insertRecord({
        patientName: patientName,
        patientId: patientId,
        scoreType,
        formData,
        scoreResult: `${result} (${score}分)`
      });
      
      console.log('评分记录保存成功，ID:', recordId);

      Alert.alert('成功', '评分记录已保存', [
        {
          text: '确定',
          onPress: () => {
            // 清空导航堆栈并跳转到首页
            router.dismissAll();
            router.replace('/(tabs)/records');
          }
        }
      ]);
    } catch (error) {
      console.error('保存评分记录失败:', error);
      Alert.alert('错误', `保存失败: ${error}`);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>评分结果</Text>
      
      <View style={styles.resultCard}>
        <Text style={styles.scoreType}>{scoreType}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>总分</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>结果等级</Text>
          <Text style={styles.resultValue}>{result}</Text>
        </View>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>

      {/* 显示患者信息 */}
      {(patientName || patientId) && (
        <View style={styles.patientInfo}>
          <Text style={styles.sectionTitle}>患者信息</Text>
          <Text style={styles.patientText}>
            {patientName && `患者: ${patientName}`}
            {patientName && patientId && ' | '}
            {patientId && `ID: ${patientId}`}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存记录</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  resultCard: {
    ...cardStyles.prominent,
    padding: spacing.xl,
    marginBottom: spacing.xxxl,
  },
  scoreType: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1C1C1E',
    marginBottom: spacing.xl,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreLabel: {
    fontSize: fontSizes.sm,
    color: '#8E8E93',
    marginBottom: spacing.xs,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  resultLabel: {
    fontSize: fontSizes.sm,
    color: '#8E8E93',
    marginBottom: spacing.xs,
  },
  resultValue: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: '#34C759',
  },
  description: {
    fontSize: fontSizes.sm,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  patientInfo: {
    ...cardStyles.standard,
    padding: spacing.lg,
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: spacing.sm,
  },
  patientText: {
    fontSize: fontSizes.sm,
    color: '#8E8E93',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxxl,
  },
  cancelButton: {
    flex: 1,
    ...buttonStyles.danger,
    marginRight: spacing.md,
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    ...buttonStyles.success,
    marginLeft: spacing.md,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});