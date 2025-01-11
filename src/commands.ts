import { z } from 'zod';
import { ChecklistService } from './service/ChecklistService.js';

type CommandHandler = (service: ChecklistService, args: unknown[]) => Promise<any>;

interface Command {
  description: string;
  handler: CommandHandler;
}

const validateArgs = <T>(args: unknown[], schema: z.ZodType<T>): T => {
  return schema.parse(args);
};

export const commands: Record<string, Command> = {
  create: {
    description: 'Cria uma nova lista de tarefas',
    handler: async (service: ChecklistService, args: unknown[]) => {
      const [title, description] = validateArgs(args, z.tuple([
        z.string(),
        z.string().optional()
      ]));

      return await service.createChecklist({
        title,
        description,
        owner: 'current-user',
        items: []
      });
    }
  },

  add: {
    description: 'Adiciona uma nova tarefa à lista',
    handler: async (service: ChecklistService, args: unknown[]) => {
      const [listTitle, taskTitle, options = {}] = validateArgs(args, z.tuple([
        z.string(),
        z.string(),
        z.object({
          priority: z.enum(['low', 'medium', 'high']).optional(),
          due: z.string().optional(),
          tags: z.array(z.string()).optional()
        }).optional()
      ]));

      const lists = await service.getUserChecklists('current-user');
      const list = lists.find(l => l.title === listTitle);
      
      if (!list) {
        throw new Error(`Lista não encontrada: ${listTitle}`);
      }

      return await service.addItem(list.id, {
        title: taskTitle,
        priority: options.priority || 'medium',
        dueDate: options.due ? new Date(options.due) : undefined,
        tags: options.tags || [],
        completed: false
      });
    }
  },

  list: {
    description: 'Lista todas as listas de tarefas',
    handler: async (service: ChecklistService) => {
      return await service.getUserChecklists('current-user');
    }
  },

  show: {
    description: 'Mostra os detalhes de uma lista específica',
    handler: async (service: ChecklistService, args: unknown[]) => {
      const [listTitle] = validateArgs(args, z.tuple([z.string()]));

      const lists = await service.getUserChecklists('current-user');
      const list = lists.find(l => l.title === listTitle);
      
      if (!list) {
        throw new Error(`Lista não encontrada: ${listTitle}`);
      }

      return list;
    }
  },

  complete: {
    description: 'Marca uma tarefa como concluída',
    handler: async (service: ChecklistService, args: unknown[]) => {
      const [listTitle, taskTitle] = validateArgs(args, z.tuple([
        z.string(),
        z.string()
      ]));

      const lists = await service.getUserChecklists('current-user');
      const list = lists.find(l => l.title === listTitle);
      
      if (!list) {
        throw new Error(`Lista não encontrada: ${listTitle}`);
      }

      const task = list.items.find(t => t.title === taskTitle);
      if (!task) {
        throw new Error(`Tarefa não encontrada: ${taskTitle}`);
      }

      return await service.toggleItemComplete(list.id, task.id);
    }
  }
};