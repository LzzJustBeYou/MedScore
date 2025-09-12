import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scoreConfigs } from '../../configs/scoreConfigs';
import { badgeStyles, cardStyles, fontSizes, spacing } from '../../constants/CardStyles';

export default function ScoreScreen() {
  const insets = useSafeAreaInsets();
  
  const handleScoreTypeSelect = (scoreType: string) => {
    router.push({
      pathname: '/score/patient-info',
      params: {
        scoreType: scoreType
      }
    });
  };

  const renderScoreType = ({ item }: { item: typeof scoreConfigs[0] }) => (
    <TouchableOpacity
      style={styles.scoreTypeItem}
      onPress={() => handleScoreTypeSelect(item.id)}
    >
      <View style={styles.scoreTypeHeader}>
        <View style={styles.scoreTypeIcon}>
          <Ionicons name="calculator" size={24} color="#007AFF" />
        </View>
        <View style={styles.scoreTypeInfo}>
          <Text style={styles.scoreTypeName}>{item.name}</Text>
          <Text style={styles.scoreTypeDescription}>{item.description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </View>
      <View style={styles.scoreTypeFooter}>
        <Text style={styles.fieldCount}>
          {item.fields.length} 个评分项目
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" translucent={false} />
      <View style={styles.header}>
        <Text style={styles.title}>评分系统</Text>
        <Text style={styles.subtitle}>选择评分类型开始评估</Text>
      </View>

      <FlatList
        data={scoreConfigs}
        keyExtractor={(item) => item.id}
        renderItem={renderScoreType}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: spacing.xxl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: '#8E8E93',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: '#F2F2F7',
    flexGrow: 1,
  },
  scoreTypeItem: {
    ...cardStyles.standard,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  scoreTypeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  scoreTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  scoreTypeInfo: {
    flex: 1,
  },
  scoreTypeName: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  scoreTypeDescription: {
    fontSize: fontSizes.sm,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  scoreTypeFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  fieldCount: {
    ...badgeStyles.primary,
    fontSize: fontSizes.xs,
    color: '#007AFF',
    fontWeight: '500',
  },
});
