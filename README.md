# MCP TODO Checklist

Um servidor MCP que implementa um sistema de checklist para gerenciamento de tarefas.

## Funcionalidades

- Criação e gerenciamento de checklists
- Interface para acompanhamento do progresso
- Persistência de dados
- Comentários por item do checklist
- Agrupamento por categorias
- Indicador de progresso
- Priorização de tarefas
- Compartilhamento de checklists
- Histórico de atualizações

## Instalação

1. Instale as dependências
```bash
npm install
```

2. Compile o projeto
```bash
npm run build
```

3. Configure o servidor editando `config.json`:
```json
{
  "storage": {
    "path": "./data/checklists"
  },
  "server": {
    "port": 3000
  }
}
```

## Uso

O servidor fornece uma API REST para gerenciamento de checklists. Endpoints disponíveis:

### Checklists
- POST /checklists - Criar nova checklist
- GET /checklists?userId={userId} - Listar checklists do usuário
- GET /checklists/{id} - Obter uma checklist específica
- PUT /checklists/{id} - Atualizar uma checklist
- DELETE /checklists/{id} - Deletar uma checklist

### Items
- POST /checklists/{id}/items - Adicionar novo item
- PUT /checklists/{id}/items/{itemId} - Atualizar um item
- DELETE /checklists/{id}/items/{itemId} - Deletar um item
- PUT /checklists/{id}/items/{itemId}/toggle - Alternar status do item

## Estrutura do Projeto

```
src/
  ├── types/           # Definições de tipos
  ├── storage/         # Camada de persistência
  ├── service/         # Lógica de negócio
  └── index.ts         # Ponto de entrada do servidor
```

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.