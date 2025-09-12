import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { getScoreConfig } from '../../configs/scoreConfigs';
import { cardStyles, fontSizes, spacing } from '../../constants/CardStyles';
import { FormData } from '../../types';
import { database } from '../../utils/database';
import { ScoreCalculator } from '../../utils/scoreCalculator';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function ScoreFormScreen() {
  const { scoreType, patientId, patientName, editMode, recordId, formData: existingFormData } = useLocalSearchParams<{ 
    scoreType: string;
    patientId?: string;
    patientName?: string;
    editMode?: string;
    recordId?: string;
    formData?: string;
  }>();
  const [formData, setFormData] = useState<FormData>({});
  const [config, setConfig] = useState<any>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [currentField, setCurrentField] = useState<any>(null);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  
  // 用于管理输入框焦点
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});
  
  // 动画值 - 改为缩放和透明度动画
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (scoreType) {
      const scoreConfig = getScoreConfig(scoreType);
      if (scoreConfig) {
        setConfig(scoreConfig);
        
        // 如果是编辑模式，加载现有数据
        if (editMode === 'true' && existingFormData) {
          try {
            const parsedData = JSON.parse(existingFormData);
            setFormData(parsedData);
          } catch (error) {
            console.error('解析表单数据失败:', error);
          }
        }
      } else {
        Alert.alert('错误', '未找到评分配置');
        router.back();
      }
    }
  }, [scoreType, editMode, existingFormData]);

  // 选择框动画 - 使用缩放和淡入淡出效果
  useEffect(() => {
    if (showPicker) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showPicker]);

  const handleInputChange = (fieldId: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // 处理数字输入，根据字段类型区分整数和小数
  const handleNumberInputChange = (fieldId: string, text: string, numberType: 'integer' | 'decimal' = 'decimal') => {
    let filteredText: string;
    
    if (numberType === 'integer') {
      // 整数：只允许数字和负号
      filteredText = text.replace(/[^0-9-]/g, '');
    } else {
      // 小数：允许数字、小数点和负号
      filteredText = text.replace(/[^0-9.-]/g, '');
      
      // 确保只有一个小数点
      const parts = filteredText.split('.');
      if (parts.length > 2) {
        return; // 不允许多个小数点
      }
    }
    
    // 确保负号只在开头
    if (filteredText.includes('-') && !filteredText.startsWith('-')) {
      return;
    }
    
    // 如果输入为空或只有负号，设置为空字符串
    if (filteredText === '' || filteredText === '-') {
      handleInputChange(fieldId, '');
      return;
    }
    
    // 对于小数输入，允许输入过程中的中间状态（如 "3." 或 "3.1"）
    if (numberType === 'decimal') {
      // 直接保存过滤后的文本，允许输入过程中的状态
      handleInputChange(fieldId, filteredText);
    } else {
      // 整数：转换为数字
      const numValue = parseInt(filteredText, 10);
      if (!isNaN(numValue)) {
        handleInputChange(fieldId, numValue);
      } else {
        handleInputChange(fieldId, filteredText);
      }
    }
  };

  const handleSubmit = async () => {
    if (!config) return;

    // 隐藏键盘
    Keyboard.dismiss();

    // 清理和转换数据
    const cleanedFormData = { ...formData };
    config.fields.forEach((field: any) => {
      if (field.type === 'number' && cleanedFormData[field.id]) {
        const value = cleanedFormData[field.id];
        if (typeof value === 'string') {
          // 如果是字符串，尝试转换为数字
          const numValue = field.numberType === 'integer' ? parseInt(value, 10) : parseFloat(value);
          if (!isNaN(numValue)) {
            cleanedFormData[field.id] = numValue;
          }
        }
      }
    });

    // 验证必填字段
    const missingFields = config.fields.filter(
      (field: any) => field.required && (!cleanedFormData[field.id] || cleanedFormData[field.id] === '')
    );

    if (missingFields.length > 0) {
      Alert.alert('验证失败', `请填写必填字段: ${missingFields.map((f: any) => f.label).join(', ')}`);
      return;
    }

    // 计算评分
    const result = ScoreCalculator.calculateScore(config, cleanedFormData);
    
    if (editMode === 'true' && recordId) {
      // 编辑模式：更新记录
      try {
        await database.init();
        await database.updateRecord(Number(recordId), {
          formData: JSON.stringify(cleanedFormData),
          scoreResult: `${result.result} (${result.score}分)`,
          updatedAt: new Date().toISOString()
        });
        
        Alert.alert('成功', '记录已更新', [
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
        Alert.alert('错误', '更新失败');
      }
    } else {
      // 新建模式：跳转到结果页面
      router.push({
        pathname: '/score/score-result',
        params: {
          scoreType: config.name,
          score: result.score.toString(),
          result: result.result,
          description: result.description || '',
          formData: JSON.stringify(cleanedFormData),
          patientId: patientId || '',
          patientName: patientName || ''
        }
      });
    }
  };

  const showPickerModal = (field: any, fieldIndex: number) => {
    // 隐藏键盘
    Keyboard.dismiss();
    setCurrentField(field);
    setCurrentFieldIndex(fieldIndex);
    setShowPicker(true);
  };

  const handlePickerSelect = (value: any) => {
    if (currentField) {
      handleInputChange(currentField.id, value);
    }
    setShowPicker(false);
    setCurrentField(null);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // 处理输入框的下一步按钮
  const handleInputSubmit = (fieldIndex: number) => {
    const textFields = config?.fields.filter((field: any) => 
      field.type === 'text' || field.type === 'number'
    ) || [];
    
    if (fieldIndex < textFields.length - 1) {
      // 聚焦到下一个文本输入框
      const nextField = textFields[fieldIndex + 1];
      inputRefs.current[nextField.id]?.focus();
    } else {
      // 如果是最后一个输入框，隐藏键盘
      Keyboard.dismiss();
    }
  };

  const renderField = (field: any, fieldIndex: number) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'number':
        const textFieldIndex = config?.fields
          .filter((f: any) => f.type === 'text' || f.type === 'number')
          .findIndex((f: any) => f.id === field.id) || 0;
          
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
              {field.unit && <Text style={styles.unit}> ({field.unit})</Text>}
            </Text>
            <TextInput
              ref={(ref) => {
                inputRefs.current[field.id] = ref;
              }}
              style={styles.input}
              placeholder={`请输入${field.label}`}
              value={value.toString()}
              onChangeText={(text) => {
                if (field.type === 'number') {
                  const numberType = (field as any).numberType || 'decimal';
                  handleNumberInputChange(field.id, text, numberType);
                } else {
                  handleInputChange(field.id, text);
                }
              }}
              keyboardType={field.type === 'number' ? 
                ((field as any).numberType === 'integer' ? 'numeric' : 'decimal-pad') : 
                'default'}
              returnKeyType={textFieldIndex === config?.fields.filter((f: any) => f.type === 'text' || f.type === 'number').length - 1 ? 'done' : 'next'}
              onSubmitEditing={() => handleInputSubmit(textFieldIndex)}
              blurOnSubmit={false}
              multiline={false}
              numberOfLines={1}
            />
          </View>
        );

      case 'select':
        const selectedOption = field.options?.find((opt: any) => opt.value === value);
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => showPickerModal(field, fieldIndex)}
            >
              <Text style={[styles.pickerButtonText, !value && styles.placeholderText]}>
                {selectedOption ? selectedOption.label : `请选择${field.label}`}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        );

      case 'radio':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              {field.label}
              {field.required && <Text style={styles.required}> *</Text>}
            </Text>
            <View style={styles.radioGroup}>
              {field.options?.map((option: any) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioOption}
                  onPress={() => handleInputChange(field.id, option.value)}
                >
                  <View style={styles.radioCircle}>
                    {value === option.value && <View style={styles.radioSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (!config) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          <ScrollView 
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                {config.name}
              </Text>
              <Text style={styles.description}>{config.description}</Text>
              {/* 简化的患者信息显示 */}
              {(patientName || patientId) && (
                <Text style={styles.patientInfo}>
                  {patientName && `患者: ${patientName}`}
                  {patientName && patientId && ' | '}
                  {patientId && `ID: ${patientId}`}
                </Text>
              )}
            </View>

            <View style={styles.form}>
              {config.fields.map((field: any, index: number) => renderField(field, index))}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {editMode === 'true' ? '更新评分' : '计算评分'}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* 选择器模态框 - 从中心弹出，无回弹效果 */}
          <Modal
            visible={showPicker}
            transparent={true}
            animationType="none"
            onRequestClose={() => setShowPicker(false)}
            statusBarTranslucent={true}
          >
            <Animated.View 
              style={[
                styles.modalOverlay,
                {
                  opacity: fadeAnim,
                }
              ]}
            >
              <Animated.View 
                style={[
                  styles.modalContent,
                  {
                    transform: [{ scale: scaleAnim }],
                  }
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {currentField?.label || '请选择'}
                  </Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowPicker(false)}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  style={styles.modalOptions}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  {currentField?.options?.map((option: any, index: number) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.modalOption,
                        index === currentField?.options?.length - 1 && styles.modalOptionLast
                      ]}
                      onPress={() => handlePickerSelect(option.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalOptionText}>{option.label}</Text>
                      {formData[currentField?.id] === option.value && (
                        <View style={styles.modalOptionCheck}>
                          <Text style={styles.modalOptionCheckText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            </Animated.View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  titleContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
  },
  patientInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  unit: {
    color: '#666',
    fontSize: 14,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    height: 50,
    textAlignVertical: 'center',
  },
  pickerButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#666',
  },
  radioGroup: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    margin: 20,
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 模态框样式 - 从中心弹出
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    ...cardStyles.modal,
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: fontSizes.md,
    color: '#8E8E93',
    fontWeight: 'bold',
  },
  modalOptions: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionLast: {
    borderBottomWidth: 0,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  modalOptionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOptionCheckText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
});