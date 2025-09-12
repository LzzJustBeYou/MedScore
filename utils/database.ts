import * as SQLite from 'expo-sqlite';
import { ScoringRecord } from '../types';

class Database {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized: boolean = false;

  async init(): Promise<void> {
    if (this.isInitialized && this.db) {
      return; // 已经初始化过了
    }

    try {
      console.log('开始初始化数据库...');
      this.db = await SQLite.openDatabaseAsync('medscore.db');
      console.log('数据库连接成功');
      
      await this.createTables();
      console.log('数据表创建/检查完成');
      
      await this.migrateTables();
      console.log('数据库迁移完成');
      
      this.isInitialized = true;
      console.log('数据库初始化完成');
    } catch (error) {
      console.error('数据库初始化失败:', error);
      this.isInitialized = false;
      this.db = null;
      throw error;
    }
  }

  // 检查数据库连接状态
  private async ensureDatabase(): Promise<void> {
    if (!this.isInitialized || !this.db) {
      console.log('数据库未初始化，重新初始化...');
      await this.init();
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS scoring_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patientName TEXT NOT NULL,
        patientId TEXT NOT NULL,
        scoreType TEXT NOT NULL,
        formData TEXT NOT NULL,
        scoreResult TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT
      );
    `;

    await this.db.execAsync(createTableSQL);
  }

  // 数据库迁移 - 添加新列
  private async migrateTables(): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    try {
      // 检查 updatedAt 列是否存在
      const tableInfo = await this.db.getAllAsync("PRAGMA table_info(scoring_records)");
      const hasUpdatedAt = tableInfo.some((column: any) => column.name === 'updatedAt');
      
      if (!hasUpdatedAt) {
        console.log('添加 updatedAt 列...');
        await this.db.execAsync('ALTER TABLE scoring_records ADD COLUMN updatedAt TEXT');
      }
    } catch (error) {
      console.error('数据库迁移失败:', error);
      // 如果迁移失败，尝试重新创建表
      await this.recreateTable();
    }
  }

  // 重新创建表（保留现有数据）
  private async recreateTable(): Promise<void> {
    if (!this.db) throw new Error('数据库未初始化');

    try {
      // 备份现有数据
      const existingData = await this.db.getAllAsync('SELECT * FROM scoring_records');
      
      // 删除旧表
      await this.db.execAsync('DROP TABLE IF EXISTS scoring_records_old');
      
      // 重命名当前表
      await this.db.execAsync('ALTER TABLE scoring_records RENAME TO scoring_records_old');
      
      // 创建新表
      await this.createTables();
      
      // 迁移数据
      for (const record of existingData) {
        const typedRecord = record as any; // 临时类型断言
        await this.db.runAsync(
          `INSERT INTO scoring_records (id, patientName, patientId, scoreType, formData, scoreResult, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          typedRecord.id,
          typedRecord.patientName,
          typedRecord.patientId,
          typedRecord.scoreType,
          typedRecord.formData,
          typedRecord.scoreResult,
          typedRecord.createdAt,
          typedRecord.updatedAt || typedRecord.createdAt // 如果没有 updatedAt，使用 createdAt
        );
      }
      
      // 删除旧表
      await this.db.execAsync('DROP TABLE scoring_records_old');
      
