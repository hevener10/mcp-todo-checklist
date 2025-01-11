export interface ChecklistItem {
  id: string;
  description: string;
  category: string;
  isCompleted: boolean;
  comments?: string;
}