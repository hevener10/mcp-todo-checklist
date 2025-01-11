import { z } from 'zod';

export const ChecklistItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  completed: z.boolean(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ChecklistSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.array(ChecklistItemSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  owner: z.string(),
  shared: z.array(z.string()).optional()
});