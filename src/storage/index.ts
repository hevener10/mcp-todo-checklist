import fs from 'fs/promises';
import path from 'path';

export interface Storage {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

export class FileStorage implements Storage {
  constructor(private basePath: string) {
    // Criar diretório base se não existir
    fs.mkdir(basePath, { recursive: true });
  }

  private getFilePath(key: string): string {
    return path.join(this.basePath, `${key}.json`);
  }

  async save(key: string, data: any): Promise<void> {
    const filePath = this.getFilePath(key);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async load(key: string): Promise<any> {
    const filePath = this.getFilePath(key);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async list(prefix: string): Promise<string[]> {
    const files = await fs.readdir(this.basePath);
    return files
      .filter(file => file.startsWith(prefix) && file.endsWith('.json'))
      .map(file => file.slice(0, -5)); // Remove .json extension
  }
}

export class MemoryStorage implements Storage {
  private data = new Map<string, any>();

  async save(key: string, data: any): Promise<void> {
    this.data.set(key, JSON.parse(JSON.stringify(data))); // Deep clone
  }

  async load(key: string): Promise<any> {
    const data = this.data.get(key);
    return data ? JSON.parse(JSON.stringify(data)) : null; // Deep clone
  }

  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }

  async list(prefix: string): Promise<string[]> {
    return Array.from(this.data.keys()).filter(key => key.startsWith(prefix));
  }
}