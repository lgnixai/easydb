import { render, screen, fireEvent } from '@testing-library/react';
import { ActionCard } from '../ActionCard';
import { Action } from '../types';

describe('ActionCard', () => {
  const mockAction: Action = {
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
  };

  it('应该正确渲染确认操作卡片', () => {
    const mockOnConfirm = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <ActionCard
        action={mockAction}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('确认创建字段')).toBeInTheDocument();
    expect(screen.getByText('是否要创建姓名字段？')).toBeInTheDocument();
    expect(screen.getByText('确认创建')).toBeInTheDocument();
    expect(screen.getByText('取消')).toBeInTheDocument();
  });

  it('应该处理确认操作', () => {
    const mockOnConfirm = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <ActionCard
        action={mockAction}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByText('确认创建');
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledWith(mockAction);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('应该处理取消操作', () => {
    const mockOnConfirm = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <ActionCard
        action={mockAction}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('应该渲染执行中的操作卡片', () => {
    const executingAction: Action = {
      type: 'executing',
      action: 'create_field',
      params: {
        table_id: 'tbl_123',
        name: '姓名',
        type: 'text',
      },
      title: '正在创建字段',
      description: '正在创建姓名字段，请稍候...',
    };

    render(<ActionCard action={executingAction} />);

    expect(screen.getByText('正在创建字段')).toBeInTheDocument();
    expect(screen.getByText('正在创建姓名字段，请稍候...')).toBeInTheDocument();
    
    // 应该显示加载动画
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('应该渲染成功结果卡片', () => {
    const successAction: Action = {
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
    };

    render(<ActionCard action={successAction} />);

    expect(screen.getByText('字段创建成功')).toBeInTheDocument();
    expect(screen.getByText('姓名字段已成功创建')).toBeInTheDocument();
    
    // 应该显示成功图标
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('应该渲染错误结果卡片', () => {
    const errorAction: Action = {
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
    };

    render(<ActionCard action={errorAction} />);

    expect(screen.getByText('字段创建失败')).toBeInTheDocument();
    expect(screen.getByText('创建姓名字段时发生错误')).toBeInTheDocument();
    expect(screen.getByText('请求参数错误')).toBeInTheDocument();
    
    // 应该显示错误图标
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('应该渲染批量操作结果卡片', () => {
    const batchAction: Action = {
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
    };

    render(<ActionCard action={batchAction} />);

    expect(screen.getByText('批量创建字段成功')).toBeInTheDocument();
    expect(screen.getByText('已成功创建 2 个字段')).toBeInTheDocument();
    
    // 应该显示详细结果
    expect(screen.getByText('✅ 姓名 (text)')).toBeInTheDocument();
    expect(screen.getByText('✅ 年龄 (number)')).toBeInTheDocument();
  });

  it('应该渲染部分失败的批量操作结果', () => {
    const partialFailureAction: Action = {
      type: 'error',
      action: 'create_fields_batch',
      params: {
        table_id: 'tbl_123',
        fields: [
          { name: '姓名', type: 'text' },
          { name: '性别', type: 'select', options: { choices: ['男', '女'] } },
        ],
      },
      title: '批量创建字段部分失败',
      description: '创建了 1 个字段，1 个失败',
      result: {
        total: 2,
        succeeded: 1,
        failed: 1,
        results: [
          { success: true, field: '姓名', data: { id: 'fld_1', name: '姓名', type: 'text' } },
          { success: false, field: '性别', error: '请求参数错误' },
        ],
      },
    };

    render(<ActionCard action={partialFailureAction} />);

    expect(screen.getByText('批量创建字段部分失败')).toBeInTheDocument();
    expect(screen.getByText('创建了 1 个字段，1 个失败')).toBeInTheDocument();
    
    // 应该显示成功和失败的结果
    expect(screen.getByText('✅ 姓名 (text)')).toBeInTheDocument();
    expect(screen.getByText('❌ 性别 (select)')).toBeInTheDocument();
  });

  it('应该显示操作参数详情', () => {
    const detailedAction: Action = {
      type: 'confirmation',
      action: 'create_table',
      params: {
        base_id: 'base_123',
        name: '学生信息表',
        description: '存储学生基本信息',
      },
      title: '确认创建表格',
      description: '是否要创建表格"学生信息表"？',
      showParams: true,
      confirmText: '确认创建',
      cancelText: '取消',
    };

    render(<ActionCard action={detailedAction} />);

    expect(screen.getByText('确认创建表格')).toBeInTheDocument();
    expect(screen.getByText('是否要创建表格"学生信息表"？')).toBeInTheDocument();
    
    // 应该显示参数详情
    expect(screen.getByText('表格名称: 学生信息表')).toBeInTheDocument();
    expect(screen.getByText('描述: 存储学生基本信息')).toBeInTheDocument();
  });

  it('应该处理自定义按钮文本', () => {
    const customAction: Action = {
      type: 'confirmation',
      action: 'delete_table',
      params: { table_id: 'tbl_123' },
      title: '确认删除表格',
      description: '此操作不可撤销',
      confirmText: '确认删除',
      cancelText: '保留表格',
    };

    const mockOnConfirm = jest.fn();
    const mockOnCancel = jest.fn();

    render(
      <ActionCard
        action={customAction}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('确认删除')).toBeInTheDocument();
    expect(screen.getByText('保留表格')).toBeInTheDocument();
  });

  it('应该处理无回调的情况', () => {
    render(<ActionCard action={mockAction} />);

    // 应该仍然渲染，但不应该有交互功能
    expect(screen.getByText('确认创建字段')).toBeInTheDocument();
    
    // 按钮应该被禁用或不可点击
    const confirmButton = screen.getByText('确认创建');
    const cancelButton = screen.getByText('取消');
    
    expect(confirmButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });
});
