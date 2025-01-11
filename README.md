# MCP TODO Checklist

Um servidor MCP que implementa um sistema de checklist para gerenciamento de tarefas no Claude Desktop. O sistema permite criar e gerenciar múltiplas listas de tarefas, com suporte a prioridades, datas de vencimento e tags.

<a href="https://glama.ai/mcp/servers/z3gwefnnwr"><img width="380" height="200" src="https://glama.ai/mcp/servers/z3gwefnnwr/badge" alt="TODO Checklist Server MCP server" /></a>

## Funcionalidades

- ✅ Criação e gerenciamento de múltiplas listas de tarefas
- 📌 Suporte a prioridades (baixa, média, alta)
- 📅 Datas de vencimento para tarefas
- 🏷️ Sistema de tags para organização
- 👥 Compartilhamento de listas entre usuários
- 💾 Armazenamento persistente em sistema de arquivos

## Requisitos

- Node.js 18 ou superior
- NPM 8 ou superior

## Instalação

### Método 1: Instalação Local (Desenvolvimento)

1. Clone o repositório
```bash
cd C:\workspace\mcp
git clone (seu-repositório) mcp-mr-checklist
cd mcp-mr-checklist
```

2. Instale as dependências e compile
```bash
npm install
npm run build
```

3. Configure no `claude_desktop_config.json`:
```json
{
  "servers": {
    "todo-checklist": {
      "type": "command",
      "command": "node dist/index.js",
      "cwd": "C:\\workspace\\mcp\\mcp-mr-checklist",
      "config": {
        "storagePath": "./data",
        "commandTimeout": 60000
      }
    }
  }
}
```

### Método 2: Instalação Global (Uso)

1. Instale o pacote globalmente
```bash
npm install -g @hevener/server-todo-checklist
```

2. Configure no `claude_desktop_config.json`:
```json
{
  "servers": {
    "todo-checklist": {
      "type": "command",
      "command": "mcp-server-todo-checklist",
      "config": {
        "storagePath": "C:\\Users\\SEU_USUARIO\\AppData\\Local\\claude-todo-checklist",
        "commandTimeout": 60000
      }
    }
  }
}
```

## Comandos Disponíveis no Claude

### Criar uma nova lista
```
/todo_create {
  "title": "Minha Lista",
  "description": "Descrição opcional da lista"
}
```

### Adicionar uma tarefa
```
/todo_add {
  "listTitle": "Minha Lista",
  "taskTitle": "Nova Tarefa",
  "priority": "high",
  "dueDate": "2024-01-20",
  "tags": ["trabalho", "urgente"]
}
```

### Listar todas as listas
```
/todo_list
```

### Ver detalhes de uma lista
```
/todo_show {
  "listTitle": "Minha Lista"
}
```

### Marcar tarefa como concluída
```
/todo_complete {
  "listTitle": "Minha Lista",
  "taskTitle": "Nova Tarefa"
}
```

## Estrutura do Projeto

```
src/
├── index.ts           # Ponto de entrada do servidor
├── commands.ts        # Definição dos comandos disponíveis
├── service/          
│   └── ChecklistService.ts  # Lógica de negócio
├── storage/
│   └── index.ts      # Implementação do armazenamento
└── types/
    ├── ChecklistItem.ts     # Tipos para itens
    └── index.ts            # Tipos principais
```

## Estrutura de Dados

### Lista (Checklist)
```typescript
interface Checklist {
  id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
  owner: string;
  shared?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Tarefa (ChecklistItem)
```typescript
interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Scripts de Desenvolvimento

```bash
# Compilar o projeto
npm run build

# Executar em modo desenvolvimento
npm run dev

# Observar alterações e recompilar
npm run watch

# Iniciar o servidor compilado
npm start
```

## Configurações

No arquivo `claude_desktop_config.json`, você pode configurar:

- `storagePath`: Diretório onde os dados serão armazenados
- `commandTimeout`: Tempo máximo de execução dos comandos em milissegundos (padrão: 60000)

## Tecnologias Utilizadas

- TypeScript
- Model Context Protocol SDK
- Zod (validação de dados)
- Sistema de armazenamento baseado em arquivos

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
