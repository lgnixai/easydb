/**
 * File Uploader - 文件上传组件
 */

import { useCallback } from 'react'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FileUploaderProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number
  className?: string
}

export function FileUploader({ 
  onFileSelect, 
  accept = '.csv',
  maxSize = 10 * 1024 * 1024,  // 10MB
  className 
}: FileUploaderProps) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    
    const files = Array.from(e.dataTransfer.files)
    const file = files[0]
    
    if (!file) return
    
    // 检查文件类型
    if (accept && !file.name.toLowerCase().endsWith(accept.replace('.', ''))) {
      alert(`请上传 ${accept} 格式的文件`)
      return
    }
    
    // 检查文件大小
    if (maxSize && file.size > maxSize) {
      alert(`文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }
    
    onFileSelect(file)
  }, [accept, maxSize, onFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    onFileSelect(file)
  }, [onFileSelect])

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer",
        className
      )}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      
      <h3 className="text-lg font-medium mb-2">
        选择 CSV 文件
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4">
        拖拽文件到这里，或点击选择文件
      </p>
      
      <p className="text-xs text-muted-foreground">
        支持 {accept} 格式，最大 {Math.round((maxSize || 0) / 1024 / 1024)}MB
      </p>

      <input
        id="file-input"
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  )
}

