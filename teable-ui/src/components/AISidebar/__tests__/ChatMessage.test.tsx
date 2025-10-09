import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';
import { Message } from '../types';

describe('ChatMessage', () => {
  it('应该正确渲染用户消息', () => {
    const userMessage: Message = {
      id: 'msg_1',
      role: 'user',
      content: '创建一个表格',
      timestamp: new Date('2025-10-08T10:00:00Z'),
    };

    render(<ChatMessage message={userMessage} />);

    expect(screen.getByText('创建一个表格')).toBeInTheDocument();
    expect(screen.getByText('👤')).toBeInTheDocument();
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
  });

  it('应该正确渲染 AI 助手消息', () => {
    const aiMessage: Message = {
      id: 'msg_2',
      role: 'assistant',
      content: '好的，我将为您创建表格',
      timestamp: new Date('2025-10-08T10:01:00Z'),
    };

    render(<ChatMessage message={aiMessage} />);

    expect(screen.getByText('好的，我将为您创建表格')).toBeInTheDocument();
    expect(screen.getByText('🤖')).toBeInTheDocument();
    expect(screen.getByText(/10:01/)).toBeInTheDocument();
  });

  it('应该渲染系统消息', () => {
    const systemMessage: Message = {
      id: 'msg_3',
      role: 'system',
      content: '系统提示信息',
      timestamp: new Date('2025-10-08T10:02:00Z'),
    };

    render(<ChatMessage message={systemMessage} />);

    expect(screen.getByText('系统提示信息')).toBeInTheDocument();
    expect(screen.getByText('🔧')).toBeInTheDocument();
  });

  it('应该渲染带操作的消息', () => {
    const messageWithAction: Message = {
      id: 'msg_4',
      role: 'assistant',
      content: '确认创建字段？',
      timestamp: new Date('2025-10-08T10:03:00Z'),
      action: {
        type: 'confirmation',
        action: 'create_field',
        params: {
          table_id: 'tbl_123',
          name: '姓名',
          type: 'text',
        },
        title: '确认创建字段',
        description: '是否要创建姓名字段？',
        confirmText: '确认创建',
        cancelText: '取消',
      },
    };

    render(<ChatMessage message={messageWithAction} />);

    expect(screen.getByText('确认创建字段？')).toBeInTheDocument();
    expect(screen.getByText('确认创建字段')).toBeInTheDocument();
    expect(screen.getByText('是否要创建姓名字段？')).toBeInTheDocument();
  });

  it('应该渲染执行中的操作', () => {
    const executingMessage: Message = {
      id: 'msg_5',
      role: 'assistant',
      content: '正在创建字段...',
      timestamp: new Date('2025-10-08T10:04:00Z'),
      action: {
        type: 'executing',
        action: 'create_field',
        params: {
          table_id: 'tbl_123',
          name: '姓名',
          type: 'text',
        },
        title: '正在创建字段',
        description: '请稍候...',
      },
    };

    render(<ChatMessage message={executingMessage} />);

    expect(screen.getByText('正在创建字段...')).toBeInTheDocument();
    expect(screen.getByText('正在创建字段')).toBeInTheDocument();
    expect(screen.getByText('请稍候...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // 加载动画
  });

  it('应该渲染成功结果', () => {
    const successMessage: Message = {
      id: 'msg_6',
      role: 'assistant',
      content: '字段创建成功',
      timestamp: new Date('2025-10-08T10:05:00Z'),
      action: {
        type: 'success',
        action: 'create_field',
        params: {
          table_id: 'tbl_123',
          name: '姓名',
          type: 'text',
        },
        title: '字段创建成功',
        description: '姓名字段已成功创建',
        result: {
          id: 'fld_123',
          name: '姓名',
          type: 'text',
        },
      },
    };

    render(<ChatMessage message={successMessage} />);

    expect(screen.getByText('字段创建成功')).toBeInTheDocument();
    expect(screen.getByText('姓名字段已成功创建')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('应该渲染错误结果', () => {
    const errorMessage: Message = {
      id: 'msg_7',
      role: 'assistant',
      content: '字段创建失败',
      timestamp: new Date('2025-10-08T10:06:00Z'),
      action: {
        type: 'error',
        action: 'create_field',
        params: {
          table_id: 'tbl_123',
          name: '姓名',
          type: 'text',
        },
        title: '字段创建失败',
        description: '创建姓名字段时发生错误',
        error: '请求参数错误',
      },
    };

    render(<ChatMessage message={errorMessage} />);

    expect(screen.getByText('字段创建失败')).toBeInTheDocument();
    expect(screen.getByText('创建姓名字段时发生错误')).toBeInTheDocument();
    expect(screen.getByText('请求参数错误')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('应该渲染批量操作结果', () => {
    const batchMessage: Message = {
      id: 'msg_8',
      role: 'assistant',
      content: '批量创建字段成功',
      timestamp: new Date('2025-10-08T10:07:00Z'),
      action: {
        type: 'success',
        action: 'create_fields_batch',
        params: {
          table_id: 'tbl_123',
          fields: [
            { name: '姓名', type: 'text' },
            { name: '年龄', type: 'number' },
          ],
        },
        title: '批量创建字段成功',
        description: '已成功创建 2 个字段',
        result: {
          total: 2,
          succeeded: 2,
          failed: 0,
          results: [
            { success: true, field: '姓名', data: { id: 'fld_1', name: '姓名', type: 'text' } },
            { success: true, field: '年龄', data: { id: 'fld_2', name: '年龄', type: 'number' } },
          ],
        },
      },
    };

    render(<ChatMessage message={batchMessage} />);

    expect(screen.getByText('批量创建字段成功')).toBeInTheDocument();
    expect(screen.getByText('已成功创建 2 个字段')).toBeInTheDocument();
    expect(screen.getByText('✅ 姓名 (text)')).toBeInTheDocument();
    expect(screen.getByText('✅ 年龄 (number)')).toBeInTheDocument();
  });

  it('应该正确格式化时间戳', () => {
    const message: Message = {
      id: 'msg_9',
      role: 'user',
      content: '测试消息',
      timestamp: new Date('2025-10-08T15:30:45Z'),
    };

    render(<ChatMessage message={message} />);

    expect(screen.getByText(/15:30/)).toBeInTheDocument();
  });

  it('应该处理长内容的消息', () => {
    const longMessage: Message = {
      id: 'msg_10',
      role: 'assistant',
      content: '这是一个非常长的消息内容，用于测试消息组件是否正确处理长文本内容，包括换行和特殊字符的处理。',
      timestamp: new Date('2025-10-08T10:08:00Z'),
    };

    render(<ChatMessage message={longMessage} />);

    expect(screen.getByText(/这是一个非常长的消息内容/)).toBeInTheDocument();
  });

  it('应该处理空内容的消息', () => {
    const emptyMessage: Message = {
      id: 'msg_11',
      role: 'assistant',
      content: '',
      timestamp: new Date('2025-10-08T10:09:00Z'),
    };

    render(<ChatMessage message={emptyMessage} />);

    // 应该渲染但内容为空
    expect(screen.getByText('🤖')).toBeInTheDocument();
    expect(screen.getByText(/10:09/)).toBeInTheDocument();
  });

  it('应该处理特殊字符内容', () => {
    const specialMessage: Message = {
      id: 'msg_12',
      role: 'user',
      content: '特殊字符：<script>alert("test")</script> & "quotes" & \'apostrophes\'',
      timestamp: new Date('2025-10-08T10:10:00Z'),
    };

    render(<ChatMessage message={specialMessage} />);

    // 应该正确转义特殊字符
    expect(screen.getByText(/特殊字符/)).toBeInTheDocument();
    expect(screen.getByText(/&/)).toBeInTheDocument();
  });
});
