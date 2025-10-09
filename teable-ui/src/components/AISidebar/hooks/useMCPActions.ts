import { useCallback } from 'react';
import { ParsedIntent, MCPAction } from '../types';
import teable from '@/lib/teable-simple';
import { useToast } from '@/hooks/use-toast';

// 预定义的选项颜色
const CHOICE_COLORS = [
  '#4CAF50', // 绿色
  '#2196F3', // 蓝色
  '#FF9800', // 橙色
  '#9C27B0', // 紫色
  '#F44336', // 红色
  '#00BCD4', // 青色
  '#FFEB3B', // 黄色
  '#795548', // 棕色
  '#607D8B', // 灰色
  '#E91E63', // 粉色
];

// 获取选项颜色
const getChoiceColor = (index: number): string => {
  return CHOICE_COLORS[index % CHOICE_COLORS.length];
};

// 验证和修正记录字段数据格式
export const validateAndFixRecordFields = (fields: Record<string, any>): Record<string, any> => {
  const validatedFields: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) {
      validatedFields[key] = value;
      continue;
    }
    
    // 检查是否是JSON字符串格式的数组（常见错误）
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 如果是数组，取第一个元素作为值
          console.warn(`字段 ${key} 的值是数组格式，取第一个元素: ${parsed[0]}`);
          validatedFields[key] = parsed[0];
          continue;
        }
      } catch (e) {
        // 解析失败，保持原值
      }
    }
    
    // 检查是否是数组格式
    if (Array.isArray(value) && value.length > 0) {
      console.warn(`字段 ${key} 的值是数组格式，取第一个元素: ${value[0]}`);
      validatedFields[key] = value[0];
      continue;
    }
    
    // 其他情况保持原值
    validatedFields[key] = value;
  }
  
  return validatedFields;
};

// 生成记录数据
export const generateRecordData = (template: Record<string, any>, index: number): Record<string, any> => {
  const data: Record<string, any> = {};
  
  // 预定义的随机数据
  const randomNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
  const randomAges = [20, 25, 30, 35, 40, 45, 50];
  const randomEmails = ['zhang@example.com', 'li@example.com', 'wang@example.com', 'zhao@example.com'];
  const randomDepartments = ['技术部', '销售部', '市场部', '人事部', '财务部'];
  
  for (const [key, value] of Object.entries(template)) {
    if (typeof value === 'string') {
      switch (value.toLowerCase()) {
        case '随机姓名':
        case 'random name':
          data[key] = randomNames[index % randomNames.length];
          break;
        case '随机年龄':
        case 'random age':
          data[key] = randomAges[index % randomAges.length];
          break;
        case '随机邮箱':
        case 'random email':
          data[key] = randomEmails[index % randomEmails.length];
          break;
        case '随机部门':
        case 'random department':
          data[key] = randomDepartments[index % randomDepartments.length];
          break;
        default:
          data[key] = value;
      }
    } else {
      data[key] = value;
    }
  }
  
  return data;
};

// 修复常见的 JSON 格式错误
const fixJSONFormat = (jsonString: string): string => {
  let fixed = jsonString;
  
  // 0. 修复字符串值中的控制字符（换行符等）
  // 将字符串值中的实际换行符替换为转义的换行符
  fixed = fixed.replace(/"([^"]*?)"/g, (match, p1) => {
    const escaped = p1
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return `"${escaped}"`;
  });
  
  // 1. 检查是否缺少最后的闭合括号
  const openBraces = (fixed.match(/\{/g) || []).length;
  const closeBraces = (fixed.match(/\}/g) || []).length;
  
  if (openBraces > closeBraces) {
    // 添加缺少的闭合括号
    const missingBraces = openBraces - closeBraces;
    fixed += '}'.repeat(missingBraces);
  }
  
  // 2. 检查是否缺少最后的闭合方括号
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/\]/g) || []).length;
  
  if (openBrackets > closeBrackets) {
    // 添加缺少的闭合方括号
    const missingBrackets = openBrackets - closeBrackets;
    fixed += ']'.repeat(missingBrackets);
  }
  
  // 3. 修复常见的引号问题
  fixed = fixed.replace(/"/g, '"'); // 替换智能引号为普通引号
  
  // 4. 移除末尾可能的逗号
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
  
  // 5. 检查是否缺少 response 字段
  if (!fixed.includes('"response"') && fixed.includes('"action"')) {
    // 尝试解析 JSON 并添加缺失的 response 字段
    try {
      const parsed = JSON.parse(fixed);
      if (parsed.action && !parsed.response) {
        // 根据 action 类型生成默认 response
        const actionLabels: Record<string, string> = {
          'create_field': '字段创建',
          'create_fields_batch': '批量创建字段',
          'create_table': '表格创建',
          'create_base': '数据库创建',
          'create_space': '空间创建',
          'create_record': '记录创建',
          'create_record_batch': '批量创建记录',
        };
        
        const actionLabel = actionLabels[parsed.action] || parsed.action;
        parsed.response = `好的，我将执行${actionLabel}操作`;
        fixed = JSON.stringify(parsed);
      }
    } catch (e) {
      // 如果解析失败，尝试手动添加 response 字段
      if (fixed.endsWith('}')) {
        fixed = fixed.slice(0, -1) + ',"response":"好的，我将执行此操作"}';
      }
    }
  }
  
  return fixed;
};

