// AI 侧边栏相关类型定义

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  action?: ActionResult;
}

export interface ActionResult {
  type: 'success' | 'error' | 'pending' | 'confirmation';
  action: MCPAction;
  params: Record<string, any>;
  result?: any;
  error?: string;
}

export type MCPAction = 
  | 'create_space'
  | 'create_base'
  | 'create_table'
  | 'create_field'
  | 'create_fields_batch'
  | 'create_record'
  | 'create_record_batch'
  | 'list_tables'
  | 'get_base'
  | 'get_field'
  | 'update_field'
  | 'delete_field';

export interface ParsedIntent {
  action: MCPAction;
  params: Record<string, any>;
  confirmation?: string;
  response: string;
  requiresConfirmation?: boolean;
}

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  temperature?: number;
  stream?: boolean;
}

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaResponse {
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface AISidebarSettings {
  ollamaUrl: string;
  model: string;
  temperature: number;
  autoExecute: boolean;
  showTimestamp: boolean;
}

