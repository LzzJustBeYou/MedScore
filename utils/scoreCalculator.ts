import { FormData, ScoreConfig } from '../types';

export class ScoreCalculator {
  constructor(private config: ScoreConfig) {}

  calculate(formData: FormData): {
    totalScore: number;
    result: string;
    description?: string;
  } {
    let totalScore = 0;

    // 计算总分
    for (const field of this.config.fields) {
      const value = formData[field.id];
      if (value === undefined || value === null || value === '') continue;

      if (field.options) {
        // 选择类型字段，使用预定义分值
        const option = field.options.find(opt => opt.value === value);
        if (option && option.score !== undefined) {
          totalScore += option.score;
        }
      } else {
        // 数值类型字段，需要根据范围计算分值
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          totalScore += this.calculateNumericScore(field.id, numValue, this.config.id);
        }
      }
    }

    // 根据总分确定结果等级
    const resultRange = this.config.resultRanges.find(
      range => totalScore >= range.min && totalScore <= range.max
    );

    return {
      totalScore,
      result: resultRange?.label || '未知',
      description: resultRange?.description
    };
  }

  private calculateNumericScore(fieldId: string, value: number, configId: string): number {
    // APACHE II 评分计算逻辑
    if (configId === 'apache-ii') {
      return this.calculateApacheIIScore(fieldId, value);
    }
    
    // Child-Pugh 评分计算逻辑
    if (configId === 'child-pugh') {
      return this.calculateChildPughScore(fieldId, value);
    }

    return 0;
  }

  private calculateApacheIIScore(fieldId: string, value: number): number {
    switch (fieldId) {
      case 'age':
        if (value < 45) return 0;
        if (value < 55) return 2;
        if (value < 65) return 3;
        if (value < 75) return 5;
        return 6;

      case 'temperature':
        if (value < 29.9) return 4;
        if (value < 31.9) return 3;
        if (value < 33.9) return 2;
        if (value < 35.9) return 1;
        if (value < 38.5) return 0;
        if (value < 38.9) return 1;
        if (value < 40.9) return 2;
        return 3;

      case 'meanArterialPressure':
        if (value < 49) return 4;
        if (value < 69) return 3;
        if (value < 79) return 2;
        if (value < 109) return 0;
        if (value < 129) return 2;
        if (value < 159) return 3;
        return 4;

      case 'heartRate':
        if (value < 39) return 4;
        if (value < 54) return 3;
        if (value < 69) return 2;
        if (value < 109) return 0;
        if (value < 139) return 2;
        if (value < 179) return 3;
        return 4;

      case 'respiratoryRate':
        if (value < 5) return 4;
        if (value < 11) return 3;
        if (value < 14) return 2;
        if (value < 24) return 0;
        if (value < 34) return 2;
        if (value < 49) return 3;
        return 4;

      case 'arterialPh':
        if (value < 7.15) return 4;
        if (value < 7.25) return 3;
        if (value < 7.33) return 2;
        if (value < 7.45) return 0;
        if (value < 7.50) return 2;
        if (value < 7.60) return 3;
        return 4;

      case 'serumSodium':
        if (value < 110) return 4;
        if (value < 119) return 3;
        if (value < 129) return 2;
        if (value < 149) return 0;
        if (value < 154) return 2;
        if (value < 159) return 3;
        return 4;

      case 'serumPotassium':
        if (value < 2.5) return 4;
        if (value < 2.9) return 3;
        if (value < 3.4) return 2;
        if (value < 5.4) return 0;
        if (value < 5.9) return 2;
        if (value < 6.4) return 3;
        return 4;

      case 'serumCreatinine':
        if (value < 0.6) return 4;
        if (value < 1.4) return 0;
        if (value < 1.9) return 2;
        if (value < 3.4) return 3;
        return 4;

      case 'hematocrit':
        if (value < 29.9) return 4;
        if (value < 45.9) return 0;
        if (value < 49.9) return 2;
        return 4;

      case 'whiteBloodCellCount':
        if (value < 0.9) return 4;
        if (value < 2.9) return 3;
        if (value < 14.9) return 0;
        if (value < 19.9) return 2;
        if (value < 39.9) return 3;
        return 4;

      case 'glasgowComaScale':
        return 15 - value; // GCS 分数越高，APACHE II 分数越低

      default:
        return 0;
    }
  }

  private calculateChildPughScore(fieldId: string, value: number): number {
    switch (fieldId) {
      case 'totalBilirubin':
        if (value < 2) return 1;
        if (value < 3) return 2;
        return 3;

      case 'albumin':
        if (value > 3.5) return 1;
        if (value > 2.8) return 2;
        return 3;

      case 'prothrombinTime':
        if (value < 4) return 1;
        if (value < 6) return 2;
        return 3;

      default:
        return 0;
    }
  }

  // 保留静态方法以保持向后兼容性
  static calculateScore(config: ScoreConfig, formData: FormData): {
    score: number;
    result: string;
    description?: string;
  } {
    const calculator = new ScoreCalculator(config);
    const result = calculator.calculate(formData);
    return {
      score: result.totalScore,
      result: result.result,
      description: result.description
    };
  }
}
