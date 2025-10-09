/**
 * Record Detail Modal - 记录详情模态框
 * 
 * 功能：
 * - 显示记录的所有字段
 * - 支持编辑所有字段
 * - 前一条/后一条导航
 * - 删除记录
 * - 键盘快捷键支持
 */

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FieldEditorFactory } from './FieldEditorFactory'

export interface RecordDetailModalProps {
  isOpen: boolean
  recordId: string | null
  tableId?: string
  records: Array<Record<string, any>>
  fields: Array<{ id: string, name: string, type: string, options?: any, required?: boolean }>
  onClose: () => void
  onUpdate: (recordId: string, fieldId: string, value: any) => void
  onDelete?: (recordId: string) => void
  onNavigate?: (direction: 'prev' | 'next') => void
}

export function RecordDetailModal({
  isOpen,
  recordId,
  tableId,
  records,
  fields,
  onClose,
  onUpdate,
  onDelete,
  onNavigate
}: RecordDetailModalProps) {
  const [localValues, setLocalValues] = useState<Record<string, any>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 查找当前记录
  const currentRecord = records.find(r => r.id === recordId)
  const currentIndex = records.findIndex(r => r.id === recordId)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < records.length - 1

  // 初始化本地值
  useEffect(() => {
    if (currentRecord) {
      setLocalValues({ ...currentRecord })
      setHasChanges(false)
      setError(null)
    }
  }, [currentRecord])

  // 键盘快捷键
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC 关闭
      if (e.key === 'Escape') {
        handleClose()
      }
      
      // Ctrl/Cmd + 左箭头 - 上一条
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowLeft' && hasPrev) {
        e.preventDefault()
        handleNavigate('prev')
      }
      
      // Ctrl/Cmd + 右箭头 - 下一条
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowRight' && hasNext) {
        e.preventDefault()
        handleNavigate('next')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, hasPrev, hasNext])

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm('有未保存的更改，确定要关闭吗？')
      if (!confirmed) return
    }
    onClose()
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setLocalValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
    setHasChanges(true)
    setError(null)

    // 自动保存
    if (recordId) {
      onUpdate(recordId, fieldId, value)
    }
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1
    const targetRecord = records[targetIndex]
    
    if (targetRecord) {
      onNavigate?.(direction)
    }
  }

  const handleDelete = () => {
    if (!recordId) return
    
    const confirmed = window.confirm('确定要删除这条记录吗？此操作不可撤销。')
    if (confirmed) {
      onDelete?.(recordId)
      onClose()
    }
  }

  if (!currentRecord) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        {/* 头部 */}
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>记录详情</DialogTitle>
            
            <div className="flex items-center gap-2">
              {/* 导航按钮 */}
              <div className="flex items-center gap-1 mr-4">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleNavigate('prev')}
                  disabled={!hasPrev}
                  title="上一条 (Ctrl/Cmd + ←)"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {records.length}
                </span>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleNavigate('next')}
                  disabled={!hasNext}
                  title="下一条 (Ctrl/Cmd + →)"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* 删除按钮 */}
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              {/* 关闭按钮 */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* 错误提示 */}
        {error && (
          <div className="px-6 pt-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* 字段列表 */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-6">
            {fields.map(field => (
              <div key={field.id} className="space-y-2">
                {/* 字段标签 */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">
                    {field.name}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </label>
                </div>

                {/* 字段编辑器 */}
                <FieldEditorFactory
                  field={field}
                  value={localValues[field.id]}
                  onChange={(value) => handleFieldChange(field.id, value)}
                />
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* 底部提示 */}
        {hasChanges && (
          <div className="px-6 py-3 border-t bg-muted/50 text-sm text-muted-foreground flex-shrink-0">
            更改已自动保存
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

