import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { scoreConfigs } from '../../configs/scoreConfigs';

export default function ScoreTypesScreen() {
  const { patientId, patientName } = useLocalSearchParams<{
    patientId?: string;
    patientName?: string;
  }>();

  const handleScoreTypeSelect = (scoreType: string) => {
    // 如果有患者信息，直接跳转到评分表单
    if (patientId && patientName) {
      router.push({
        pathname: '/score/score-form',
        params: {
          scoreType: scoreType,
          patientId: patientId,
          patientName: patientName
        }
      });
    } else {
      // 没有患者信息，跳转到患者信息输入页面
      router.push({
        pathname: '/score/patient-info',
        params: {
          scoreType: scoreType
        }
      });
    }
  };

  const renderScoreType = ({ item }: { item: typeof scoreConfigs[0] }) => (
    <TouchableOpacity
      style={styles.scoreTypeItem}
      onPress={() => handleScoreTypeSelect(item.id)}
    >
      <Text style={styles.scoreTypeName}>{item.name}</Text>
      <Text style={styles.scoreTypeDescription}>{item.description}</Text>
      <Text style={styles.fieldCount}>
        {item.fields.length} 个评分项目
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>选择评分系统</Text>
        
        <FlatList
          data={scoreConfigs}
          keyExtractor={(item) => item.id}
          renderItem={renderScoreType}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  list: {
    flex: 1,
  },
  scoreTypeItem: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreTypeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  scoreTypeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  fieldCount: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});