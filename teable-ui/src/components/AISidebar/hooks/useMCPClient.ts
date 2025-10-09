import { useState, useCallback, useEffect, useRef } from 'react';
import { MCPClient, createMCPClient, MCPToolDefinition, MCPTransport } from '@/lib/mcp-client';

export interface UseMCPClientConfig {
  baseUrl: string;
  transport?: MCPTransport;
  autoConnect?: boolean;
}

/**
 * 标准 MCP 客户端 Hook
 * 
 * 使用示例：
 * ```tsx
 * const mcp = useMCPClient({
 *   baseUrl: 'http://localhost:3001',
 *   transport: 'http',
 *   autoConnect: true
 * });
 * 
 * // 列出工具
 * const tools = await mcp.listTools();
 * 
 * // 调用工具
 * const result = await mcp.callTool({
 *   name: 'teable_space_create',
 *   arguments: { name: '我的空间' }
 * });
 * ```
 */
export const useMCPClient = (config: UseMCPClientConfig) => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tools, setTools] = useState<MCPToolDefinition[]>([]);
  
  const clientRef = useRef<MCPClient | null>(null);

  // 初始化客户端
  useEffect(() => {
    const client = createMCPClient({
      baseUrl: config.baseUrl,
      transport: config.transport || 'http',
    });

    clientRef.current = client;

    if (config.autoConnect) {
      connect();
    }

    return () => {
      client.close();
    };
  }, [config.baseUrl, config.transport]);

  /**
   * 连接到 MCP 服务器
   */
  const connect = useCallback(async () => {
    if (!clientRef.current) return;

    setLoading(true);
    setError(null);

    try {
      await clientRef.current.initialize();
      
      // 获取服务器信息
      const serverInfo = await clientRef.current.getServerInfo();
      console.log('[MCP] 服务器信息:', serverInfo);

      // 获取工具列表
      const toolsList = await clientRef.current.listTools();
      setTools(toolsList);
      
      setConnected(true);
      console.log('[MCP] 连接成功, 可用工具:', toolsList.length);
    } catch (err: any) {
      const errorMessage = err.message || '连接 MCP 服务器失败';
      setError(errorMessage);
      setConnected(false);
      console.error('[MCP] 连接失败:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 断开连接
   */
  const disconnect = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      await clientRef.current.close();
      setConnected(false);
      setTools([]);
      console.log('[MCP] 已断开连接');
    } catch (err: any) {
      console.error('[MCP] 断开连接失败:', err);
    }
  }, []);

  /**
   * 列出所有工具
   */
  const listTools = useCallback(async (): Promise<MCPToolDefinition[]> => {
    if (!clientRef.current) {
      throw new Error('MCP 客户端未初始化');
    }

    setLoading(true);
    setError(null);

    try {
      const toolsList = await clientRef.current.listTools();
      setTools(toolsList);
      return toolsList;
    } catch (err: any) {
      const errorMessage = err.message || '获取工具列表失败';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 调用 MCP 工具
   */
  const callTool = useCallback(async (name: string, args: Record<string, any>): Promise<any> => {
    if (!clientRef.current) {
      throw new Error('MCP 客户端未初始化');
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`[MCP] 调用工具: ${name}`, args);
      const result = await clientRef.current.callTool({
        name,
        arguments: args,
      });
      console.log(`[MCP] 工具 ${name} 返回结果:`, result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || `调用工具 ${name} 失败`;
      setError(errorMessage);
      console.error(`[MCP] 调用工具 ${name} 失败:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 健康检查
   */
  const checkHealth = useCallback(async (): Promise<boolean> => {
    if (!clientRef.current) return false;

    try {
      return await clientRef.current.healthCheck();
    } catch {
      return false;
    }
  }, []);

  return {
    // 状态
    connected,
    loading,
    error,
    tools,

    // 方法
    connect,
    disconnect,
    listTools,
    callTool,
    checkHealth,

    // 客户端实例
    client: clientRef.current,
  };
};

