import { Undo2, Redo2, Plus, SlidersHorizontal, Filter, ArrowUpDown, PanelsTopLeft, Menu, ArrowUpRight } from 'lucide-react'
import { CreateFieldDialog } from './CreateFieldDialog'
import FormulaEditorTest from './FormulaEditorTest'
/**
 * Full Featured Grid Demo - 完整功能演示
 * 
 * 展示功能:
 * - ✅ 添加/删除列
 * - ✅ 列拖拽排序
 * - ✅ 列宽调整 (Resize)
 * - ✅ 列冻结
 * - ✅ 添加/删除行
 * - ✅ 行拖拽排序
 * - ✅ 单元格编辑 (文本、选择、评分、布尔值等)
 * - ✅ 批量选择和修改
 * - ✅ 复制/粘贴/删除
 * - ✅ 撤销/重做
 * - ✅ 搜索和高亮
 * - ✅ 分组和折叠
 * - ✅ 统计行
 * - ✅ 协作光标
 * - ✅ 键盘导航
 */

import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import {
  Grid,
  type IGridRef,
  type IGridColumn,
  type ICell,
  type ICellItem,
  type IInnerCell,
  type CombinedSelection,
  type IColumnStatistics,
  type ICollaborator,
  type IGroupPoint,
  CellType,
  DraggableType,
  SelectableType,
  LinearRowType,
  RowControlType,
  Colors,
} from '@teable/grid-table-kanban'
import { buildCellFromField } from '@teable/grid-table-kanban'
import { buildFieldMetaById } from '../lib/field-type-mapping'

import teable, { ensureLogin } from '../lib/teable-simple'

// 数据类型定义
interface IRowData {
  id: string
  name: string
  email: string
  status: 'todo' | 'doing' | 'done'
  priority: 'low' | 'medium' | 'high'
  rating: number
  progress: number
  assignees: Array<{ id: string; name: string; avatar?: string }>
  tags: string[]
  done: boolean
  description: string
  createdAt: Date
  dueDate?: Date
}

// 列类型定义
type ColumnId = keyof IRowData | 'actions'

