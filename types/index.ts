// 数据库记录类型
export interface ScoringRecord {
  id?: number;
  patientName: string;
  patientId: string;
  scoreType: string;
  formData: string; // JSON 字符串
  scoreResult: string;
  createdAt: string;
  updatedAt?: string; // 可选字段
}

// 表单字段类型
export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'radio' | 'checkbox';
  required?: boolean;
  unit?: string; // 添加单位字段
  options?: Array<{
    label: string;
    value: string | number;
    score?: number; // 该选项对应的分值
  }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// 评分配置类型
export interface ScoreConfig {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  calculation: {
    method: 'sum' | 'weighted' | 'custom';
    formula?: string; // 自定义计算公式
  };
  resultRanges: Array<{
    min: number;
    max: number;
    label: string;
    description?: string;
  }>;
}

// 表单数据类型
export interface FormData {
  [fieldId: string]: string | number | boolean | string[];
}

// 搜索结果类型
export interface SearchResult {
  patientName: string;
  patientId: string;
  recordCount: number;
  lastRecordDate?: string;
}
