import fs from 'fs/promises';
import path from 'path';
import { MergeRequestChecklist } from '../types/MergeRequestChecklist';

export class ChecklistStorage {
  private storagePath: string;

  constructor(basePath: string) {
    this.storagePath = path.join(basePath, 'checklists');
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.storagePath, { recursive: true });
  }

  async saveChecklist(checklist: MergeRequestChecklist): Promise<void> {
    const fileName = `${checklist.projectId}_${checklist.mrId}.json`;
    const filePath = path.join(this.storagePath, fileName);
    await fs.writeFile(filePath, JSON.stringify(checklist, null, 2));
  }

  async getChecklist(projectId: string, mrId: string): Promise<MergeRequestChecklist | null> {
    try {
      const fileName = `${projectId}_${mrId}.json`;
      const filePath = path.join(this.storagePath, fileName);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }
}