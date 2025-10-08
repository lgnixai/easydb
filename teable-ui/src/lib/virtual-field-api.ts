/**
 * 虚拟字段API集成
 * 用于触发虚拟字段计算和获取虚拟字段信息
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export interface VirtualFieldInfo {
  field_id: string
  field_name: string
  field_type: string
  is_computed: boolean
  is_pending: boolean
  has_error: boolean
  ai_config?: string
  lookup_options?: string
  formula?: string
  rollup_options?: string
  last_calculated_at?: string
  error_message?: string
}

export interface CalculateVirtualFieldRequest {
  field_id: string
  force?: boolean
}

export interface CalculateVirtualFieldResponse {
  success: boolean
  message?: string
  calculated_count?: number
}

/**
 * 触发虚拟字段计算
 */
export async function calculateVirtualField(
  fieldId: string,
  options: { force?: boolean; token?: string } = {}
): Promise<CalculateVirtualFieldResponse> {
  const { force = false, token } = options

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/fields/${fieldId}/calculate`,
      { force },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )

    return response.data
  } catch (error) {
    console.error('计算虚拟字段失败:', error)
    throw new Error(
      axios.isAxiosError(error)
        ? error.response?.data?.message || '计算虚拟字段失败'
        : '计算虚拟字段失败'
    )
  }
}

/**
 * 获取虚拟字段信息
 */
export async function getVirtualFieldInfo(
  fieldId: string,
  token?: string
): Promise<VirtualFieldInfo> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/fields/${fieldId}/virtual-info`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    return response.data.data
  } catch (error) {
    console.error('获取虚拟字段信息失败:', error)
    throw new Error(
      axios.isAxiosError(error)
        ? error.response?.data?.message || '获取虚拟字段信息失败'
        : '获取虚拟字段信息失败'
    )
  }
}

/**
 * 批量触发多个虚拟字段计算
 */
export async function calculateVirtualFieldsBatch(
  fieldIds: string[],
  options: { force?: boolean; token?: string } = {}
): Promise<{ success: boolean; results: Record<string, CalculateVirtualFieldResponse> }> {
  const results: Record<string, CalculateVirtualFieldResponse> = {}

  try {
    // 并行计算所有字段
    await Promise.all(
      fieldIds.map(async (fieldId) => {
        try {
          const result = await calculateVirtualField(fieldId, options)
          results[fieldId] = result
        } catch (error) {
          results[fieldId] = {
            success: false,
            message: (error as Error).message,
          }
        }
      })
    )

    return {
      success: Object.values(results).every((r) => r.success),
      results,
    }
  } catch (error) {
    console.error('批量计算虚拟字段失败:', error)
    throw error
  }
}

/**
 * 监听虚拟字段状态变化（通过轮询）
 */
export class VirtualFieldStatusMonitor {
  private fieldId: string
  private intervalId?: NodeJS.Timeout
  private onStatusChange?: (info: VirtualFieldInfo) => void
  private token?: string

  constructor(fieldId: string, onStatusChange?: (info: VirtualFieldInfo) => void, token?: string) {
    this.fieldId = fieldId
    this.onStatusChange = onStatusChange
    this.token = token
  }

  /**
   * 开始监听
   */
  start(intervalMs: number = 2000) {
    this.stop() // 先停止之前的监听

    this.intervalId = setInterval(async () => {
      try {
        const info = await getVirtualFieldInfo(this.fieldId, this.token)
        this.onStatusChange?.(info)

        // 如果不再处于pending状态，停止监听
        if (!info.is_pending) {
          this.stop()
        }
      } catch (error) {
        console.error('获取虚拟字段状态失败:', error)
      }
    }, intervalMs)
  }

  /**
   * 停止监听
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }
}

/**
 * Hook: 使用虚拟字段计算
 */
export function useVirtualFieldCalculation(fieldId: string, token?: string) {
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculate = async (force: boolean = false) => {
    setIsCalculating(true)
    setError(null)

    try {
      const result = await calculateVirtualField(fieldId, { force, token })
      return result
    } catch (err) {
      const errorMessage = (err as Error).message
      setError(errorMessage)
      throw err
    } finally {
      setIsCalculating(false)
    }
  }

  return { calculate, isCalculating, error }
}

// React import for hook
import { useState } from 'react'

