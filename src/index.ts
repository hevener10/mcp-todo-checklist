import { MCPServer } from '@modelcontextprotocol/sdk';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChecklistService } from './service/ChecklistService.js';
import { FileStorage } from './storage/index.js';
import { ChecklistSchema, ChecklistItemSchema } from './schemas.js';
import type { Request } from '@modelcontextprotocol/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storage = new FileStorage(path.join(__dirname, '../data'));
const checklistService = new ChecklistService(storage);

const server = new MCPServer({
  name: 'Todo Checklist Server',
  version: '1.0.0',
  description: 'A server for managing generic TODO checklists'
});

// Rotas para Checklists
server.post('/checklists', async (req: Request) => {
  const data = ChecklistSchema.parse(req.body);
  return await checklistService.createChecklist(data);
});

server.put('/checklists/:id', async (req: Request) => {
  const { id } = req.params;
  const data = ChecklistSchema.partial().parse(req.body);
  return await checklistService.updateChecklist(id, data);
});

server.delete('/checklists/:id', async (req: Request) => {
  const { id } = req.params;
  await checklistService.deleteChecklist(id);
  return { success: true };
});

server.get('/checklists/:id', async (req: Request) => {
  const { id } = req.params;
  return await checklistService.getChecklist(id);
});

server.get('/checklists', async (req: Request) => {
  const userId = req.query.userId as string;
  if (!userId) {
    throw new Error('userId is required');
  }
  return await checklistService.getUserChecklists(userId);
});

// Rotas para Items
server.post('/checklists/:id/items', async (req: Request) => {
  const { id } = req.params;
  const data = ChecklistItemSchema.parse(req.body);
  return await checklistService.addItem(id, data);
});

server.put('/checklists/:id/items/:itemId', async (req: Request) => {
  const { id, itemId } = req.params;
  const data = ChecklistItemSchema.partial().parse(req.body);
  return await checklistService.updateItem(id, itemId, data);
});

server.delete('/checklists/:id/items/:itemId', async (req: Request) => {
  const { id, itemId } = req.params;
  await checklistService.deleteItem(id, itemId);
  return { success: true };
});

server.put('/checklists/:id/items/:itemId/toggle', async (req: Request) => {
  const { id, itemId } = req.params;
  return await checklistService.toggleItemComplete(id, itemId);
});

// Iniciar o servidor
server.start();