      console.log('数据库表结构更新完成');
    } catch (error) {
      console.error('重新创建表失败:', error);
      throw error;
    }
  }

  // 插入评分记录
  async insertRecord(record: Omit<ScoringRecord, 'id' | 'createdAt'>): Promise<number> {
    await this.ensureDatabase();
    if (!this.db) throw new Error('数据库未初始化');

    // 使用当前时间戳，确保时区正确
    const now = new Date();
    const createdAt = now.toISOString();
    const updatedAt = now.toISOString();

    const sql = `
      INSERT INTO scoring_records (patientName, patientId, scoreType, formData, scoreResult, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await this.db.runAsync(
      sql,
      record.patientName,
      record.patientId,
      record.scoreType,
      record.formData,
      record.scoreResult,
      createdAt,
      updatedAt
    );

    return result.lastInsertRowId as number;
  }

  // 根据患者姓名或ID查询记录
  async searchRecords(query: string): Promise<ScoringRecord[]> {
    await this.ensureDatabase();
    if (!this.db) throw new Error('数据库未初始化');

    const sql = `
      SELECT * FROM scoring_records 
      WHERE patientName LIKE ? OR patientId LIKE ?
      ORDER BY createdAt DESC
    `;

    const results = await this.db.getAllAsync(
      sql,
      `%${query}%`,
      `%${query}%`
    ) as ScoringRecord[];

    return results;
  }

  // 获取患者的所有记录 - 修改为按患者ID和姓名组合查询
  async getPatientRecords(patientId: string, patientName?: string): Promise<ScoringRecord[]> {
    await this.ensureDatabase();
    if (!this.db) throw new Error('数据库未初始化');

    let sql: string;
    let params: any[];

    if (patientName) {
      // 如果提供了患者姓名，按ID和姓名组合查询
      sql = `
        SELECT * FROM scoring_records 
        WHERE patientId = ? AND patientName = ?
        ORDER BY createdAt DESC
      `;
      params = [patientId, patientName];
    } else {
      // 如果只提供ID，按ID查询（兼容旧版本）
      sql = `
        SELECT * FROM scoring_records 
        WHERE patientId = ?
        ORDER BY createdAt DESC
      `;
      params = [patientId];
    }

    const results = await this.db.getAllAsync(sql, ...params) as ScoringRecord[];
    return results;
  }

  // 获取所有患者列表（用于搜索建议）
  async getAllPatients(): Promise<Array<{ patientName: string; patientId: string; recordCount: number }>> {
    await this.ensureDatabase();
    if (!this.db) throw new Error('数据库未初始化');

    const sql = `
      SELECT patientName, patientId, COUNT(*) as recordCount
      FROM scoring_records
      GROUP BY patientName, patientId
      ORDER BY patientName
    `;

    const results = await this.db.getAllAsync(sql) as Array<{
      patientName: string;
      patientId: string;
      recordCount: number;
    }>;

    return results;
  }

  // 删除记录
  async deleteRecord(id: number): Promise<void> {
    await this.ensureDatabase();
    if (!this.db) throw new Error('数据库未初始化');

    const sql = 'DELETE FROM scoring_records WHERE id = ?';
    await this.db.runAsync(sql, id);
  }

  // 获取记录详情
  async getRecord(id: number): Promise<ScoringRecord | null> {
    await this.ensureDatabase();
    if (!this.db) throw new Error('数据库未初始化');

    const sql = 'SELECT * FROM scoring_records WHERE id = ?';
    const result = await this.db.getFirstAsync(sql, id) as ScoringRecord | null;
    return result;
  }

  // 更新记录
  async updateRecord(id: number, record: Partial<ScoringRecord>): Promise<void> {
    await this.ensureDatabase();
    if (!this.db) throw new Error('数据库未初始化');

    const fields = [];
    const values = [];

    if (record.patientName !== undefined) {
      fields.push('patientName = ?');
      values.push(record.patientName);
    }
    if (record.patientId !== undefined) {
      fields.push('patientId = ?');
      values.push(record.patientId);
    }
    if (record.scoreType !== undefined) {
      fields.push('scoreType = ?');
      values.push(record.scoreType);
    }
    if (record.formData !== undefined) {
      fields.push('formData = ?');
      values.push(record.formData);
    }
    if (record.scoreResult !== undefined) {
      fields.push('scoreResult = ?');
      values.push(record.scoreResult);
    }
    if (record.updatedAt !== undefined) {
      fields.push('updatedAt = ?');
      values.push(record.updatedAt);
    }

    if (fields.length === 0) {
      throw new Error('没有要更新的字段');
    }

    values.push(id);
    const sql = `UPDATE scoring_records SET ${fields.join(', ')} WHERE id = ?`;
    
    await this.db.runAsync(sql, ...values);
  }

  // 添加记录（兼容性方法）
  async addRecord(record: Omit<ScoringRecord, 'id'>): Promise<ScoringRecord> {
    const id = await this.insertRecord(record);
    return {
      id,
      ...record
    };
  }
}

export const database = new Database();
