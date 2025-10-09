/**
 * CSV Parser - CSV 解析工具
 * 
 * 使用 PapaParse 库解析 CSV 文件
 */

import Papa from 'papaparse'

export interface ParsedCSVData {
  headers: string[]
  rows: any[][]
  preview: any[][]  // 前 10 行预览
}

export interface ParseCSVOptions {
  skipFirstRow?: boolean
  encoding?: string
  delimiter?: string
}

/**
 * 解析 CSV 文件
 */
export async function parseCSVFile(
  file: File,
  options: ParseCSVOptions = {}
): Promise<ParsedCSVData> {
  const {
    skipFirstRow = false,
    encoding = 'UTF-8',
    delimiter = ','
  } = options

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      encoding,
      delimiter,
      complete: (results) => {
        try {
          const data = results.data as any[][]
          
          if (!data || data.length === 0) {
            reject(new Error('CSV 文件为空'))
            return
          }

          // 提取头部
          const headers = data[0].map((h, i) => h || `Column ${i + 1}`)
          
          // 提取数据行
          const startIndex = skipFirstRow ? 1 : 0
          const rows = data.slice(startIndex).filter(row => 
            row.some(cell => cell !== null && cell !== undefined && cell !== '')
          )

          // 预览数据（前 10 行）
          const preview = rows.slice(0, 10)

          resolve({
            headers,
            rows,
            preview
          })
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        reject(new Error(`解析 CSV 文件失败: ${error.message}`))
      }
    })
  })
}

/**
 * 智能匹配字段
 * 
 * 根据列名自动匹配到表字段
 */
export function autoMatchFields(
  csvHeaders: string[],
  tableFields: Array<{ id: string, name: string }>
): Record<string, string> {
  const mapping: Record<string, string> = {}

  csvHeaders.forEach((header, index) => {
    // 尝试精确匹配
    const exactMatch = tableFields.find(
      f => f.name.toLowerCase() === header.toLowerCase()
    )

    if (exactMatch) {
      mapping[`col_${index}`] = exactMatch.id
      return
    }

    // 尝试包含匹配
    const partialMatch = tableFields.find(
      f => f.name.toLowerCase().includes(header.toLowerCase()) ||
           header.toLowerCase().includes(f.name.toLowerCase())
    )

    if (partialMatch) {
      mapping[`col_${index}`] = partialMatch.id
    }
  })

  return mapping
}

/**
 * 转换 CSV 数据为记录
 */
export function convertCSVToRecords(
  rows: any[][],
  headers: string[],
  fieldMapping: Record<string, string>
): Array<Record<string, any>> {
  return rows.map(row => {
    const record: Record<string, any> = {}

    headers.forEach((header, index) => {
      const columnKey = `col_${index}`
      const fieldId = fieldMapping[columnKey]

      if (fieldId) {
        const cellValue = row[index]
        
        // 跳过空值
        if (cellValue === null || cellValue === undefined || cellValue === '') {
          return
        }

        record[fieldId] = cellValue
      }
    })

    return record
  }).filter(record => Object.keys(record).length > 0)
}

/**
 * 验证导入数据
 */
export function validateImportData(
  records: Array<Record<string, any>>,
  fields: Array<{ id: string, name: string, type: string, required?: boolean }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 检查是否有数据
  if (records.length === 0) {
    errors.push('没有有效的数据行')
    return { valid: false, errors }
  }

  // 检查必填字段
  const requiredFields = fields.filter(f => f.required)
  
  if (requiredFields.length > 0) {
    const missingFields = requiredFields.filter(field => {
      return records.some(record => !record[field.id])
    })

    if (missingFields.length > 0) {
      errors.push(`缺少必填字段: ${missingFields.map(f => f.name).join(', ')}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

