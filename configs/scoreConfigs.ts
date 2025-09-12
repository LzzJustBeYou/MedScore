import { ScoreConfig } from '../types';

export const scoreConfigs: ScoreConfig[] = [
  {
    id: 'apache-ii',
    name: 'APACHE II',
    description: '急性生理学和慢性健康状况评分系统',
    fields: [
      {
        id: 'age',
        label: '年龄',
        type: 'number',
        numberType: 'integer',
        required: true,
        unit: '岁',
        validation: { min: 0, max: 120 }
      },
      {
        id: 'temperature',
        label: '体温',
        type: 'number',
        numberType: 'decimal',
        required: true,
        unit: '°C',
        validation: { min: 30, max: 45 }
      },
      {
        id: 'meanArterialPressure',
        label: '平均动脉压',
        type: 'number',
        numberType: 'integer',
        required: true,
        unit: 'mmHg',
        validation: { min: 40, max: 200 }
      },
      {
        id: 'heartRate',
        label: '心率',
        type: 'number',
        numberType: 'integer',
        required: true,
        unit: '次/分',
        validation: { min: 40, max: 200 }
      },
      {
        id: 'respiratoryRate',
        label: '呼吸频率',
        type: 'number',
        numberType: 'integer',
        required: true,
        unit: '次/分',
        validation: { min: 5, max: 60 }
      },
      {
        id: 'oxygenation',
        label: '氧合状态',
        type: 'select',
        required: true,
        options: [
          { label: 'FiO2 < 0.5 且 PaO2 ≥ 70', value: 'normal', score: 0 },
          { label: 'FiO2 < 0.5 且 PaO2 50-69', value: 'mild', score: 1 },
          { label: 'FiO2 < 0.5 且 PaO2 < 50', value: 'moderate', score: 2 },
          { label: 'FiO2 ≥ 0.5 且 PaO2 ≥ 70', value: 'severe', score: 3 },
          { label: 'FiO2 ≥ 0.5 且 PaO2 < 70', value: 'critical', score: 4 }
        ]
      },
      {
        id: 'arterialPh',
        label: '动脉血 pH',
        type: 'number',
        numberType: 'decimal',
        required: true,
        validation: { min: 6.5, max: 8.0 }
      },
      {
        id: 'serumSodium',
        label: '血清钠',
        type: 'number',
        numberType: 'integer',
        required: true,
        unit: 'mEq/L',
        validation: { min: 110, max: 180 }
      },
      {
        id: 'serumPotassium',
        label: '血清钾',
        type: 'number',
        numberType: 'decimal',
        required: true,
        unit: 'mEq/L',
        validation: { min: 2.0, max: 8.0 }
      },
      {
        id: 'serumCreatinine',
        label: '血清肌酐',
        type: 'number',
        numberType: 'decimal',
        required: true,
        unit: 'mg/dL',
        validation: { min: 0.0, max: 10.0 }
      },
      {
        id: 'hematocrit',
        label: '血细胞比容',
        type: 'number',
        numberType: 'integer',
        required: true,
        unit: '%',
        validation: { min: 10, max: 70 }
      },
      {
        id: 'whiteBloodCellCount',
        label: '白细胞计数',
        type: 'number',
        numberType: 'decimal',
        required: true,
        unit: '×10³/μL',
        validation: { min: 0, max: 100 }
      },
      {
        id: 'glasgowComaScale',
        label: '格拉斯哥昏迷评分',
        type: 'number',
        numberType: 'integer',
        required: true,
        unit: '分',
        validation: { min: 3, max: 15 }
      },
      {
        id: 'chronicHealthStatus',
        label: '慢性健康状况',
        type: 'select',
        required: true,
        options: [
          { label: '无慢性疾病', value: 'none', score: 0 },
          { label: '非手术或急诊手术', value: 'nonSurgical', score: 2 },
          { label: '择期手术后', value: 'electiveSurgery', score: 5 }
        ]
      }
    ],
    calculation: {
      method: 'sum'
    },
    resultRanges: [
      { min: 0, max: 4, label: '低风险', description: '死亡率 < 4%' },
      { min: 5, max: 9, label: '中等风险', description: '死亡率 8-15%' },
      { min: 10, max: 14, label: '高风险', description: '死亡率 15-25%' },
      { min: 15, max: 19, label: '极高风险', description: '死亡率 25-40%' },
      { min: 20, max: 71, label: '极高风险', description: '死亡率 > 40%' }
    ]
  },
  {
    id: 'child-pugh',
    name: 'Child-Pugh 评分',
    description: '肝功能分级评分系统',
    fields: [
      {
        id: 'totalBilirubin',
        label: '总胆红素',
        type: 'number',
        numberType: 'decimal',
        required: true,
        unit: 'mg/dL',
        validation: { min: 0, max: 50 }
      },
      {
        id: 'albumin',
        label: '白蛋白',
        type: 'number',
        numberType: 'decimal',
        required: true,
        unit: 'g/dL',
        validation: { min: 1.0, max: 5.0 }
      },
      {
        id: 'prothrombinTime',
        label: '凝血酶原时间延长',
        type: 'number',
        numberType: 'decimal',
        required: true,
        unit: '秒',
        validation: { min: 0, max: 20 }
      },
      {
        id: 'ascites',
        label: '腹水',
        type: 'select',
        required: true,
        options: [
          { label: '无', value: 'none', score: 1 },
          { label: '轻度', value: 'mild', score: 2 },
          { label: '中重度', value: 'moderate', score: 3 }
        ]
      },
      {
        id: 'hepaticEncephalopathy',
        label: '肝性脑病',
        type: 'select',
        required: true,
        options: [
          { label: '无', value: 'none', score: 1 },
          { label: '轻度', value: 'mild', score: 2 },
          { label: '中重度', value: 'moderate', score: 3 }
        ]
      }
    ],
    calculation: {
      method: 'sum'
    },
    resultRanges: [
      { min: 5, max: 6, label: 'A级', description: '1年生存率 100%' },
      { min: 7, max: 9, label: 'B级', description: '1年生存率 80%' },
      { min: 10, max: 15, label: 'C级', description: '1年生存率 45%' }
    ]
  }
];

export const getScoreConfig = (idOrName: string): ScoreConfig | undefined => {
  // 首先尝试按 id 查找
  let config = scoreConfigs.find(config => config.id === idOrName);
  
  // 如果没找到，尝试按 name 查找
  if (!config) {
    config = scoreConfigs.find(config => config.name === idOrName);
  }
  
  return config;
};
