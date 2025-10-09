import { renderHook, act } from '@testing-library/react';
import { useMCPActions } from '../hooks/useMCPActions';
import teable from '@/lib/teable-simple';

// Mock teable
jest.mock('@/lib/teable-simple', () => ({
  default: {
    createSpace: jest.fn(),
    createBase: jest.fn(),
    createTable: jest.fn(),
    createField: jest.fn(),
    createRecord: jest.fn(),
    listTables: jest.fn(),
    getBase: jest.fn(),
    getField: jest.fn(),
    deleteField: jest.fn(),
  }
}));

// Mock useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockTeable = teable as jest.Mocked<typeof teable>;

describe('useMCPActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseIntent', () => {
    it('应该正确解析有效的 JSON 响应', () => {
      const { result } = renderHook(() => useMCPActions());
      
      const validResponse = JSON.stringify({
        action: 'create_field',
        params: { table_id: 'tbl_123', name: '姓名', type: 'text' },
        requiresConfirmation: true,
        confirmation: '确认创建字段？',
        response: '好的，我将创建姓名字段'
      });

      const parsed = result.current.parseIntent(validResponse);

      expect(parsed).toEqual({
        action: 'create_field',
        params: { table_id: 'tbl_123', name: '姓名', type: 'text' },
        requiresConfirmation: true,
        confirmation: '确认创建字段？',
        response: '好的，我将创建姓名字段'
      });
    });

    it('应该修复缺少闭合括号的 JSON', () => {
      const { result } = renderHook(() => useMCPActions());
      
      const brokenJSON = '{"action":"create_field","params":{"table_id":"tbl_123","name":"姓名","type":"text"},"response":"好的"}';
      
      const parsed = result.current.parseIntent(brokenJSON);

      expect(parsed).not.toBeNull();
      expect(parsed?.action).toBe('create_field');
    });

    it('应该自动补全缺失的 response 字段', () => {
      const { result } = renderHook(() => useMCPActions());
      
      const jsonWithoutResponse = '{"action":"create_field","params":{"table_id":"tbl_123","name":"姓名","type":"text"}}';
      
      const parsed = result.current.parseIntent(jsonWithoutResponse);

      expect(parsed).not.toBeNull();
      expect(parsed?.response).toContain('字段创建');
    });

    it('应该处理 markdown 代码块格式', () => {
      const { result } = renderHook(() => useMCPActions());
      
      const markdownResponse = `\`\`\`json
{"action":"create_field","params":{"table_id":"tbl_123","name":"姓名","type":"text"},"response":"好的"}
\`\`\``;
      
      const parsed = result.current.parseIntent(markdownResponse);

      expect(parsed).not.toBeNull();
      expect(parsed?.action).toBe('create_field');
    });

    it('应该返回 null 对于无效的 JSON', () => {
      const { result } = renderHook(() => useMCPActions());
      
      const invalidJSON = '这不是一个有效的 JSON';
      
      const parsed = result.current.parseIntent(invalidJSON);

      expect(parsed).toBeNull();
    });
  });

  describe('executeAction', () => {
    it('应该正确执行创建字段操作', async () => {
      const { result } = renderHook(() => useMCPActions());
      
      const mockResponse = { data: { id: 'fld_123', table_id: 'tbl_123', name: '姓名', type: 'text' } };
      mockTeable.createField.mockResolvedValue(mockResponse);

      const intent = {
        action: 'create_field' as const,
        params: { table_id: 'tbl_123', name: '姓名', type: 'text' },
        response: '好的'
      };

      await act(async () => {
        const response = await result.current.executeAction(intent);
        expect(response).toEqual(mockResponse.data);
      });

      expect(mockTeable.createField).toHaveBeenCalledWith({
        table_id: 'tbl_123',
        name: '姓名',
        type: 'text',
        description: undefined,
        is_unique: undefined,
        required: undefined,
        options: undefined,
      });
    });

    it('应该正确执行批量创建字段操作', async () => {
      const { result } = renderHook(() => useMCPActions());
      
      const mockResponse1 = { data: { id: 'fld_1', table_id: 'tbl_123', name: '性别', type: 'select' } };
      const mockResponse2 = { data: { id: 'fld_2', table_id: 'tbl_123', name: '年龄', type: 'number' } };
      
      mockTeable.createField
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2);

      const intent = {
        action: 'create_fields_batch' as const,
        params: {
          table_id: 'tbl_123',
          fields: [
            { name: '性别', type: 'select', options: { choices: ['男', '女'] } },
            { name: '年龄', type: 'number' }
          ]
        },
        response: '好的'
      };

      await act(async () => {
        const response = await result.current.executeAction(intent);
        
        expect(response.total).toBe(2);
        expect(response.succeeded).toBe(2);
        expect(response.failed).toBe(0);
        expect(response.results).toHaveLength(2);
      });

      expect(mockTeable.createField).toHaveBeenCalledTimes(2);
    });

    it('应该正确转换选择字段的 options 格式', async () => {
      const { result } = renderHook(() => useMCPActions());
      
      const mockResponse = { data: { id: 'fld_123', table_id: 'tbl_123', name: '性别', type: 'select' } };
      mockTeable.createField.mockResolvedValue(mockResponse);

      const intent = {
        action: 'create_field' as const,
        params: {
          table_id: 'tbl_123',
          name: '性别',
          type: 'select',
          options: { choices: ['男', '女'] }
        },
        response: '好的'
      };

      await act(async () => {
        await result.current.executeAction(intent);
      });

      expect(mockTeable.createField).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.stringContaining('choices'),
        })
      );
    });

    it('应该处理批量创建中的部分失败', async () => {
      const { result } = renderHook(() => useMCPActions());
      
      const mockResponse1 = { data: { id: 'fld_1', table_id: 'tbl_123', name: '性别', type: 'select' } };
      
      mockTeable.createField
        .mockResolvedValueOnce(mockResponse1)
        .mockRejectedValueOnce(new Error('创建失败'));

      const intent = {
        action: 'create_fields_batch' as const,
        params: {
          table_id: 'tbl_123',
          fields: [
            { name: '性别', type: 'select', options: { choices: ['男', '女'] } },
            { name: '年龄', type: 'number' }
          ]
        },
        response: '好的'
      };

      await act(async () => {
        const response = await result.current.executeAction(intent);
        
        expect(response.total).toBe(2);
        expect(response.succeeded).toBe(1);
        expect(response.failed).toBe(1);
        expect(response.results[0].success).toBe(true);
        expect(response.results[1].success).toBe(false);
      });
    });

    it('应该正确执行删除字段操作', async () => {
      const { result } = renderHook(() => useMCPActions());
      
      mockTeable.deleteField.mockResolvedValue(undefined);

      const intent = {
        action: 'delete_field' as const,
        params: { field_id: 'fld_123', table_id: 'tbl_123' },
        response: '好的'
      };

      await act(async () => {
        const response = await result.current.executeAction(intent);
        expect(response).toEqual({ message: '字段删除成功' });
      });

      expect(mockTeable.deleteField).toHaveBeenCalledWith('fld_123', 'tbl_123');
    });

    it('应该抛出错误对于未知操作', async () => {
      const { result } = renderHook(() => useMCPActions());
      
      const intent = {
        action: 'unknown_action' as any,
        params: {},
        response: '好的'
      };

      await act(async () => {
        await expect(result.current.executeAction(intent)).rejects.toThrow('未知操作');
      });
    });
  });

  describe('getActionLabel', () => {
    it('应该返回正确的操作标签', () => {
      const { result } = renderHook(() => useMCPActions());
      
      expect(result.current.getActionLabel('create_field')).toBe('创建字段');
      expect(result.current.getActionLabel('create_fields_batch')).toBe('批量创建字段');
      expect(result.current.getActionLabel('create_table')).toBe('创建表格');
      expect(result.current.getActionLabel('create_base')).toBe('创建数据库');
      expect(result.current.getActionLabel('create_space')).toBe('创建空间');
      expect(result.current.getActionLabel('delete_field')).toBe('删除字段');
    });
  });
});
