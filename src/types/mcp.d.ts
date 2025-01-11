declare module '@mcp/sdk' {
  export interface MCPServer {
    storagePath: string;
    onMergeRequestOpen(callback: (mr: MergeRequest) => Promise<void>): void;
    addCommand(name: string, handler: (params: any) => Promise<any>): void;
  }

  export interface MergeRequest {
    id: string;
    projectId: string;
    reviewer: string;
    title: string;
    description: string;
    author: string;
    sourceBranch: string;
    targetBranch: string;
    createdAt: Date;
    updatedAt: Date;
  }

  // Adicione outras interfaces necessárias aqui
}