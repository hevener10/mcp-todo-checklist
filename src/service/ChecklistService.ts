import { Checklist, ChecklistItem } from '../types';
import { Storage } from '../storage';

export class ChecklistService {
  constructor(private storage: Storage) {}

  async createChecklist(data: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>): Promise<Checklist> {
    const now = new Date();
    const checklist: Checklist = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      items: []
    };

    await this.storage.save(`checklist:${checklist.id}`, checklist);
    return checklist;
  }

  async updateChecklist(id: string, data: Partial<Checklist>): Promise<Checklist> {
    const checklist = await this.getChecklist(id);
    const updatedChecklist: Checklist = {
      ...checklist,
      ...data,
      updatedAt: new Date()
    };

    await this.storage.save(`checklist:${id}`, updatedChecklist);
    return updatedChecklist;
  }

  async deleteChecklist(id: string): Promise<void> {
    await this.storage.delete(`checklist:${id}`);
  }

  async getChecklist(id: string): Promise<Checklist> {
    const checklist = await this.storage.load(`checklist:${id}`);
    if (!checklist) {
      throw new Error(`Checklist not found: ${id}`);
    }
    return checklist;
  }

  async getUserChecklists(userId: string): Promise<Checklist[]> {
    const keys = await this.storage.list('checklist:');
    const checklists = await Promise.all(
      keys.map(key => this.storage.load(key))
    );
    return checklists.filter(checklist => 
      checklist.owner === userId || checklist.shared?.includes(userId)
    );
  }

  async addItem(checklistId: string, data: Omit<ChecklistItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChecklistItem> {
    const checklist = await this.getChecklist(checklistId);
    const now = new Date();
    const item: ChecklistItem = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };

    checklist.items.push(item);
    checklist.updatedAt = now;
    
    await this.storage.save(`checklist:${checklistId}`, checklist);
    return item;
  }

  async updateItem(checklistId: string, itemId: string, data: Partial<ChecklistItem>): Promise<ChecklistItem> {
    const checklist = await this.getChecklist(checklistId);
    const itemIndex = checklist.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error(`Item not found: ${itemId}`);
    }

    const updatedItem: ChecklistItem = {
      ...checklist.items[itemIndex],
      ...data,
      updatedAt: new Date()
    };

    checklist.items[itemIndex] = updatedItem;
    checklist.updatedAt = new Date();
    
    await this.storage.save(`checklist:${checklistId}`, checklist);
    return updatedItem;
  }

  async deleteItem(checklistId: string, itemId: string): Promise<void> {
    const checklist = await this.getChecklist(checklistId);
    checklist.items = checklist.items.filter(item => item.id !== itemId);
    checklist.updatedAt = new Date();
    
    await this.storage.save(`checklist:${checklistId}`, checklist);
  }

  async toggleItemComplete(checklistId: string, itemId: string): Promise<ChecklistItem> {
    const checklist = await this.getChecklist(checklistId);
    const item = checklist.items.find(item => item.id === itemId);
    
    if (!item) {
      throw new Error(`Item not found: ${itemId}`);
    }

    return this.updateItem(checklistId, itemId, { completed: !item.completed });
  }
}