// 生成模拟数据
const generateMockData = (count: number): IRowData[] => {
  const statuses: IRowData['status'][] = ['todo', 'doing', 'done']
  const priorities: IRowData['priority'][] = ['low', 'medium', 'high']
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']
  const tags = ['Bug', 'Feature', 'Enhancement', 'Documentation', 'Testing']

  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i}`,
    name: `Task ${i + 1}`,
    email: `user${i + 1}@example.com`,
    status: statuses[i % statuses.length],
    priority: priorities[i % priorities.length],
    rating: (i % 5) + 1,
    progress: (i * 13) % 101,
    assignees: [
      { id: `u${i}-1`, name: names[i % names.length], avatar: undefined },
      { id: `u${i}-2`, name: names[(i + 1) % names.length], avatar: undefined },
    ],
    tags: [tags[i % tags.length], tags[(i + 2) % tags.length]],
    done: i % 3 === 0,
    description: `This is task ${i + 1} description. Lorem ipsum dolor sit amet.`,
    createdAt: new Date(Date.now() - i * 86400000),
    dueDate: i % 2 === 0 ? new Date(Date.now() + (10 - i) * 86400000) : undefined,
  }))
}

const getEffectiveTableId = (tableId: string) => String(tableId)

export default function FullFeaturedDemo(props: { tableId?: string }) {
  const gridRef = useRef<IGridRef | null>(null)

  // 数据状态
  const [data, setData] = useState<IRowData[]>(() => generateMockData(100))
  const [deletedRows, setDeletedRows] = useState<Set<number>>(new Set())

  // UI 配置状态
  const [columns, setColumns] = useState<IGridColumn[]>([
    { id: 'actions', name: '', width: 36, hasMenu: false },
    { id: 'name', name: 'Task Name', width: 200, isPrimary: true, hasMenu: true },
    { id: 'email', name: 'Email', width: 220, hasMenu: true },
    { id: 'status', name: 'Status', width: 120, hasMenu: true },
    { id: 'priority', name: 'Priority', width: 120, hasMenu: true },
    { id: 'rating', name: 'Rating', width: 140, hasMenu: true },
    { id: 'progress', name: 'Progress', width: 100, hasMenu: true },
    { id: 'assignees', name: 'Assignees', width: 200, hasMenu: true },
    { id: 'tags', name: 'Tags', width: 200, hasMenu: true },
    { id: 'done', name: 'Completed', width: 100, hasMenu: true },
  ])

  const [freezeColumnCount, setFreezeColumnCount] = useState(1)
  const [selectable, setSelectable] = useState<SelectableType>(SelectableType.All)
  const [draggable, setDraggable] = useState<DraggableType>(DraggableType.All)
  const [showStatistics, setShowStatistics] = useState(true)
  const [enableGrouping, setEnableGrouping] = useState(false)
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set())
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState<ICellItem[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0)
  // 顶部面板开关与条件
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [showSortPanel, setShowSortPanel] = useState(false)
  const [showGroupPanel, setShowGroupPanel] = useState(false)
  const [simpleFilter, setSimpleFilter] = useState<{ fieldId?: string; value?: string }>({})
  const [sortCond, setSortCond] = useState<{ fieldId?: string; order?: 'asc' | 'desc' }>({})
  const [groupByFieldId, setGroupByFieldId] = useState<string | undefined>(undefined)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [showCreateFieldDialog, setShowCreateFieldDialog] = useState(false)
  const [showFormulaEditorTest, setShowFormulaEditorTest] = useState(false)
  // 字段 id->name 映射（旧项目后端按字段名作为键）
  const [fieldIdToName, setFieldIdToName] = useState<Record<string, string>>({})
  const nameToFieldId = useMemo(() => Object.fromEntries(Object.entries(fieldIdToName).map(([id, name]) => [name, id])), [fieldIdToName])
  const [fieldMetaById, setFieldMetaById] = useState<Record<string, { type: FieldType; options?: unknown; readonly?: boolean }>>({})

  // 当传入 tableId 时，自动从后端加载字段与数据
  useEffect(() => {
    const load = async () => {
      if (!props.tableId) return
      try {
        await ensureLogin()
        // 加载字段
        const fieldsResp = await teable.listFields({ table_id: String(props.tableId), limit: 200 })
        const loadedColumns: IGridColumn[] = (fieldsResp?.data || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          width: 160,
          hasMenu: true,
        }))
        if (loadedColumns.length > 0) setColumns([{ id: 'actions', name: '', width: 36, hasMenu: false }, ...loadedColumns])
        const id2name: Record<string, string> = {}
        ;(fieldsResp?.data || []).forEach((f: any) => (id2name[f.id] = f.name))
        setFieldIdToName(id2name)

        // 记录字段元数据（类型/只读等），用于构建正确的单元格类型
        setFieldMetaById(buildFieldMetaById(fieldsResp?.data || []))

        // 加载记录
        const recResp = await teable.listRecords({ table_id: String(props.tableId), limit: 1000 })
        const rows = (recResp?.data || []).map((r: any) => {
          const row: any = { id: r.id }
          const data = r.data || {}
          // 将字段名数据映射到以字段id为列的行对象
          for (const fid in id2name) {
            const fname = id2name[fid]
            row[fid] = data[fname]
          }
          return row as IRowData
        })
        if (Array.isArray(rows) && rows.length > 0) {
          setData(rows)
          setDeletedRows(new Set())
        }
      } catch (e) {
        console.error('加载表字段或记录失败', e)
      }
    }
    load()
  }, [props.tableId])

  // 历史记录 (简单实现)
  const [history, setHistory] = useState<IRowData[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // 选择状态
  const [selection, setSelection] = useState<CombinedSelection | null>(null)

  // 模拟协作者
  const [collaborators] = useState<ICollaborator>([
    {
      activeCellId: ['row-5', 'email'],
      user: { id: 'u1', name: 'Alice Chen', email: 'alice@example.com' },
      borderColor: Colors.Blue,
      timeStamp: Date.now(),
    },
    {
      activeCellId: ['row-15', 'status'],
      user: { id: 'u2', name: 'Bob Smith', email: 'bob@example.com' },
      borderColor: Colors.Green,
      timeStamp: Date.now(),
    },
  ])

  // 获取可见的行数据 (过滤已删除的行)
  const visibleData = useMemo(() => {
    let rows = data.filter((_, index) => !deletedRows.has(index))
    // 简单筛选：字段包含值（大小写不敏感）
    if (simpleFilter.fieldId && (simpleFilter.value ?? '').toString().length > 0) {
      const fid = simpleFilter.fieldId
      const q = (simpleFilter.value ?? '').toString().toLowerCase()
      rows = rows.filter((r: any) => `${r[fid] ?? ''}`.toLowerCase().includes(q))
    }
    // 简单排序
    if (sortCond.fieldId && sortCond.order) {
      const fid = sortCond.fieldId
      const dir = sortCond.order === 'asc' ? 1 : -1
      rows = [...rows].sort((a: any, b: any) => {
        const av = a[fid]
        const bv = b[fid]
        if (av == null && bv == null) return 0
        if (av == null) return -1 * dir
        if (bv == null) return 1 * dir
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
        return String(av).localeCompare(String(bv)) * dir
      })
    }
    return rows
  }, [data, deletedRows, simpleFilter, sortCond])

  // 分组点数据
  const groupPoints = useMemo<IGroupPoint[] | null>(() => {
    const fid = groupByFieldId
    if (!fid) return null
    const points: IGroupPoint[] = []
    const map = visibleData.reduce((acc, row: any) => {
      const key = row[fid] == null ? '未分组' : String(row[fid])
      if (!acc[key]) acc[key] = 0
      acc[key] += 1
      return acc
    }, {} as Record<string, number>)
    Object.entries(map).forEach(([key, count]) => {
      const gid = `group-${key}`
      points.push({ id: gid, type: LinearRowType.Group, depth: 0, value: key, isCollapsed: collapsedGroupIds.has(gid) })
      points.push({ type: LinearRowType.Row, count })
    })
    return points
  }, [groupByFieldId, visibleData, collapsedGroupIds])

  // 统计数据
  const columnStatistics = useMemo<IColumnStatistics | undefined>(() => {
    if (!showStatistics) return undefined

    const stats: IColumnStatistics = {}
    
    columns.forEach((col) => {
      const columnId = col.id as ColumnId
      if (columnId === 'rating') {
        const avgRating = visibleData.reduce((sum, row) => sum + row.rating, 0) / visibleData.length
        stats[col.id!] = {
          total: `Avg: ${avgRating.toFixed(1)} ⭐`,
        }
      } else if (columnId === 'progress') {
        const avgProgress = visibleData.reduce((sum, row) => sum + row.progress, 0) / visibleData.length
        stats[col.id!] = {
          total: `${avgProgress.toFixed(0)}%`,
        }
      } else if (columnId === 'done') {
        const doneCount = visibleData.filter(row => row.done).length
        stats[col.id!] = {
          total: `${doneCount}/${visibleData.length}`,
        }
      }
    })

    return stats
  }, [showStatistics, columns, visibleData])

  // 获取单元格内容
  const getCellContent = useCallback((cell: ICellItem): ICell => {
    const [colIndex, rowIndex] = cell
    const column = columns[colIndex]
    const columnId = column?.id as ColumnId
    const row = visibleData[rowIndex]

    if (!row || !columnId) {
      return { type: CellType.Text, data: '', displayData: '' }
    }

    // 对齐原项目：若为后端字段列，则使用字段元数据 + 工厂生成正确的单元格类型
    let meta = fieldMetaById[columnId as string]
    // 兼容列 id 不是后端字段 id 的情况（例如误用字段名作为列 id）
    if (!meta) {
      const guessedId = nameToFieldId[column?.name as string]
      if (guessedId) meta = fieldMetaById[guessedId]
    }
    if (meta) {
      const raw = (row as any)[columnId]
      return buildCellFromField(meta, raw)
    }

    switch (columnId) {
      case 'actions':
        return { type: CellType.Text, data: '↗', displayData: '↗' }
      case 'name':
        return {
          type: CellType.Text,
          data: row.name,
          displayData: row.name,
        }

      case 'email':
        return {
          type: CellType.Link,
          data: [`mailto:${row.email}`],
          displayData: row.email,
        }

      case 'status':
        return {
          type: CellType.Select,
          data: [{ title: row.status.toUpperCase(), id: row.status }],
          displayData: [row.status.toUpperCase()],
          isMultiple: false,
        }

      case 'priority': {
        const colorMap = {
          low: Colors.Green,
          medium: Colors.Orange,
          high: Colors.Red,
        }
        return {
          type: CellType.Select,
          data: [{ title: row.priority.toUpperCase(), id: row.priority }],
          displayData: [row.priority.toUpperCase()],
          isMultiple: false,
        }
      }

      case 'rating':
        return {
          type: CellType.Rating,
          data: row.rating,
          icon: 'star',
          color: Colors.Amber,
          max: 5,
        }

      case 'progress':
        return {
          type: CellType.Number,
          data: row.progress,
          displayData: `${row.progress}%`,
        }

      case 'assignees':
        return {
          type: CellType.User,
          data: row.assignees,
        }

      case 'tags':
        return {
          type: CellType.Select,
          data: row.tags.map((tag, i) => ({
            title: tag,
            id: `${tag}-${i}`,
            color: Colors.Blue,
          })),
          displayData: row.tags,
          isMultiple: true,
        }

      case 'done':
        return {
          type: CellType.Boolean,
          data: row.done,
        }

      case 'description':
        return {
          type: CellType.Text,
          data: row.description,
          displayData: row.description,
        }

      default: {
        // 动态字段：直接回显文本值
        const anyRow = row as any
        const value = anyRow[columnId]
        return { type: CellType.Text, data: value ?? '', displayData: String(value ?? '') }
      }
    }
  }, [columns, visibleData])

  // 保存历史记录
  const saveHistory = useCallback(() => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push([...data])
      return newHistory.slice(-50) // 保留最近50次
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [data, historyIndex])

  // 单元格编辑
  const handleCellEdited = useCallback(async (cell: ICellItem, newValue: IInnerCell) => {
    const [colIndex, rowIndex] = cell
    const columnId = columns[colIndex]?.id as ColumnId
    
    saveHistory()
    
    setData(prevData => {
      const newData = [...prevData]
      const row = { ...newData[rowIndex] }
      
      switch (columnId) {
        case 'name':
          row.name = String(newValue)
          break
        case 'status':
          if (typeof newValue === 'string') {
            row.status = newValue as IRowData['status']
          }
          break
        case 'priority':
          if (typeof newValue === 'string') {
            row.priority = newValue as IRowData['priority']
          }
          break
        case 'rating':
          row.rating = Number(newValue) || 0
          break
        case 'done':
          row.done = Boolean(newValue)
          break
        case 'progress':
          row.progress = Math.max(0, Math.min(100, Number(newValue) || 0))
          break
        default: {
          // 动态字段：本地即时更新，提升交互一致性
          const value = (typeof newValue === 'object' && newValue !== null && 'data' in (newValue as any))
            ? (newValue as any).data
            : newValue
          ;(row as any)[columnId] = value
          break
        }
      }
      
      newData[rowIndex] = row
      return newData
    })

    try {
      await ensureLogin()
      // 如果该行尚未有后端 ID，则先创建
      let recordId = visibleData[rowIndex]?.id
      if (!recordId || String(recordId).startsWith('row-')) {
        // 构建字段数据：使用实际的字段名
        const baseFields: Record<string, any> = {}
        columns.forEach(col => {
          const colId = col.id as string
          if (colId === 'actions') return
          const fieldName = fieldIdToName[colId] || colId
          const value = (visibleData[rowIndex] as any)?.[colId]
          if (value !== undefined) {
            baseFields[fieldName] = value
          }
        })
        
        const created = await teable.createRecord({ table_id: getEffectiveTableId(props.tableId || 'demo'), fields: baseFields })
        recordId = created.data.id
        setData(prev => {
          const cp = [...prev]
          const r = { ...cp[rowIndex], id: recordId as string }
          cp[rowIndex] = r as any
          return cp
        })
      }

      // 根据列更新对应字段（后端按字段名作为键）
      const updateFields: Record<string, any> = {}
      const fieldName = fieldIdToName[columnId] || columnId
      switch (columnId) {
        case 'name':
          updateFields[fieldName] = String(newValue)
          break
        case 'status':
          if (typeof newValue === 'string') updateFields[fieldName] = newValue
          break
        case 'priority':
          if (typeof newValue === 'string') updateFields[fieldName] = newValue
          break
        case 'rating':
          updateFields[fieldName] = Number(newValue) || 0
          break
        case 'done':
          updateFields[fieldName] = Boolean(newValue)
          break
        case 'progress':
          updateFields[fieldName] = Math.max(0, Math.min(100, Number(newValue) || 0))
          break
      }

      const tableId = getEffectiveTableId(props.tableId || 'demo')
      if (Object.keys(updateFields).length > 0 && recordId) {
        await teable.updateRecord({ table_id: tableId, record_id: String(recordId), fields: updateFields })
      } else if (recordId && columnId && !(fieldName in updateFields)) {
        // 动态字段更新：尽量从对象结构中取 data，否则转为字符串
        const value = (typeof newValue === 'object' && newValue !== null && 'data' in (newValue as any))
          ? (newValue as any).data
          : newValue
        await teable.updateRecord({ table_id: tableId, record_id: String(recordId), fields: { [fieldName]: value as any } })
      }
    } catch (e) {
      console.error('保存编辑到后端失败', e)
      const errorMessage = e instanceof Error ? e.message : '未知错误'
      alert(`保存编辑到后端失败: ${errorMessage}`)
    }
  }, [columns, saveHistory, visibleData, props.tableId, fieldIdToName])

  // 添加新行
  const handleRowAppend = useCallback(async (targetIndex?: number) => {
    saveHistory()
    
    // 动态创建新行：根据当前表格的字段配置
    const newRow: any = {
      id: `row-${Date.now()}`,
    }
    
    // 为每个字段设置默认值
    columns.forEach(col => {
      const colId = col.id as string
      if (colId === 'actions') return
      // 简单的默认值策略
      newRow[colId] = ''
    })

    setData(prev => {
      const newData = [...prev]
      if (targetIndex !== undefined) {
        newData.splice(targetIndex + 1, 0, newRow)
      } else {
        newData.push(newRow)
      }
      return newData
    })

    try {
      await ensureLogin()
      
      // 构建字段数据：只发送用户可编辑的字段（排除计算字段）
      const fields: Record<string, any> = {}
      console.log('开始构建字段数据, newRow:', newRow)
      console.log('columns:', columns.map(c => c.id))
      console.log('fieldMetaById:', fieldMetaById)
      
      columns.forEach(col => {
        const colId = col.id as string
        console.log(`处理列: ${colId}`)
        
        if (colId === 'actions') {
          console.log('跳过操作列:', colId)
          return // 跳过操作列
        }
        
        const fieldMeta = fieldMetaById[colId]
        if (fieldMeta?.readonly) {
          console.log('跳过只读字段:', colId)
          return // 跳过只读字段（计算字段）
        }
        
        const fieldName = fieldIdToName[colId] || colId
        const value = (newRow as any)[colId]
        console.log(`字段 ${colId} -> ${fieldName}, 值:`, value)
        
        if (value !== undefined && value !== '') {
          fields[fieldName] = value
          console.log(`添加字段: ${fieldName} = ${value}`)
        } else {
          console.log(`跳过空字段: ${fieldName}`)
        }
      })
      
      console.log('最终发送的字段数据:', fields)
      
      const created = await teable.createRecord({
        table_id: getEffectiveTableId(props.tableId || 'demo'),
        fields,
      })
      const backendId = created.data.id
      setData(prev => {
        const cp = [...prev]
        const insertAt = targetIndex !== undefined ? targetIndex + 1 : cp.length - 1
        cp[insertAt] = { ...cp[insertAt], id: backendId }
        return cp
      })
    } catch (e) {
      console.error('创建记录失败', e)
      const errorMessage = e instanceof Error ? e.message : '未知错误'
      console.log('准备显示错误提示:', errorMessage)
      alert(`创建记录失败: ${errorMessage}`)
      console.log('错误提示已显示')
    }
  }, [data, saveHistory, props.tableId, columns, fieldIdToName])

  // 添加新列
  const handleColumnAppend = useCallback(() => {
    const newCol: IGridColumn = {
      id: `custom-${columns.length}`,
      name: `Custom ${columns.length + 1}`,
      width: 150,
      hasMenu: true,
    }
    setColumns(prev => [...prev, newCol])
  }, [columns])

  // 列调整大小
  const handleColumnResize = useCallback((column: IGridColumn, newSize: number, colIndex: number) => {
    setColumns(prev => prev.map((c, i) => i === colIndex ? { ...c, width: newSize } : c))
  }, [])

  // 列管理功能回调 - 显示创建字段对话框
  const handleAddColumn = useCallback(() => {
    // 清空编辑状态，确保是新建模式
    setFormValues({})
    // 直接显示创建字段对话框
    setShowCreateFieldDialog(true)
  }, [])

  const handleEditColumn = useCallback(async (columnIndex: number, updatedColumn: IGridColumn) => {
    // 1) 本地更新，提升响应
    setColumns((cols) => cols.map((col, index) => 
      index === columnIndex ? { ...col, ...updatedColumn } : col
    ))

    // 2) 同步到后端
    try {
      const fieldId = columns[columnIndex]?.id
      if (!fieldId) return
      const updates: any = {}
      if (updatedColumn.name != null) updates.name = updatedColumn.name
      if ((updatedColumn as any).type != null) updates.type = (updatedColumn as any).type
      if (updatedColumn.description != null) updates.description = updatedColumn.description
      await ensureLogin()
      await teable.updateField(fieldId, updates)
    } catch (e) {
      console.error('更新字段失败', e)
    }
  }, [columns])

  // 新增：从列菜单启动编辑 -> 打开统一弹窗
  const handleStartEditColumn = useCallback(async (columnIndex: number, column: IGridColumn) => {
    try {
      await ensureLogin()
      
      // 获取完整的字段信息
      const fieldDetails = await teable.getField(column.id)
      const fieldData = fieldDetails.data
      
      // 映射后端字段类型到前端类型
      const mapBackendTypeToFrontend = (backendType: string): string => {
        const typeMap: Record<string, string> = {
          'text': 'singleLineText',
          'longtext': 'longText',
          'number': 'number',
          'select': 'singleSelect',
          'multi_select': 'multipleSelect',
          'date': 'date',
          'checkbox': 'checkbox',
          'rating': 'rating',
          'link': 'link',
          'formula': 'formula',
          'lookup': 'lookup',
          'rollup': 'rollup',
          'virtual_ai': 'ai'
        }
        return typeMap[backendType] || 'singleLineText'
      }
      
      // 记录当前要编辑的列信息
      setShowCreateFieldDialog(true)
      setFormValues({ 
        __editingFieldId: column.id, 
        name: fieldData.name || column.name, 
        type: mapBackendTypeToFrontend(fieldData.type) || 'singleLineText', 
        description: fieldData.description || '',
        options: fieldData.options || null
      })
    } catch (e) {
      console.error('获取字段详情失败', e)
      alert('获取字段详情失败')
    }
  }, [])

  const handleDuplicateColumn = useCallback((columnIndex: number) => {
    const columnToDuplicate = columns[columnIndex]
    if (columnToDuplicate) {
      const duplicatedColumn = {
        ...columnToDuplicate,
        id: `col-${Date.now()}`,
        name: `${columnToDuplicate.name} (副本)`,
      }
      setColumns((cols) => {
        const newCols = [...cols]
        newCols.splice(columnIndex + 1, 0, duplicatedColumn)
        return newCols
      })
    }
  }, [columns])

  const handleDeleteColumn = useCallback(async (columnIndex: number) => {
    // 本地先删除，提升响应；保留快照以便失败回滚
    let removedId: string | undefined
    let removedCol: IGridColumn | undefined
    const prevColumns = columns
    setColumns((cols) => {
      removedCol = cols[columnIndex]
      removedId = removedCol?.id as string | undefined
      return cols.filter((_, index) => index !== columnIndex)
    })

    const prevMeta = fieldMetaById
    // 清理字段元数据映射（如果有）
    setFieldMetaById((prev) => {
      if (!removedId || !(removedId in prev)) return prev
      const cp = { ...prev }
      delete cp[removedId]
      return cp
    })

    // 同步后端删除；失败则回滚本地状态
      try {
        if (removedId && props.tableId) {
          await ensureLogin()
          await teable.deleteField(removedId, props.tableId)
      }
    } catch (e) {
      console.error('删除字段失败', e)
      // 回滚列
      setColumns((cols) => {
        // 若该列已存在就不重复插入
        if (removedCol && !cols.some(c => c.id === removedCol!.id)) {
          const cp = [...cols]
          // 简单回滚到原位置；若超出范围则追加
          const insertAt = Math.min(columnIndex, cp.length)
          cp.splice(insertAt, 0, removedCol as IGridColumn)
          return cp
        }
        return cols
      })
      // 回滚元数据
      if (removedId && !(removedId in prevMeta)) {
        setFieldMetaById(prevMeta)
      }
      alert(`删除字段失败: ${e instanceof Error ? e.message : '未知错误'}`)
    }
  }, [columns, fieldMetaById, props.tableId])

  // 列排序
  const handleColumnOrdered = useCallback((dragCols: number[], dropCol: number) => {
    setColumns(prev => {
      const newCols = [...prev]
      const draggedCols = dragCols.map(i => newCols[i])
      
      // 移除被拖拽的列
      for (let i = dragCols.length - 1; i >= 0; i--) {
        newCols.splice(dragCols[i], 1)
      }
      
      // 插入到新位置
      newCols.splice(dropCol, 0, ...draggedCols)
      return newCols
    })
  }, [])

  // 行排序
  const handleRowOrdered = useCallback((dragRows: number[], dropRow: number) => {
    saveHistory()
    setData(prev => {
      const newData = [...prev]
      const draggedRows = dragRows.map(i => newData[i])
      
      // 移除被拖拽的行
      for (let i = dragRows.length - 1; i >= 0; i--) {
        newData.splice(dragRows[i], 1)
      }
      
      // 插入到新位置
      newData.splice(dropRow, 0, ...draggedRows)
      return newData
    })
  }, [saveHistory])

  // 删除选中的行/列（行删除会同步数据库）
  const handleDelete = useCallback(async (selection: CombinedSelection) => {
    saveHistory()

    if (selection.type === 'rows') {
      const rowsToDelete = new Set(selection.ranges.flatMap(range => {
        const [start, end] = range as [number, number]
        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
      }))

      // 先收集要删除的记录信息
      const recordsToDelete: { recordId: string; index: number; record: any }[] = []
      for (const idx of rowsToDelete) {
        const rec = data[idx]
        const recordId = (rec as any)?.id
        if (recordId) {
          recordsToDelete.push({ 
            recordId: String(recordId), 
            index: idx, 
            record: rec 
          })
        }
      }

      console.log('准备删除记录，数量:', recordsToDelete.length)
      console.log('要删除的记录:', recordsToDelete)
      console.log('当前数据长度:', data.length)
      
      // 本地先删除，提升用户体验
      const originalData = [...data]
      setData(prev => prev.filter((_, idx) => !rowsToDelete.has(idx)))

      // 后端删除（参考 teable-develop 的乐观更新模式）
      try {
        await ensureLogin()
        const tableId = props.tableId || 'demo'
        
        // 批量删除记录
        for (const { recordId } of recordsToDelete) {
          console.log('删除记录ID:', recordId)
          await teable.deleteRecord({ table_id: tableId, record_id: recordId })
          console.log('记录删除成功:', recordId)
        }
        console.log('所有记录删除完成')
      } catch (e) {
        // 删除失败，回滚本地状态（参考 teable-develop 的错误回滚机制）
        console.error('删除记录失败，回滚本地状态', e)
        setData(originalData)
        
        const errorMessage = e instanceof Error ? e.message : '未知错误'
        alert(`删除记录失败: ${errorMessage}`)
      }
    } else if (selection.type === 'columns') {
      const colsToDelete = new Set(selection.ranges.flatMap(range => {
        const [start, end] = range as [number, number]
        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
      }))
      setColumns(prev => prev.filter((_, i) => !colsToDelete.has(i)))
    }
  }, [saveHistory, data, props.tableId])

  // 测试删除功能
  const testDeleteFunction = useCallback(async () => {
    console.log('测试删除功能开始')
    console.log('当前数据:', data)
    console.log('当前选择:', selection)
    console.log('选择类型:', selection.type)
    console.log('选择范围:', selection.ranges)
    
    if (selection.type === 'rows' && selection.ranges && selection.ranges.length > 0) {
      console.log('执行删除操作')
      await handleDelete(selection)
    } else {
      console.log('没有选中行，无法删除')
      console.log('选择类型检查:', selection.type === 'rows')
      console.log('范围检查:', selection.ranges && selection.ranges.length > 0)
    }
  }, [data, selection, handleDelete])

  // 直接删除第一行（用于测试）
  const deleteFirstRow = useCallback(async () => {
    console.log('直接删除第一行测试')
    if (data.length > 0) {
      const firstRow = data[0]
      console.log('第一行完整数据:', firstRow)
      console.log('第一行所有字段:', Object.keys(firstRow))
      
      // 尝试不同的ID字段名
      const recordId = (firstRow as any)?.id || 
                      (firstRow as any)?._id || 
                      (firstRow as any)?.recordId ||
                      (firstRow as any)?.record_id
      
      console.log('找到的记录ID:', recordId)
      
      if (recordId) {
        try {
          await ensureLogin()
          const tableId = props.tableId || 'demo'
          console.log('准备删除记录:', { table_id: tableId, record_id: recordId })
          
          // 先调用后端API删除
          await teable.deleteRecord({ table_id: tableId, record_id: recordId })
          console.log('后端删除成功，更新本地数据')
          
          // 后端删除成功后，更新本地数据
          setData(prev => prev.filter((_, idx) => idx !== 0))
          alert('记录删除成功！')
        } catch (e) {
          console.error('删除失败:', e)
          const errorMessage = e instanceof Error ? e.message : '未知错误'
          alert(`删除记录失败: ${errorMessage}`)
        }
      } else {
        console.log('第一行没有找到有效的ID字段，无法删除')
        console.log('尝试的ID字段: id, _id, recordId, record_id')
        alert('无法找到记录ID，请检查数据结构')
      }
    } else {
      console.log('没有数据可删除')
      alert('没有数据可删除')
    }
  }, [data, props.tableId])

  // 调试数据结构
  const debugDataStructure = useCallback(() => {
    console.log('=== 数据结构调试 ===')
    console.log('数据总数:', data.length)
    if (data.length > 0) {
      console.log('第一行数据结构:', data[0])
      console.log('第一行所有字段:', Object.keys(data[0]))
      console.log('ID字段值:', (data[0] as any)?.id)
      console.log('_id字段值:', (data[0] as any)?._id)
      console.log('recordId字段值:', (data[0] as any)?.recordId)
    }
    console.log('当前表格ID:', props.tableId)
    console.log('===================')
  }, [data, props.tableId])

  // 复制
  const handleCopy = useCallback((selection: CombinedSelection, e: React.ClipboardEvent) => {
    if (selection.type === 'cells') {
      const cellData = selection.ranges.map(range => {
        const [colIndex, rowIndex] = range as [number, number]
        const cell = getCellContent([colIndex, rowIndex])
        return cell.displayData || cell.data
      })
      e.clipboardData.setData('text/plain', JSON.stringify(cellData))
      e.preventDefault()
    }
  }, [getCellContent])

  // 粘贴
  const handlePaste = useCallback((selection: CombinedSelection, e: React.ClipboardEvent) => {
    saveHistory()
    const text = e.clipboardData.getData('text/plain')
    console.log('Paste:', text, 'into', selection)
    // 实现粘贴逻辑
  }, [saveHistory])

  // 撤销
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      setData(history[historyIndex - 1])
    }
  }, [history, historyIndex])

  // 重做
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      setData(history[historyIndex + 1])
    }
  }, [history, historyIndex])

  // 搜索
  const handleSearch = useCallback(() => {
    if (!searchText) {
      setSearchResults([])
      return
    }

    const results: ICellItem[] = []
    visibleData.forEach((row, rowIndex) => {
      columns.forEach((col, colIndex) => {
        const cell = getCellContent([colIndex, rowIndex])
        const cellText = String(cell.displayData || cell.data).toLowerCase()
        if (cellText.includes(searchText.toLowerCase())) {
          results.push([colIndex, rowIndex])
        }
      })
    })

    setSearchResults(results)
    setCurrentSearchIndex(0)
    
    if (results.length > 0) {
      gridRef.current?.scrollToItem(results[0])
    }
  }, [searchText, visibleData, columns, getCellContent])

  // 跳转到下一个搜索结果
  const handleNextSearch = useCallback(() => {
    if (searchResults.length === 0) return
    const nextIndex = (currentSearchIndex + 1) % searchResults.length
    setCurrentSearchIndex(nextIndex)
    gridRef.current?.scrollToItem(searchResults[nextIndex])
  }, [searchResults, currentSearchIndex])

  // 搜索高亮
  const searchHitIndex = useMemo(() => {
    return searchResults.map(([colIndex, rowIndex]) => ({
      fieldId: columns[colIndex]?.id || '',
      recordId: visibleData[rowIndex]?.id || '',
    }))
  }, [searchResults, columns, visibleData])

  const searchCursor = useMemo(() => {
    return searchResults[currentSearchIndex] || null
  }, [searchResults, currentSearchIndex])

  // 打开“新建记录”表单
  const openAddForm = useCallback(() => {
    setEditingRecordId(null)
    const init: Record<string, any> = {}
    columns.forEach(c => { (init as any)[c.id] = '' })
    setFormValues(init)
    setShowFormModal(true)
  }, [columns])

  // 打开"编辑记录"表单（按行索引）
  const openEditForm = useCallback((rowIndex: number) => {
    const row = visibleData[rowIndex] as any
    if (!row) return
    setEditingRecordId(String(row.id))
    const init: Record<string, any> = {}
    columns.forEach(c => { (init as any)[c.id] = row[c.id] ?? '' })
    setFormValues(init)
    setShowFormModal(true)
  }, [visibleData, columns])

  // 字段创建成功后的回调
  const handleFieldCreated = useCallback(async (fieldData: any) => {
    try {
      await ensureLogin()
      
      // 如果有 tableId，则调用后端 API 创建字段
      if (props.tableId) {
        const tableId = String(props.tableId)
        
        // 字段类型映射：前端类型 -> 后端类型
        const mapFieldTypeToBackend = (frontendType: string): string => {
          const typeMap: Record<string, string> = {
            'singleLineText': 'text',
            'longText': 'longtext', 
            'number': 'number',
            'singleSelect': 'select',
            'multipleSelect': 'multi_select',
            'date': 'date',
            'checkbox': 'checkbox',
            'rating': 'rating',
            'link': 'link',
            'formula': 'formula',
            'lookup': 'lookup',
            'rollup': 'rollup',
            'ai': 'virtual_ai'
          }
          return typeMap[frontendType] || 'text'
        }

        // 构建字段创建数据
        const createFieldData: any = {
          name: fieldData.name,
          type: mapFieldTypeToBackend(fieldData.type),
        }
        
        // 添加描述
        if (fieldData.description) {
          createFieldData.description = fieldData.description
        }
        
        // 添加选项配置
        if (fieldData.options) {
          // 后端期望options是JSON字符串，所以直接使用
          createFieldData.options = fieldData.options
        }
        
        // 添加特殊字段配置
        if (fieldData.ai_config) {
          // 如果ai_config是字符串，尝试解析为对象
          if (typeof fieldData.ai_config === 'string') {
            try {
              createFieldData.ai_config = JSON.parse(fieldData.ai_config)
            } catch (e) {
              console.warn('无法解析ai_config字符串:', fieldData.ai_config)
              createFieldData.ai_config = fieldData.ai_config
            }
          } else {
            createFieldData.ai_config = fieldData.ai_config
          }
        }
        if (fieldData.lookup_options) {
          // 如果lookup_options是字符串，尝试解析为对象
          if (typeof fieldData.lookup_options === 'string') {
            try {
              createFieldData.lookup_options = JSON.parse(fieldData.lookup_options)
            } catch (e) {
              console.warn('无法解析lookup_options字符串:', fieldData.lookup_options)
              createFieldData.lookup_options = fieldData.lookup_options
            }
          } else {
            createFieldData.lookup_options = fieldData.lookup_options
          }
        }
        if (fieldData.is_computed !== undefined) {
          createFieldData.is_computed = fieldData.is_computed
        }
        if (fieldData.is_lookup !== undefined) {
          createFieldData.is_lookup = fieldData.is_lookup
        }
        
        // 调用后端 API 创建字段
        const requestData = {
          table_id: tableId,
          ...createFieldData
        }
        console.log('创建字段请求数据:', requestData)
        await teable.createField(requestData)
        
        // 重新加载字段列表
        const fieldsResp = await teable.listFields({ table_id: tableId, limit: 200 })
        const loadedColumns: IGridColumn[] = (fieldsResp?.data || []).map((f: any) => ({
          id: f.id,
          name: f.name,
          width: 160,
          hasMenu: true,
        }))
        if (loadedColumns.length > 0) {
          setColumns([{ id: 'actions', name: '', width: 36, hasMenu: false }, ...loadedColumns])
        }
        
        // 更新字段ID到名称的映射
        const id2name: Record<string, string> = {}
        ;(fieldsResp?.data || []).forEach((f: any) => (id2name[f.id] = f.name))
        setFieldIdToName(id2name)

        // 更新字段元数据
        setFieldMetaById(buildFieldMetaById(fieldsResp?.data || []))
      } else {
        // 如果没有 tableId，则本地添加字段（演示模式）
        const newColumn: IGridColumn = {
          id: `field-${Date.now()}`,
          name: fieldData.name,
          width: 160,
          hasMenu: true,
        }
        setColumns(prev => [...prev, newColumn])
      }

      // 关闭对话框
      setShowCreateFieldDialog(false)
      
      console.log('字段创建成功:', fieldData)
    } catch (e) {
      console.error('创建字段失败', e)
      alert('创建字段失败: ' + (e instanceof Error ? e.message : '未知错误'))
    }
  }, [props.tableId])

  return (
    <div className="h-screen w-screen flex flex-col bg-white">
       
        {/* Topbar - 标准紧凑布局 */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-3 py-2 flex items-center justify-between">
            {/* 左侧操作区 */}
            <div className="flex items-center gap-2 text-xs">
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" onClick={handleUndo} title="撤销"><Undo2 className="w-4 h-4" /></button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" onClick={handleRedo} title="重做"><Redo2 className="w-4 h-4" /></button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" onClick={openAddForm} title="新建记录">
                <Plus className="w-4 h-4" />
              </button>
              <button 
                className="px-2 py-1 rounded border border-gray-200 bg-white" 
                title="字段配置"
                onClick={() => setShowFormulaEditorTest(true)}
              >
                <SlidersHorizontal className="w-4 h-4 inline-block mr-1" />字段配置
              </button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" title="筛选" onClick={() => { setShowFilterPanel(v => !v); setShowSortPanel(false); setShowGroupPanel(false); }}><Filter className="w-4 h-4 inline-block mr-1" />筛选</button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" title="排序" onClick={() => { setShowSortPanel(v => !v); setShowFilterPanel(false); setShowGroupPanel(false); }}><ArrowUpDown className="w-4 h-4 inline-block mr-1" />排序</button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" title="分组" onClick={() => { setShowGroupPanel(v => !v); setShowFilterPanel(false); setShowSortPanel(false); }}><PanelsTopLeft className="w-4 h-4 inline-block mr-1" />分组</button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white" title="更多"><Menu className="w-4 h-4" /></button>
              <button 
                className="px-2 py-1 rounded border border-red-200 bg-red-50 text-red-600 hover:bg-red-100" 
                title="测试删除"
                onClick={testDeleteFunction}
              >
                测试删除
              </button>
              <button 
                className="px-2 py-1 rounded border border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100" 
                title="删除第一行"
                onClick={deleteFirstRow}
              >
                删除第一行
              </button>
              <button 
                className="px-2 py-1 rounded border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100" 
                title="调试数据结构"
                onClick={debugDataStructure}
              >
                调试数据
              </button>
            </div>
            {/* 右侧工具区 */}
            <div className="flex items-center gap-2 text-xs">
              <div className="relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="搜索"
                  className="w-48 px-3 py-1 pr-8 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >🔍</button>
              </div>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white">分享</button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white">API</button>
              <button className="px-2 py-1 rounded border border-gray-200 bg-white">协同</button>
            </div>
          </div>
        </div>

        {/* 轻量面板：筛选/排序/分组（占位实现） */}
        {(showFilterPanel || showSortPanel || showGroupPanel) && (
          <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 text-xs">
            {showFilterPanel && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">筛选：</span>
                <select className="px-2 py-1 border rounded" value={simpleFilter.fieldId ?? ''} onChange={e => setSimpleFilter({ ...simpleFilter, fieldId: e.target.value })}>
                  <option value="">选择字段</option>
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <input className="px-2 py-1 border rounded" placeholder="包含..." value={simpleFilter.value ?? ''} onChange={e => setSimpleFilter({ ...simpleFilter, value: e.target.value })} />
                <button className="px-2 py-1 border rounded bg-white" onClick={() => setSimpleFilter({})}>清除</button>
              </div>
            )}
            {showSortPanel && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">排序：</span>
                <select className="px-2 py-1 border rounded" value={sortCond.fieldId ?? ''} onChange={e => setSortCond({ ...sortCond, fieldId: e.target.value as string })}>
                  <option value="">选择字段</option>
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select className="px-2 py-1 border rounded" value={sortCond.order ?? 'asc'} onChange={e => setSortCond({ ...sortCond, order: e.target.value as any })}>
                  <option value="asc">升序</option>
                  <option value="desc">降序</option>
                </select>
                <button className="px-2 py-1 border rounded bg-white" onClick={() => setSortCond({})}>清除</button>
              </div>
            )}
            {showGroupPanel && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">分组：</span>
                <select className="px-2 py-1 border rounded" value={groupByFieldId ?? ''} onChange={e => setGroupByFieldId(e.target.value || undefined)}>
                  <option value="">不分组</option>
                  {columns.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

      {/* Grid 表格区域（紧凑） */}
      <div className="flex-1 min-h-0 p-2">
        <div className="h-full bg-white overflow-hidden border border-gray-200">
          <Grid
            ref={gridRef}
            columns={columns}
            rowCount={visibleData.length}
            freezeColumnCount={freezeColumnCount}
            draggable={draggable}
            selectable={selectable}
            rowControls={[
              { type: RowControlType.Checkbox },
              { type: RowControlType.Drag },
              {
                type: RowControlType.Custom,
                width: 28,
                render: (rowIndex: number) => (
                  <button
                    type="button"
                    className="px-1.5 py-0.5 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center"
                    onMouseDown={(e) => {
                      // 防止被 Grid 捕获为拖拽/选择事件
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onClick={(e) => { e.stopPropagation(); openEditForm(rowIndex) }}
                    title="编辑"
                  ><ArrowUpRight className="w-3.5 h-3.5" /></button>
                ),
              },
            ]}
            groupPoints={groupPoints}
            collapsedGroupIds={collapsedGroupIds}
            columnStatistics={columnStatistics}
            collaborators={collaborators}
            searchCursor={searchCursor}
            searchHitIndex={searchHitIndex}
            getCellContent={getCellContent}
            onCellEdited={handleCellEdited}
            onRowAppend={handleRowAppend}
            onColumnAppend={handleColumnAppend}
            onRowOrdered={handleRowOrdered}
            onColumnOrdered={handleColumnOrdered}
            onColumnResize={handleColumnResize}
            onAddColumn={handleAddColumn}
            onEditColumn={handleEditColumn}
            onDuplicateColumn={handleDuplicateColumn}
            onDeleteColumn={handleDeleteColumn}
          onStartEditColumn={handleStartEditColumn}
            onCollapsedGroupChanged={setCollapsedGroupIds}
            onSelectionChanged={setSelection}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onDelete={handleDelete}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onColumnHeaderClick={(colIndex) => {
              console.log('Column header clicked:', columns[colIndex])
            }}
            onColumnHeaderDblClick={(colIndex) => {
              console.log('Column header double clicked:', columns[colIndex])
            }}
            onCellDblClick={(cell) => {
              const [, rowIndex] = cell
              openEditForm(rowIndex)
            }}
            style={{ width: '100%', height: '100%', fontSize: 12, lineHeight: 1.3 }}
          />
        </div>
      </div>

      {/* 底部状态栏 - 左下角记录统计 */}
      <div className="bg-white border-t border-gray-200 px-3 py-2">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <div className="flex gap-6">
            <span>记录: <strong>{visibleData.length}</strong></span>
            <span>选择: <strong>{selection?.type || '无'}</strong></span>
            {selection && (
              <span>范围: <strong>{selection.ranges.length}</strong> 个</span>
            )}
          </div>
          <div className="text-gray-400">按 Enter 保存 · Cmd/Ctrl+Z 撤销</div>
        </div>
      </div>
      {showFormModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-[800px] max-w-[90vw] bg-white rounded shadow-lg">
            <div className="p-4 border-b text-sm font-medium">{editingRecordId ? '编辑记录' : '新建记录'}</div>
            <div className="p-4 space-y-4">
              {columns.map(col => (
                <div key={col.id} className="flex items-center gap-3">
                  <div className="w-24 text-gray-600 text-sm truncate">{col.name}</div>
                  <input className="flex-1 px-3 py-2 border rounded" value={formValues[col.id] ?? ''} onChange={e => setFormValues({ ...formValues, [col.id]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="p-3 border-t flex justify-end gap-2">
              <button className="px-3 py-1.5 border rounded" onClick={() => setShowFormModal(false)}>取消</button>
              <button className="px-3 py-1.5 bg-gray-900 text-white rounded" onClick={async () => {
                try {
                  await ensureLogin()
                  const tableId = getEffectiveTableId(props.tableId || 'demo')
                  const fields: Record<string, any> = {}
                  Object.entries(formValues).forEach(([fid, v]) => {
                    const name = fieldIdToName[fid] || fid
                    fields[name] = v === '' ? null : v
                  })
                  if (editingRecordId) {
                    await teable.updateRecord({ table_id: tableId, record_id: editingRecordId, fields })
                  } else {
                    const res = await teable.createRecord({ table_id: tableId, fields })
                    setData(prev => [{ id: res.data.id, ...(prev[0] || {}), ...Object.fromEntries(Object.entries(formValues)) } as any, ...prev])
                  }
                  setShowFormModal(false)
                } catch (e) {
                  console.error('表单提交失败', e)
                }
              }}>{editingRecordId ? '保存' : '创建'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 字段创建对话框 */}
      <CreateFieldDialog
        open={showCreateFieldDialog}
        onOpenChange={setShowCreateFieldDialog}
        onCreateField={handleFieldCreated}
        availableFields={columns.filter(col => col.id !== 'actions').map(col => ({
          id: col.id,
          name: col.name,
          type: fieldMetaById[col.id]?.type || 'text'
        }))}
        // 根据是否携带 __editingFieldId 判断编辑模式
        mode={typeof (formValues as any)?.__editingFieldId === 'string' ? 'edit' : 'create'}
        initialValue={typeof (formValues as any)?.__editingFieldId === 'string' ? {
          id: String((formValues as any).__editingFieldId),
          name: String((formValues as any).name || ''),
          type: String((formValues as any).type || 'singleLineText'),
          description: String((formValues as any).description || ''),
          options: (formValues as any).options || null,
        } : undefined}
        onUpdateField={async (fieldId: string, updates: any) => {
          try {
            await ensureLogin()
            // 类型映射（与创建处一致）
            const mapFieldTypeToBackend = (frontendType: string): string => {
              const typeMap: Record<string, string> = {
                'singleLineText': 'text',
                'longText': 'longtext',
                'number': 'number',
                'singleSelect': 'select',
                'multipleSelect': 'multi_select',
                'date': 'date',
                'checkbox': 'checkbox',
                'rating': 'rating',
                'link': 'link',
                'formula': 'formula',
                'lookup': 'lookup',
                'rollup': 'rollup',
                'ai': 'virtual_ai',
              }
              return typeMap[updates.type] || updates.type
            }
            const payload: any = { ...updates }
            if (payload.type) payload.type = mapFieldTypeToBackend(payload.type)
            // 确保options对象被序列化为JSON字符串
            if (payload.options && typeof payload.options === 'object') {
              payload.options = JSON.stringify(payload.options)
            }
            await teable.updateField(fieldId, payload)
            // 刷新字段列表
            if (props.tableId) {
              const fieldsResp = await teable.listFields({ table_id: String(props.tableId), limit: 200 })
              const loadedColumns: IGridColumn[] = (fieldsResp?.data || []).map((f: any) => ({ id: f.id, name: f.name, width: 160, hasMenu: true }))
              if (loadedColumns.length > 0) setColumns([{ id: 'actions', name: '', width: 36, hasMenu: false }, ...loadedColumns])
              const id2name: Record<string, string> = {}
              ;(fieldsResp?.data || []).forEach((f: any) => (id2name[f.id] = f.name))
              setFieldIdToName(id2name)
              setFieldMetaById(buildFieldMetaById(fieldsResp?.data || []))
            }
            setFormValues({})
            setShowCreateFieldDialog(false)
          } catch (e) {
            console.error('更新字段失败', e)
            alert('更新字段失败')
          }
        }}
      />

      {/* 公式编辑器测试组件 */}
      {showFormulaEditorTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">字段配置</h2>
              <button 
                onClick={() => setShowFormulaEditorTest(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <FormulaEditorTest />
          </div>
        </div>
      )}
    </div>
  )
}