export const useMCPActions = () => {
  const { toast } = useToast();

  const parseIntent = useCallback((aiResponse: string): ParsedIntent | null => {
    try {
      // 移除可能的 markdown 代码块标记
      let cleanedResponse = aiResponse.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }
      
      // 尝试修复常见的 JSON 格式错误
      cleanedResponse = fixJSONFormat(cleanedResponse);
      
      const parsed = JSON.parse(cleanedResponse);
      
      // 验证必需字段
      if (!parsed.response) {
        throw new Error('缺少 response 字段');
      }
      
      return parsed as ParsedIntent;
    } catch (err: any) {
      console.error('解析 AI 响应失败:', err, aiResponse);
      return null;
    }
  }, []);

  const executeAction = useCallback(async (intent: ParsedIntent): Promise<any> => {
    try {
      switch (intent.action) {
        case 'create_space': {
          const response = await teable.createSpace({
            name: intent.params.name,
            description: intent.params.description,
          });
          return response.data;
        }

        case 'create_base': {
          const response = await teable.createBase({
            space_id: intent.params.space_id,
            name: intent.params.name,
            description: intent.params.description,
          });
          return response.data;
        }

        case 'create_table': {
          const response = await teable.createTable({
            base_id: intent.params.base_id,
            name: intent.params.name,
            description: intent.params.description,
          });
          return response.data;
        }

        case 'create_field': {
          // 转换 options 格式（兼容简化格式和完整格式）
          let options = intent.params.options;
          if (options && options.choices && Array.isArray(options.choices)) {
            // 检查是否是简化格式（字符串数组）
            if (options.choices.length > 0 && typeof options.choices[0] === 'string') {
              // 转换为完整格式
              options = {
                choices: options.choices.map((choice: string, index: number) => ({
                  id: `choice_${index + 1}`,
                  label: choice,
                  value: choice.toLowerCase().replace(/\s+/g, '_'),
                  color: getChoiceColor(index),
                })),
              };
            }
          }

          const response = await teable.createField({
            table_id: intent.params.table_id,
            name: intent.params.name,
            type: intent.params.type,
            description: intent.params.description,
            is_unique: intent.params.is_unique,
            required: intent.params.required,
            options: options ? JSON.stringify(options) : undefined, // 序列化为 JSON 字符串
          });
          return response.data;
        }

        case 'create_fields_batch': {
          // 批量创建字段
          const fields = intent.params.fields || [];
          const results = [];
          
          for (const field of fields) {
            try {
              // 转换 options 格式（兼容简化格式和完整格式）
              let options = field.options;
              if (options && options.choices && Array.isArray(options.choices)) {
                // 检查是否是简化格式（字符串数组）
                if (options.choices.length > 0 && typeof options.choices[0] === 'string') {
                  // 转换为完整格式
                  options = {
                    choices: options.choices.map((choice: string, index: number) => ({
                      id: `choice_${index + 1}`,
                      label: choice,
                      value: choice.toLowerCase().replace(/\s+/g, '_'),
                      color: getChoiceColor(index),
                    })),
                  };
                }
              }

              const response = await teable.createField({
                table_id: intent.params.table_id,
                name: field.name,
                type: field.type,
                description: field.description,
                is_unique: field.is_unique,
                required: field.required,
                options: options ? JSON.stringify(options) : undefined, // 序列化为 JSON 字符串
              });
              results.push({ success: true, field: field.name, data: response.data });
            } catch (error: any) {
              results.push({ success: false, field: field.name, error: error.message });
            }
          }
          
          return {
            total: fields.length,
            succeeded: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
          };
        }

        case 'create_record': {
          // 验证和修正字段数据格式
          const validatedFields = validateAndFixRecordFields(intent.params.fields);
          
          const response = await teable.createRecord({
            table_id: intent.params.table_id,
            fields: validatedFields,
          });
          return response.data;
        }

        case 'create_record_batch': {
          // 批量创建记录
          const count = intent.params.count || 1;
          const template = intent.params.template || {};
          const results = [];
          
          for (let i = 0; i < count; i++) {
            try {
              // 为每条记录生成不同的数据
              const fields = generateRecordData(template, i);
              const validatedFields = validateAndFixRecordFields(fields);
              
              const response = await teable.createRecord({
                table_id: intent.params.table_id,
                fields: validatedFields,
              });
              results.push({ success: true, index: i, data: response.data });
            } catch (error: any) {
              results.push({ success: false, index: i, error: error.message });
            }
          }
          
          return {
            total: count,
            succeeded: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
          };
        }

        case 'list_tables': {
          const response = await teable.listTables({
            base_id: intent.params.base_id,
            limit: intent.params.limit || 100,
          });
          return response.data;
        }

        case 'get_base': {
          const response = await teable.getBase(intent.params.base_id);
          return response.data;
        }

        case 'get_field': {
          const response = await teable.getField(intent.params.field_id);
          return response.data;
        }

        case 'update_field': {
          const response = await teable.updateField(intent.params.field_id, {
            name: intent.params.name,
            type: intent.params.type,
            description: intent.params.description,
            // options 直接传递对象，在 updateField 方法中会自动序列化
            options: intent.params.options,
          });
          return response.data;
        }

        case 'delete_field': {
          await teable.deleteField(intent.params.field_id, intent.params.table_id);
          return { message: '字段删除成功' };
        }

        default:
          throw new Error(`未知操作: ${intent.action}`);
      }
    } catch (err: any) {
      console.error('执行 MCP 操作失败:', err);
      throw err;
    }
  }, []);

  const getActionLabel = useCallback((action: MCPAction): string => {
    const labels: Record<MCPAction, string> = {
      create_space: '创建空间',
      create_base: '创建数据库',
      create_table: '创建表格',
      create_field: '创建字段',
      create_fields_batch: '批量创建字段',
      create_record: '创建记录',
      create_record_batch: '批量创建记录',
      list_tables: '列出表格',
      get_base: '获取数据库',
      get_field: '获取字段',
      update_field: '更新字段',
      delete_field: '删除字段',
    };
    return labels[action] || action;
  }, []);

  return {
    parseIntent,
    executeAction,
    getActionLabel,
  };
};

