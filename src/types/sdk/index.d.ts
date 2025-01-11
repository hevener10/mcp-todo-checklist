declare module '@modelcontextprotocol/sdk' {
  export interface Request {
    body: any;
    params: Record<string, string>;
    query: Record<string, string>;
  }

  export interface ServerConfig {
    name: string;
    version: string;
    description: string;
  }

  export class MCPServer {
    constructor(config: ServerConfig);
    
    post(path: string, handler: (req: Request) => Promise<any>): void;
    get(path: string, handler: (req: Request) => Promise<any>): void;
    put(path: string, handler: (req: Request) => Promise<any>): void;
    delete(path: string, handler: (req: Request) => Promise<any>): void;
    
    start(): Promise<void>;
  }
}