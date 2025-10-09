import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  it('应该正确渲染输入框', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);

    expect(screen.getByPlaceholderText(/输入你的需求/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /发送/ })).toBeInTheDocument();
  });

  it('应该处理输入和发送消息', async () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText(/输入你的需求/);
    const sendButton = screen.getByRole('button', { name: /发送/ });

    fireEvent.change(input, { target: { value: '创建一个表格' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledWith('创建一个表格');
    });

    // 输入框应该被清空
    expect(input).toHaveValue('');
  });

  it('应该处理回车键发送', async () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText(/输入你的需求/);

    fireEvent.change(input, { target: { value: '创建一个字段' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledWith('创建一个字段');
    });
  });

  it('应该处理 Shift+Enter 换行', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText(/输入你的需求/);

    fireEvent.change(input, { target: { value: '第一行\n第二行' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    // 不应该发送消息
    expect(mockOnSend).not.toHaveBeenCalled();
    expect(input).toHaveValue('第一行\n第二行');
  });

  it('应该禁用输入当 loading 为 true', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} loading={true} />);

    const input = screen.getByPlaceholderText(/输入你的需求/);
    const sendButton = screen.getByRole('button', { name: /发送/ });

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('应该禁用输入当 disabled 为 true', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} disabled={true} />);

    const input = screen.getByPlaceholderText(/请先确认或取消当前操作/);
    const sendButton = screen.getByRole('button', { name: /发送/ });

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('应该显示自定义占位符文本', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} placeholder="请输入您的需求" />);

    expect(screen.getByPlaceholderText('请输入您的需求')).toBeInTheDocument();
  });

  it('应该显示自定义禁用提示', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} disabled={true} disabledPlaceholder="当前不可输入" />);

    expect(screen.getByPlaceholderText('当前不可输入')).toBeInTheDocument();
  });

  it('应该不发送空消息', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText(/输入你的需求/);
    const sendButton = screen.getByRole('button', { name: /发送/ });

    // 尝试发送空消息
    fireEvent.click(sendButton);
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('应该不发送只包含空白字符的消息', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText(/输入你的需求/);
    const sendButton = screen.getByRole('button', { name: /发送/ });

    // 尝试发送只包含空白的消息
    fireEvent.change(input, { target: { value: '   \n\t   ' } });
    fireEvent.click(sendButton);

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('应该自动调整文本域高度', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText(/输入你的需求/);

    // 输入多行文本
    fireEvent.change(input, { target: { value: '第一行\n第二行\n第三行' } });

    // 应该自动调整高度
    expect(input).toHaveValue('第一行\n第二行\n第三行');
  });

  it('应该处理粘贴内容', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText(/输入你的需求/);

    // 模拟粘贴事件
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => '粘贴的内容',
      },
    });

    fireEvent.change(input, { target: { value: '粘贴的内容' } });

    expect(input).toHaveValue('粘贴的内容');
  });

  it('应该处理焦点事件', () => {
    const mockOnSend = jest.fn();
    const mockOnFocus = jest.fn();
    const mockOnBlur = jest.fn();

    render(<ChatInput onSend={mockOnSend} onFocus={mockOnFocus} onBlur={mockOnBlur} />);

    const input = screen.getByPlaceholderText(/输入你的需求/);

    fireEvent.focus(input);
    expect(mockOnFocus).toHaveBeenCalled();

    fireEvent.blur(input);
    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('应该处理输入变化事件', () => {
    const mockOnSend = jest.fn();
    const mockOnChange = jest.fn();

    render(<ChatInput onSend={mockOnSend} onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(/输入你的需求/);

    fireEvent.change(input, { target: { value: '测试输入' } });

    expect(mockOnChange).toHaveBeenCalledWith('测试输入');
  });

  it('应该显示发送按钮的加载状态', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} loading={true} />);

    const sendButton = screen.getByRole('button', { name: /发送/ });

    // 应该显示加载图标
    expect(sendButton).toHaveAttribute('disabled');
  });

  it('应该处理键盘快捷键', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText(/输入你的需求/);

    fireEvent.change(input, { target: { value: '测试消息' } });

    // Ctrl+Enter 应该发送消息
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });

    expect(mockOnSend).toHaveBeenCalledWith('测试消息');
  });

  it('应该处理最大长度限制', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} maxLength={10} />);

    const input = screen.getByPlaceholderText(/输入你的需求/);

    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('应该处理自动完成属性', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} autoComplete="off" />);

    const input = screen.getByPlaceholderText(/输入你的需求/);

    expect(input).toHaveAttribute('autoComplete', 'off');
  });
});
