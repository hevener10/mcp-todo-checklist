import { ChecklistItem } from './ChecklistItem';

export interface MergeRequestChecklist {
  items: ChecklistItem[];
  reviewer: string;
  updatedAt: string;
  projectId: string;
  mrId: string;
  createdAt?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}