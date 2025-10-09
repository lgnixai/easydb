/**
 * Import Dialog - 导入对话框
 * 
 * 完整的 CSV 导入流程：
 * 1. 文件上传
 * 2. 预览数据
 * 3. 字段映射
 * 4. 导入进度
 */

import { useState, useCallback } from 'react'
import { Upload, FileText, X, ChevronRight, ChevronLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileUploader } from './FileUploader'
import { FieldMapper } from './FieldMapper'
import { DataPreview } from './DataPreview'
import { parseCSVFile, autoMatchFields, convertCSVToRecords, validateImportData } from '@/lib/import/csv-parser'

enum ImportStep {
  Upload = 'upload',
  Preview = 'preview',
  Mapping = 'mapping',
  Importing = 'importing',
  Complete = 'complete'
}

export interface ImportDialogProps {
  isOpen: boolean
  fields: Array<{ id: string, name: string, type: string, required?: boolean }>
  onClose: () => void
  onImport: (records: Array<Record<string, any>>) => Promise<void>
}

export function ImportDialog({ isOpen, fields, onClose, onImport }: ImportDialogProps) {
  const [step, setStep] = useState<ImportStep>(ImportStep.Upload)
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCSVData] = useState<{ headers: string[], rows: any[][], preview: any[][] } | null>(null)
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [importedCount, setImportedCount] = useState(0)

  // 重置状态
  const resetState = () => {
    setStep(ImportStep.Upload)
    setFile(null)
    setCSVData(null)
    setFieldMapping({})
    setProgress(0)
    setError(null)
    setImportedCount(0)
  }

  // 处理文件选择
  const handleFileSelect = async (selectedFile: File) => {
    try {
      setError(null)
      setFile(selectedFile)
      
      // 解析 CSV
      const parsed = await parseCSVFile(selectedFile, { skipFirstRow: false })
      setCSVData(parsed)
      
      // 自动匹配字段
      const mapping = autoMatchFields(parsed.headers, fields)
      setFieldMapping(mapping)
      
      // 进入预览步骤
      setStep(ImportStep.Preview)
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件解析失败')
    }
  }

  // 处理导入
  const handleImport = async () => {
    if (!csvData) return

    try {
      setError(null)
      setStep(ImportStep.Importing)
      
      // 转换数据
      const records = convertCSVToRecords(csvData.rows, csvData.headers, fieldMapping)
      
      // 验证数据
      const validation = validateImportData(records, fields)
      if (!validation.valid) {
        setError(validation.errors.join('; '))
        setStep(ImportStep.Mapping)
        return
      }

      // 批量导入（分批处理）
      const batchSize = 100
      const totalBatches = Math.ceil(records.length / batchSize)
      
      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize
        const end = Math.min(start + batchSize, records.length)
        const batch = records.slice(start, end)
        
        // 导入这一批
        await onImport(batch)
        
        // 更新进度
        setImportedCount(end)
        setProgress(Math.round((end / records.length) * 100))
        
        // 短暂延迟，避免服务器压力
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // 完成
      setStep(ImportStep.Complete)
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败')
      setStep(ImportStep.Mapping)
    }
  }

  // 处理关闭
  const handleClose = () => {
    if (step === ImportStep.Importing) {
      return // 导入中不允许关闭
    }
    
    resetState()
    onClose()
  }

  // 渲染步骤内容
  const renderStepContent = () => {
    switch (step) {
      case ImportStep.Upload:
        return (
          <FileUploader
            onFileSelect={handleFileSelect}
            accept=".csv"
            maxSize={10 * 1024 * 1024}  // 10MB
          />
        )

      case ImportStep.Preview:
        return csvData && (
          <>
            <DataPreview
              headers={csvData.headers}
              preview={csvData.preview}
              totalRows={csvData.rows.length}
            />
            
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(ImportStep.Upload)
                  setFile(null)
                  setCSVData(null)
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                重新选择文件
              </Button>
              
              <Button onClick={() => setStep(ImportStep.Mapping)}>
                下一步：字段映射
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </>
        )

      case ImportStep.Mapping:
        return csvData && (
          <>
            <FieldMapper
              csvHeaders={csvData.headers}
              tableFields={fields}
              mapping={fieldMapping}
              onChange={setFieldMapping}
            />
            
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setStep(ImportStep.Preview)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                上一步
              </Button>
              
              <Button 
                onClick={handleImport}
                disabled={Object.keys(fieldMapping).length === 0}
              >
                开始导入 ({csvData.rows.length} 条记录)
              </Button>
            </div>
          </>
        )

      case ImportStep.Importing:
        return (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-primary animate-pulse" />
              <h3 className="mt-4 text-lg font-medium">正在导入...</h3>
              <p className="text-sm text-muted-foreground mt-2">
                已导入 {importedCount} / {csvData?.rows.length || 0} 条记录
              </p>
            </div>
            
            <Progress value={progress} className="w-full" />
          </div>
        )

      case ImportStep.Complete:
        return (
          <div className="space-y-4 py-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium">导入完成！</h3>
            <p className="text-sm text-muted-foreground">
              成功导入 {importedCount} 条记录
            </p>
            
            <Button onClick={handleClose} className="mt-4">
              关闭
            </Button>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            导入数据
          </DialogTitle>
        </DialogHeader>

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 步骤指示器 */}
        {step !== ImportStep.Complete && step !== ImportStep.Importing && (
          <div className="flex items-center justify-center gap-2 py-4">
            <div className={`flex items-center gap-2 ${step === ImportStep.Upload ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === ImportStep.Upload ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span className="text-sm">上传文件</span>
            </div>
            
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            
            <div className={`flex items-center gap-2 ${step === ImportStep.Preview ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === ImportStep.Preview ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="text-sm">预览数据</span>
            </div>
            
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            
            <div className={`flex items-center gap-2 ${step === ImportStep.Mapping ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === ImportStep.Mapping ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                3
              </div>
              <span className="text-sm">字段映射</span>
            </div>
          </div>
        )}

        {/* 步骤内容 */}
        <div className="flex-1 overflow-auto">
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

