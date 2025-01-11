declare module '@modelcontextprotocol/sdk' {
  export interface Request {
    body: any;
    params: Record<string, string>;
    query: Record<string, string>;
    args?: any[];
  }

  export interface Response {
    success: boolean;
    data?: any;
    error?: string;
  }

  export interface ServerConfig {
    name: string;
    version: string;
    description: string;
  }

  export class MCPServer {
    constructor(config: ServerConfig);
    
    registerHandler(path: string, handler: (req: Request) => Promise<Response>): void;
    start(): Promise<void>;
  }
}