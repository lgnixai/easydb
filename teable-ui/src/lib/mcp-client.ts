/**
 * 标准 MCP (Model Context Protocol) 客户端
 * 
 * 支持多种传输方式：
 * - HTTP: 适合简单的请求-响应模式
 * - SSE: 适合流式响应
 * - WebSocket: 适合双向实时通信
 */

export type MCPTransport = 'http' | 'sse' | 'websocket';

export interface MCPClientConfig {
  baseUrl: string;
  transport?: MCPTransport;
  timeout?: number;
}

export interface MCPRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id: number | string;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: number | string;
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPCallToolParams {
  name: string;
  arguments: Record<string, any>;
}

/**
 * 标准 MCP 客户端类
 */
export class MCPClient {
  private config: Required<MCPClientConfig>;
  private requestId = 0;
  private eventSource?: EventSource;
  private websocket?: WebSocket;

  constructor(config: MCPClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      transport: config.transport || 'http',
      timeout: config.timeout || 30000,
    };
  }

  /**
   * 初始化连接（仅对 SSE 和 WebSocket）
   */
  async initialize(): Promise<void> {
    if (this.config.transport === 'sse') {
      await this.initializeSSE();
    } else if (this.config.transport === 'websocket') {
      await this.initializeWebSocket();
    }
  }

  /**
   * 初始化 SSE 连接
   */
  private async initializeSSE(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${this.config.baseUrl}/mcp/sse`;
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('[MCP SSE] 连接已建立');
        resolve();
      };

      this.eventSource.onerror = (error) => {
        console.error('[MCP SSE] 连接错误:', error);
        reject(new Error('SSE 连接失败'));
      };
    });
  }

  /**
   * 初始化 WebSocket 连接
   */
  private async initializeWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${this.config.baseUrl.replace('http', 'ws')}/mcp/ws`;
      this.websocket = new WebSocket(url);

      this.websocket.onopen = () => {
        console.log('[MCP WebSocket] 连接已建立');
        resolve();
      };

      this.websocket.onerror = (error) => {
        console.error('[MCP WebSocket] 连接错误:', error);
        reject(new Error('WebSocket 连接失败'));
      };
    });
  }

  /**
   * 列出所有可用工具
   */
  async listTools(): Promise<MCPToolDefinition[]> {
    const response = await this.sendRequest({
      jsonrpc: '2.0',
      method: 'tools/list',
      id: this.nextId(),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.result?.tools || [];
  }

  /**
   * 调用 MCP 工具
   */
  async callTool(params: MCPCallToolParams): Promise<any> {
    const response = await this.sendRequest({
      jsonrpc: '2.0',
      method: 'tools/call',
      params,
      id: this.nextId(),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.result;
  }

  /**
   * 获取服务器信息
   */
  async getServerInfo(): Promise<any> {
    const response = await this.sendRequest({
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'teable-ui',
          version: '1.0.0',
        },
      },
      id: this.nextId(),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.result;
  }

  /**
   * 发送请求
   */
  private async sendRequest(request: MCPRequest): Promise<MCPResponse> {
    switch (this.config.transport) {
      case 'http':
        return this.sendHTTPRequest(request);
      case 'sse':
        return this.sendSSERequest(request);
      case 'websocket':
        return this.sendWebSocketRequest(request);
      default:
        throw new Error(`不支持的传输方式: ${this.config.transport}`);
    }
  }

  /**
   * 发送 HTTP 请求
   */
  private async sendHTTPRequest(request: MCPRequest): Promise<MCPResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP 错误: ${response.status} ${response.statusText}`);
      }

      const data: MCPResponse = await response.json();
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 发送 SSE 请求
   */
  private async sendSSERequest(request: MCPRequest): Promise<MCPResponse> {
    if (!this.eventSource) {
      throw new Error('SSE 连接未初始化');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('SSE 请求超时'));
      }, this.config.timeout);

      // 监听响应
      const messageHandler = (event: MessageEvent) => {
        try {
          const response: MCPResponse = JSON.parse(event.data);
          if (response.id === request.id) {
            clearTimeout(timeoutId);
            this.eventSource?.removeEventListener('message', messageHandler);
            resolve(response);
          }
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      };

      this.eventSource.addEventListener('message', messageHandler);

      // 发送请求
      fetch(`${this.config.baseUrl}/mcp/sse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }).catch(reject);
    });
  }

  /**
   * 发送 WebSocket 请求
   */
  private async sendWebSocketRequest(request: MCPRequest): Promise<MCPResponse> {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket 连接未就绪');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('WebSocket 请求超时'));
      }, this.config.timeout);

      const messageHandler = (event: MessageEvent) => {
        try {
          const response: MCPResponse = JSON.parse(event.data);
          if (response.id === request.id) {
            clearTimeout(timeoutId);
            this.websocket?.removeEventListener('message', messageHandler);
            resolve(response);
          }
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      };

      this.websocket!.addEventListener('message', messageHandler);
      this.websocket!.send(JSON.stringify(request));
    });
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }

    if (this.websocket) {
      this.websocket.close();
      this.websocket = undefined;
    }
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    if (this.config.transport === 'http') {
      return true; // HTTP 无需保持连接
    } else if (this.config.transport === 'sse') {
      return this.eventSource?.readyState === EventSource.OPEN;
    } else if (this.config.transport === 'websocket') {
      return this.websocket?.readyState === WebSocket.OPEN;
    }
    return false;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 生成下一个请求 ID
   */
  private nextId(): number {
    return ++this.requestId;
  }
}

/**
 * 创建 MCP 客户端实例
 */
export function createMCPClient(config: MCPClientConfig): MCPClient {
  return new MCPClient(config);
}

