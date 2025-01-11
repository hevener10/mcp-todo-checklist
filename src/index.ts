#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChecklistService } from './service/ChecklistService.js';
import { FileStorage } from './storage/index.js';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storage = new FileStorage(path.join(__dirname, '../data'));
const checklistService = new ChecklistService(storage);

// Schemas para validação
const createSchema = z.object({
  title: z.string(),
  description: z.string().optional()
});

const addSchema = z.object({
  listTitle: z.string(),
  taskTitle: z.string(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional().default([])
});

const showSchema = z.object({
  listTitle: z.string()
});

const completeSchema = z.object({
  listTitle: z.string(),
  taskTitle: z.string()
});

// Configuração do servidor
const server = new Server({
  name: 'Todo Checklist Server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Definição das ferramentas disponíveis
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "todo_create",
        description: "Cria uma nova lista de tarefas",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Título da lista" },
            description: { type: "string", description: "Descrição da lista (opcional)" },
          },
          required: ["title"],
        },
      },
      {
        name: "todo_add",
        description: "Adiciona uma nova tarefa à lista",
        inputSchema: {
          type: "object",
          properties: {
            listTitle: { type: "string", description: "Título da lista" },
            taskTitle: { type: "string", description: "Título da tarefa" },
            priority: { type: "string", enum: ["low", "medium", "high"], description: "Prioridade da tarefa" },
            dueDate: { type: "string", description: "Data de vencimento (YYYY-MM-DD)" },
            tags: { type: "array", items: { type: "string" }, description: "Tags da tarefa" },
          },
          required: ["listTitle", "taskTitle"],
        },
      },
      {
        name: "todo_list",
        description: "Lista todas as listas de tarefas",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "todo_show",
        description: "Mostra os detalhes de uma lista específica",
        inputSchema: {
          type: "object",
          properties: {
            listTitle: { type: "string", description: "Título da lista" },
          },
          required: ["listTitle"],
        },
      },
      {
        name: "todo_complete",
        description: "Marca uma tarefa como concluída",
        inputSchema: {
          type: "object",
          properties: {
            listTitle: { type: "string", description: "Título da lista" },
            taskTitle: { type: "string", description: "Título da tarefa" },
          },
          required: ["listTitle", "taskTitle"],
        },
      },
    ],
  };
});

// Handler para execução dos comandos
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args || typeof args !== 'object') {
    throw new Error(`Argumentos não fornecidos ou inválidos para o comando: ${name}`);
  }

  try {
    switch (name) {
      case "todo_create": {
        const params = createSchema.parse(args);
        const newList = await checklistService.createChecklist({
          title: params.title,
          description: params.description,
          owner: 'current-user',
          items: []
        });
        return { content: [{ type: "text", text: `Lista "${params.title}" criada com sucesso!` }] };
      }

      case "todo_add": {
        const params = addSchema.parse(args);
        const lists = await checklistService.getUserChecklists('current-user');
        const list = lists.find(l => l.title === params.listTitle);
        
        if (!list) {
          throw new Error(`Lista não encontrada: ${params.listTitle}`);
        }

        const newItem = await checklistService.addItem(list.id, {
          title: params.taskTitle,
          priority: params.priority,
          dueDate: params.dueDate ? new Date(params.dueDate) : undefined,
          tags: params.tags,
          completed: false
        });
        return { content: [{ type: "text", text: `Tarefa "${params.taskTitle}" adicionada à lista "${params.listTitle}"!` }] };
      }

      case "todo_list": {
        const allLists = await checklistService.getUserChecklists('current-user');
        const listSummary = allLists.map(l => ({
          title: l.title,
          description: l.description,
          totalItems: l.items.length,
          completedItems: l.items.filter(i => i.completed).length
        }));
        return { content: [{ type: "text", text: JSON.stringify(listSummary, null, 2) }] };
      }

      case "todo_show": {
        const params = showSchema.parse(args);
        const userLists = await checklistService.getUserChecklists('current-user');
        const targetList = userLists.find(l => l.title === params.listTitle);
        
        if (!targetList) {
          throw new Error(`Lista não encontrada: ${params.listTitle}`);
        }

        return { content: [{ type: "text", text: JSON.stringify(targetList, null, 2) }] };
      }

      case "todo_complete": {
        const params = completeSchema.parse(args);
        const todoLists = await checklistService.getUserChecklists('current-user');
        const todoList = todoLists.find(l => l.title === params.listTitle);
        
        if (!todoList) {
          throw new Error(`Lista não encontrada: ${params.listTitle}`);
        }

        const task = todoList.items.find(t => t.title === params.taskTitle);
        if (!task) {
          throw new Error(`Tarefa não encontrada: ${params.taskTitle}`);
        }

        await checklistService.toggleItemComplete(todoList.id, task.id);
        return { content: [{ type: "text", text: `Tarefa "${params.taskTitle}" marcada como completa!` }] };
      }

      default:
        throw new Error(`Comando desconhecido: ${name}`);
    }
  } catch (error) {
    console.error('Erro:', error);
    return {
      content: [
        {
          type: "text",
          text: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        }
      ]
    };
  }
});

// Inicialização do servidor
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Todo Checklist Server executando em stdio");
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

main();