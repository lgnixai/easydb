/**
 * Field Mapper - 字段映射组件
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface FieldMapperProps {
  csvHeaders: string[]
  tableFields: Array<{ id: string, name: string, type: string, required?: boolean }>
  mapping: Record<string, string>
  onChange: (mapping: Record<string, string>) => void
}

export function FieldMapper({ csvHeaders, tableFields, mapping, onChange }: FieldMapperProps) {
  const handleFieldChange = (columnKey: string, fieldId: string) => {
    if (fieldId === '') {
      // 清空映射
      const newMapping = { ...mapping }
      delete newMapping[columnKey]
      onChange(newMapping)
    } else {
      onChange({
        ...mapping,
        [columnKey]: fieldId
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">字段映射</h3>
        <span className="text-xs text-muted-foreground">
          将 CSV 列映射到表字段
        </span>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 text-sm font-medium">CSV 列</th>
              <th className="text-left p-3 text-sm font-medium">→</th>
              <th className="text-left p-3 text-sm font-medium">表字段</th>
            </tr>
          </thead>
          <tbody>
            {csvHeaders.map((header, index) => {
              const columnKey = `col_${index}`
              const selectedFieldId = mapping[columnKey]
              const selectedField = tableFields.find(f => f.id === selectedFieldId)

              return (
                <tr key={index} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        列 {index + 1}
                      </span>
                      <span className="font-medium">{header}</span>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">→</td>
                  <td className="p-3">
                    <Select 
                      value={selectedFieldId || ''} 
                      onValueChange={(value) => handleFieldChange(columnKey, value)}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="选择字段..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          <span className="text-muted-foreground">（跳过此列）</span>
                        </SelectItem>
                        {tableFields.map(field => {
                          const isUsed = Object.values(mapping).includes(field.id) && field.id !== selectedFieldId

                          return (
                            <SelectItem 
                              key={field.id} 
                              value={field.id}
                              disabled={isUsed}
                            >
                              <div className="flex items-center gap-2">
                                <span>{field.name}</span>
                                {field.required && (
                                  <span className="text-xs text-destructive">*必填</span>
                                )}
                                {isUsed && (
                                  <span className="text-xs text-muted-foreground">（已使用）</span>
                                )}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground">
        提示：CSV 列已自动匹配到表字段，您可以调整映射关系
      </div>
    </div>
  )
}

