import { StyleSheet } from 'react-native';

/**
 * 统一的卡片样式系统
 * 提供一致的圆角、阴影和过渡效果
 */

// 基础圆角尺寸
export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
} as const;

// 阴影配置
export const shadows = {
  // 轻微阴影 - 用于列表项
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  // 标准阴影 - 用于卡片
  standard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  // 强调阴影 - 用于重要卡片
  prominent: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  // 模态框阴影
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

// 统一的卡片样式
export const cardStyles = StyleSheet.create({
  // 基础卡片样式
  base: {
    backgroundColor: 'white',
    borderRadius: borderRadius.medium,
  },
  
  // 列表项卡片 - 轻微阴影
  listItem: {
    backgroundColor: 'white',
    borderRadius: borderRadius.medium,
    ...shadows.subtle,
  },
  
  // 标准卡片 - 标准阴影
  standard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.medium,
    ...shadows.standard,
  },
  
  // 重要卡片 - 强调阴影
  prominent: {
    backgroundColor: 'white',
    borderRadius: borderRadius.medium,
    ...shadows.prominent,
  },
  
  // 模态框卡片
  modal: {
    backgroundColor: 'white',
    borderRadius: borderRadius.large,
    ...shadows.modal,
  },
  
  // 小尺寸卡片
  small: {
    backgroundColor: 'white',
    borderRadius: borderRadius.small,
    ...shadows.subtle,
  },
  
  // 大尺寸卡片
  large: {
    backgroundColor: 'white',
    borderRadius: borderRadius.large,
    ...shadows.standard,
  },
});

// 按钮样式
export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: '#007AFF',
    borderRadius: borderRadius.small,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: '#F2F2F7',
    borderRadius: borderRadius.small,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  success: {
    backgroundColor: '#34C759',
    borderRadius: borderRadius.small,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  danger: {
    backgroundColor: '#FF3B30',
    borderRadius: borderRadius.small,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// 输入框样式
export const inputStyles = StyleSheet.create({
  standard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.small,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1C1C1E',
  },
  search: {
    backgroundColor: '#F2F2F7',
    borderRadius: borderRadius.small,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1C1C1E',
  },
});

// 徽章样式
export const badgeStyles = StyleSheet.create({
  primary: {
    backgroundColor: '#F0F8FF',
    borderRadius: borderRadius.small,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  success: {
    backgroundColor: '#E8F5E8',
    borderRadius: borderRadius.small,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  warning: {
    backgroundColor: '#FFF3CD',
    borderRadius: borderRadius.small,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  danger: {
    backgroundColor: '#F8D7DA',
    borderRadius: borderRadius.small,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});

// 头像样式
export const avatarStyles = StyleSheet.create({
  small: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  medium: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  large: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});

// 间距配置
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// 字体大小配置
export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
} as const;
