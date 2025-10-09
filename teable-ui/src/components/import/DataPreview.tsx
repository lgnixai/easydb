/**
 * Data Preview - 数据预览组件
 */

export interface DataPreviewProps {
  headers: string[]
  preview: any[][]
  totalRows: number
}

export function DataPreview({ headers, preview, totalRows }: DataPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">数据预览</h3>
        <span className="text-xs text-muted-foreground">
          共 {totalRows} 行数据（显示前 {preview.length} 行）
        </span>
      </div>

      <div className="border rounded-lg overflow-auto max-h-96">
        <table className="w-full">
          <thead className="bg-muted sticky top-0">
            <tr>
              <th className="text-left p-2 text-xs font-medium text-muted-foreground w-12">
                #
              </th>
              {headers.map((header, index) => (
                <th key={index} className="text-left p-2 text-sm font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t hover:bg-muted/50">
                <td className="p-2 text-xs text-muted-foreground">
                  {rowIndex + 1}
                </td>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="p-2 text-sm">
                    {cell || <span className="text-muted-foreground italic">（空）</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

