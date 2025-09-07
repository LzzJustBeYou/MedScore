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
      await database.init();
      await database.insertRecord({
        patientName: patientName,
        patientId: patientId,
        scoreType,
        formData,
        scoreResult: `${result} (${score}分)`
      });

      Alert.alert('成功', '评分记录已保存', [
        {
          text: '确定',
          onPress: () => router.replace('/')
        }
      ]);
    } catch (error) {
      Alert.alert('错误', '保存失败');
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
  resultCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreType: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  patientInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  patientText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 15,
    borderRadius: 8,
    marginLeft: 10,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});