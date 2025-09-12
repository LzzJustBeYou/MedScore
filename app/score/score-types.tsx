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
import { cardStyles, fontSizes, spacing } from '../../constants/CardStyles';

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
      style={[cardStyles.standard, styles.scoreTypeItem]}
      onPress={() => handleScoreTypeSelect(item.id)}
      activeOpacity={0.7}
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
        <FlatList
          data={scoreConfigs}
          keyExtractor={(item) => item.id}
          renderItem={renderScoreType}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  backButtonText: {
    fontSize: fontSizes.md,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    color: '#1C1C1E',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  scoreTypeItem: {
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  scoreTypeName: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  scoreTypeDescription: {
    fontSize: fontSizes.sm,
    color: '#8E8E93',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  fieldCount: {
    fontSize: fontSizes.xs,
    color: '#007AFF',
    fontWeight: '500',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
});