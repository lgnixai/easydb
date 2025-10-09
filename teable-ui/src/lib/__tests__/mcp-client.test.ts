import { MCPClient } from '../mcp-client';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('MCPClient', () => {
  let client: MCPClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new MCPClient('http://localhost:3001');
  });

  describe('连接管理', () => {
    it('应该正确初始化', () => {
      expect(client.baseUrl).toBe('http://localhost:3001');
      expect(client.connected).toBe(false);
      expect(client.tools).toEqual([]);
    });

    it('应该连接到 MCP 服务器', async () => {
      const mockInitializeResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'teable-mcp',
            version: '1.0.0'
          }
        }
      };

      const mockToolsListResponse = {
        jsonrpc: '2.0',
        id: 2,
        result: {
          tools: [
            {
              name: 'teable_user_register',
              description: 'Register a new user',
              inputSchema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          ]
        }
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockInitializeResponse),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockToolsListResponse),
        } as Response);

      await client.connect();

      expect(client.connected).toBe(true);
      expect(client.tools).toHaveLength(1);
      expect(client.tools[0].name).toBe('teable_user_register');
    });

    it('应该处理连接失败', async () => {
      mockFetch.mockRejectedValue(new Error('Connection failed'));

      await expect(client.connect()).rejects.toThrow('Connection failed');
      expect(client.connected).toBe(false);
    });

    it('应该断开连接', () => {
      client.connected = true;
      client.tools = [
        {
          name: 'test_tool',
          description: 'Test tool',
          inputSchema: { type: 'object' }
        }
      ];

      client.disconnect();

      expect(client.connected).toBe(false);
      expect(client.tools).toEqual([]);
    });
  });

  describe('工具调用', () => {
    beforeEach(async () => {
      // 模拟连接成功
      client.connected = true;
      client.tools = [
        {
          name: 'teable_user_register',
          description: 'Register a new user',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              password: { type: 'string' }
            }
          }
        }
      ];
    });

    it('应该调用工具并返回结果', async () => {
      const mockResponse = {
        jsonrpc: '2.0',
        id: 1,
        result: {
          content: [
            {
              type: 'text',
              text: 'User registered successfully'
            }
          ]
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await client.callTool('teable_user_register', {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'User registered successfully'
          }
        ]
      });

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/tools/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: expect.any(Number),
          method: 'tools/call',
          params: {
            name: 'teable_user_register',
            arguments: {
              name: 'John Doe',
              email: 'john@example.com',
              password: 'password123'
            }
          }
        })
      });
    });

    it('应该处理工具调用错误', async () => {
      const mockErrorResponse = {
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32602,
          message: 'Invalid params',
          data: 'Missing required field: email'
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockErrorResponse),
      } as Response);

      await expect(
        client.callTool('teable_user_register', {
          name: 'John Doe'
          // 缺少 email 和 password
        })
      ).rejects.toThrow('Invalid params: Missing required field: email');
    });

    it('应该处理网络错误', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        client.callTool('teable_user_register', {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123'
        })
      ).rejects.toThrow('Network error');
    });

    it('应该拒绝调用未连接的工具', async () => {
      client.connected = false;

      await expect(
        client.callTool('teable_user_register', {})
      ).rejects.toThrow('MCP client not connected');
    });

    it('应该拒绝调用不存在的工具', async () => {
      await expect(
        client.callTool('non_existent_tool', {})
      ).rejects.toThrow('Tool non_existent_tool not found');
    });
  });

  describe('工具查询', () => {
    beforeEach(() => {
      client.tools = [
        {
          name: 'teable_user_register',
          description: 'Register a new user',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string' },
              password: { type: 'string' }
            }
          }
        },
        {
          name: 'teable_space_create',
          description: 'Create a new space',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' }
            }
          }
        }
      ];
    });

    it('应该根据名称查找工具', () => {
      const tool = client.getTool('teable_user_register');

      expect(tool).toEqual({
        name: 'teable_user_register',
        description: 'Register a new user',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' }
          }
        }
      });
    });

    it('应该返回 undefined 对于不存在的工具', () => {
      const tool = client.getTool('non_existent_tool');

      expect(tool).toBeUndefined();
    });

    it('应该根据前缀查找工具', () => {
      const teableTools = client.getToolsByPrefix('teable_user');

      expect(teableTools).toHaveLength(1);
      expect(teableTools[0].name).toBe('teable_user_register');
    });

    it('应该返回空数组对于不匹配的前缀', () => {
      const tools = client.getToolsByPrefix('unknown_prefix');

      expect(tools).toEqual([]);
    });

    it('应该获取所有工具名称', () => {
      const toolNames = client.getAllToolNames();

      expect(toolNames).toEqual([
        'teable_user_register',
        'teable_space_create'
      ]);
    });
  });

  describe('批量工具调用', () => {
    beforeEach(() => {
      client.connected = true;
      client.tools = [
        {
          name: 'teable_user_register',
          description: 'Register a new user',
          inputSchema: { type: 'object' }
        },
        {
          name: 'teable_space_create',
          description: 'Create a new space',
          inputSchema: { type: 'object' }
        }
      ];
    });

    it('应该批量调用工具', async () => {
      const mockResponses = [
        {
          jsonrpc: '2.0',
          id: 1,
          result: {
            content: [{ type: 'text', text: 'User registered' }]
          }
        },
        {
          jsonrpc: '2.0',
          id: 2,
          result: {
            content: [{ type: 'text', text: 'Space created' }]
          }
        }
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponses[0]),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponses[1]),
        } as Response);

      const calls = [
        {
          name: 'teable_user_register',
          arguments: { name: 'John', email: 'john@example.com', password: 'pass' }
        },
        {
          name: 'teable_space_create',
          arguments: { name: 'My Space', description: 'A test space' }
        }
      ];

      const results = await client.callToolsBatch(calls);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ content: [{ type: 'text', text: 'User registered' }] });
      expect(results[1]).toEqual({ content: [{ type: 'text', text: 'Space created' }] });
    });

    it('应该处理批量调用中的部分失败', async () => {
      const mockResponses = [
        {
          jsonrpc: '2.0',
          id: 1,
          result: {
            content: [{ type: 'text', text: 'User registered' }]
          }
        },
        {
          jsonrpc: '2.0',
          id: 2,
          error: {
            code: -32602,
            message: 'Invalid params'
          }
        }
      ];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponses[0]),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponses[1]),
        } as Response);

      const calls = [
        {
          name: 'teable_user_register',
          arguments: { name: 'John', email: 'john@example.com', password: 'pass' }
        },
        {
          name: 'teable_space_create',
          arguments: { name: '', description: 'A test space' } // 空名称应该失败
        }
      ];

      await expect(client.callToolsBatch(calls)).rejects.toThrow('Invalid params');
    });
  });

  describe('错误处理', () => {
    it('应该处理 HTTP 错误响应', async () => {
      client.connected = true;
      client.tools = [
        {
          name: 'teable_user_register',
          description: 'Register a new user',
          inputSchema: { type: 'object' }
        }
      ];

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ error: 'Server error' }),
      } as Response);

      await expect(
        client.callTool('teable_user_register', {})
      ).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('应该处理无效的 JSON 响应', async () => {
      client.connected = true;
      client.tools = [
        {
          name: 'teable_user_register',
          description: 'Register a new user',
          inputSchema: { type: 'object' }
        }
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response);

      await expect(
        client.callTool('teable_user_register', {})
      ).rejects.toThrow('Invalid JSON');
    });
  });
});
