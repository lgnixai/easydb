import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

/**
 * 虚拟字段实时同步 Hook
 * 
 * 功能：
 * 1. 监听记录更新
 * 2. 自动刷新虚拟字段
 * 3. 显示计算状态
 * 4. 错误处理
 */

export interface VirtualFieldStatus {
  status: 'idle' | 'calculating' | 'cached' | 'error'
  lastUpdated?: string
  error?: string
}

export interface UseVirtualFieldSyncOptions {
  recordId: string
  tableId: string
  virtualFieldIds?: string[]
  autoRefresh?: boolean
  token?: string
}

export const useVirtualFieldSync = (options: UseVirtualFieldSyncOptions) => {
  const { recordId, tableId, virtualFieldIds = [], autoRefresh = true, token } = options

  const [status, setStatus] = useState<Record<string, VirtualFieldStatus>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)

  /**
   * 刷新单个虚拟字段
   */
  const refreshField = useCallback(async (fieldId: string) => {
    setStatus(prev => ({
      ...prev,
      [fieldId]: { status: 'calculating' }
    }))

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/records/${recordId}/fields/${fieldId}/refresh`,
        {},
        {
          params: { table_id: tableId },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )

      setStatus(prev => ({
        ...prev,
        [fieldId]: {
          status: 'cached',
          lastUpdated: new Date().toISOString(),
        }
      }))

      return response.data
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        [fieldId]: {
          status: 'error',
          error: error.message || '刷新失败',
        }
      }))
      throw error
    }
  }, [recordId, tableId, token])

  /**
   * 批量刷新所有虚拟字段
   */
  const refreshAllFields = useCallback(async () => {
    setIsRefreshing(true)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/records/batch-refresh-virtual-fields`,
        {
          record_ids: [recordId],
        },
        {
          params: { table_id: tableId },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )

      // 更新所有字段状态
      const newStatus: Record<string, VirtualFieldStatus> = {}
      virtualFieldIds.forEach(fieldId => {
        newStatus[fieldId] = {
          status: 'cached',
          lastUpdated: new Date().toISOString(),
        }
      })
      setStatus(newStatus)

      return response.data
    } catch (error: any) {
      console.error('批量刷新虚拟字段失败:', error)
      throw error
    } finally {
      setIsRefreshing(false)
    }
  }, [recordId, tableId, virtualFieldIds, token])

  /**
   * 获取虚拟字段状态
   */
  const getFieldStatus = useCallback(async (fieldId: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/records/${recordId}/fields/${fieldId}/status`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )

      setStatus(prev => ({
        ...prev,
        [fieldId]: {
          status: response.data.status,
          lastUpdated: response.data.cached_at,
        }
      }))

      return response.data
    } catch (error: any) {
      console.error('获取虚拟字段状态失败:', error)
      throw error
    }
  }, [recordId, token])

  /**
   * 自动刷新（当记录ID或表格ID变化时）
   */
  useEffect(() => {
    if (autoRefresh && virtualFieldIds.length > 0) {
      refreshAllFields()
    }
  }, [recordId, tableId]) // 仅在ID变化时刷新

  return {
    status,
    isRefreshing,
    refreshField,
    refreshAllFields,
    getFieldStatus,
  }
}

/**
 * 虚拟字段实时更新 Hook
 * 
 * 使用场景：
 * 1. 更新记录后自动刷新虚拟字段
 * 2. 监听依赖字段变化
 * 3. 实时显示计算结果
 */

export interface UseVirtualFieldUpdateOptions {
  tableId: string
  token?: string
  onVirtualFieldUpdated?: (fieldId: string, value: any) => void
}

export const useVirtualFieldUpdate = (options: UseVirtualFieldUpdateOptions) => {
  const { tableId, token, onVirtualFieldUpdated } = options

  /**
   * 更新记录并触发虚拟字段
   */
  const updateRecord = useCallback(async (
    recordId: string,
    updates: Record<string, any>
  ) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/records/${recordId}/with-virtual-fields`,
        updates,
        {
          params: { table_id: tableId },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )

      // 检查是否有虚拟字段更新
      if (response.data.meta?.virtual_fields_updated) {
        const virtualFieldValues = extractVirtualFieldValues(response.data.data)
        
        // 通知虚拟字段更新
        Object.entries(virtualFieldValues).forEach(([fieldId, value]) => {
          onVirtualFieldUpdated?.(fieldId, value)
        })
      }

      return response.data
    } catch (error: any) {
      console.error('更新记录失败:', error)
      throw error
    }
  }, [tableId, token, onVirtualFieldUpdated])

  return {
    updateRecord,
  }
}

/**
 * 提取虚拟字段值
 */
function extractVirtualFieldValues(record: any): Record<string, any> {
  const virtualFields: Record<string, any> = {}
  
  // 假设虚拟字段以特定前缀或类型标识
  // 这里需要根据实际数据结构调整
  Object.entries(record).forEach(([key, value]) => {
    if (key.startsWith('virtual_') || isVirtualFieldType(key)) {
      virtualFields[key] = value
    }
  })
  
  return virtualFields
}

function isVirtualFieldType(fieldName: string): boolean {
  // 检查是否是虚拟字段类型
  // 这里需要根据实际业务逻辑实现
  return false
}

/**
 * 虚拟字段计算指示器组件 Hook
 */
export const useVirtualFieldIndicator = (fieldId: string, recordId: string) => {
  const [isCalculating, setIsCalculating] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  const setCalculating = useCallback(() => {
    setIsCalculating(true)
    setHasError(false)
    setErrorMessage(undefined)
  }, [])

  const setSuccess = useCallback(() => {
    setIsCalculating(false)
    setHasError(false)
    setErrorMessage(undefined)
  }, [])

  const setError = useCallback((message: string) => {
    setIsCalculating(false)
    setHasError(true)
    setErrorMessage(message)
  }, [])

  return {
    isCalculating,
    hasError,
    errorMessage,
    setCalculating,
    setSuccess,
    setError,
  }
}

