import { useRef, useState, useCallback } from 'react'
import {
  Grid,
  type IGridRef,
  type IGridColumn,
  type ICell,
  type ICellItem,
  type IInnerCell,
  CellType,
  gridTheme,
} from '../../packages/grid-table-kanban/src'
import '@glideapps/glide-data-grid/dist/index.css'

export default function SimpleDemo() {
  const gridRef = useRef<IGridRef | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const [columns, setColumns] = useState<IGridColumn[]>([
    { id: 'name', name: 'Name', width: 180, isPrimary: true },
    { id: 'email', name: 'Email', width: 240 },
    { id: 'website', name: 'Website', width: 200 },
    { id: 'status', name: 'Status', width: 140 },
    { id: 'rating', name: 'Rating', width: 160 },
    { id: 'assignees', name: 'Assignees', width: 200 },
    { id: 'birthdate', name: 'Birth Date', width: 150 },
    { id: 'attachments', name: 'Attachments', width: 180 },
    { id: 'chartData', name: 'Chart Data', width: 200 },
    { id: 'done', name: 'Done', width: 120 },
  ])

  const [rowCount, setRowCount] = useState<number>(25)
  // const [freeze, setFreeze] = useState<number>(1)
  // const [selectable, setSelectable] = useState<SelectableType>(SelectableType.All)
  // const [draggable, setDraggable] = useState<DraggableType>(DraggableType.All)
  // const [collapsed, setCollapsed] = useState<Set<string> | null>(null)
  
  // 添加单元格数据状态来支持编辑
  const [cellData, setCellData] = useState<{ [key: string]: any }>({})

  // const groupPoints = useMemo<IGroupPoint[] | null>(() => {
  //   // 构造一个简单分组示例：按每 20 行分一组
  //   const points: IGroupPoint[] = []
  //   for (let g = 0; g < 5; g++) {
  //     points.push({ id: `group-${g}`, type: LinearRowType.Group, depth: 0, value: `Group ${g}` })
  //     points.push({ type: LinearRowType.Row, count: 20 })
  //   }
  //   return points
  // }, [])

  const getCellContent = useCallback((cell: ICellItem): ICell => {
    const [col, row] = cell
    const columnId = columns[col]?.id
    const key = `${row}-${columnId}`
    
    // 如果单元格有编辑过的数据，使用编辑后的数据
    const editedData = cellData[key]
    
    switch (columnId) {
      case 'name': {
        const data = editedData ?? `User ${row}`
        return { type: CellType.Text, data, displayData: data }
      }
      case 'email': {
        const email = editedData ?? `user${row}@example.com`
        return {
          type: CellType.Link,
          data: [`mailto:${email}`],
          displayData: email,
        }
      }
      case 'website': {
        const websites = ['github.com', 'google.com', 'stackoverflow.com', 'example.com']
        const website = editedData ?? websites[row % websites.length]
        return {
          type: CellType.Link,
          data: [`https://${website}`],
          displayData: website,
        }
      }
      case 'status': {
        const choices = ['Todo', 'Doing', 'Done', 'Review', 'Blocked']
        const value = editedData ?? choices[row % choices.length]
        return {
          type: CellType.Select,
          data: [{ title: value, id: value }],
          displayData: [value],
          isMultiple: false,
        }
      }
      case 'rating': {
        const score = editedData ?? ((row % 5) + 1)
        return {
          type: CellType.Rating,
          data: score,
          icon: 'star',
          color: '#f59e0b',
          max: 5,
        }
      }
      case 'assignees':
        return {
          type: CellType.User,
          data: [
            { id: `u-${row}-1`, name: `Alice ${row}` },
            { id: `u-${row}-2`, name: `Bob ${row}` },
          ],
        }
      case 'birthdate': {
        const dates = ['1990-01-15', '1985-06-20', '1992-12-10', '1988-03-25', '1995-09-05']
        const date = editedData ?? dates[row % dates.length]
        return {
          type: CellType.Date,
          data: date,
          displayData: date,
        }
      }
      case 'attachments': {
        const files = ['document.pdf', 'image.jpg', 'spreadsheet.xlsx', 'presentation.pptx']
        const file = editedData ?? files[row % files.length]
        return {
          type: CellType.Attachment,
          data: file,
          displayData: file,
        }
      }
      case 'chartData': {
        const chartData = editedData ?? [10 + row * 2, 20 + row * 3, 15 + row, 25 + row * 2, 30 + row]
        return {
          type: CellType.Chart,
          data: chartData,
          displayData: chartData.map(d => d.toString()),
          chartType: 'bar',
        }
      }
      case 'done': {
        const value = editedData ?? (row % 3 === 0)
        return { type: CellType.Boolean, data: value }
      }
      default:
        return { type: CellType.Text, data: '', displayData: '' }
    }
  }, [columns, cellData])

  const handleCellEdited = useCallback((cell: ICellItem, newValue: IInnerCell) => {
    const [col, row] = cell
    const columnId = columns[col]?.id
    if (!columnId) return

    const key = `${row}-${columnId}`
    setCellData(prev => ({
      ...prev,
      [key]: newValue.data
    }))
    console.log('Cell edited:', { cell, newValue, key })
  }, [columns])

  const handleRowAppend = () => setRowCount((c) => c + 1)
  const handleColumnAppend = () =>
    setColumns((cols) => [
      ...cols,
      { id: `col-${cols.length + 1}`, name: `Col ${cols.length + 1}`, width: 160 },
    ])

  // 新的列管理功能
  const handleAddColumn = useCallback((fieldType: any, insertIndex?: number) => {
    const newColumn = {
      id: `col-${Date.now()}`,
      name: fieldType.name,
      width: 160,
      description: fieldType.description,
      icon: fieldType.icon,
    }
    
    if (insertIndex !== undefined) {
      setColumns((cols) => {
        const newCols = [...cols]
        newCols.splice(insertIndex, 0, newColumn)
        return newCols
      })
    } else {
      setColumns((cols) => [...cols, newColumn])
    }
  }, [])

  const handleEditColumn = useCallback((columnIndex: number, updatedColumn: IGridColumn) => {
    setColumns((cols) => cols.map((col, index) => 
      index === columnIndex ? { ...col, ...updatedColumn } : col
    ))
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

  const handleDeleteColumn = useCallback((columnIndex: number) => {
    setColumns((cols) => cols.filter((_, index) => index !== columnIndex))
  }, [])

  const handleColumnResize = (_column: IGridColumn, newSize: number, colIndex: number) => {
    setColumns((cols) => cols.map((c, i) => (i === colIndex ? { ...c, width: newSize } : c)))
  }

  // const handleRowOrdered = (_dragRows: number[], _dropRow: number) => {
  //   // 外部重排数据。此处仅打印验证
  //   // console.log('onRowOrdered', dragRows, dropRow)
  // }

  const handleColumnOrdered = (dragCols: number[], dropCol: number) => {
    setColumns((cols) => {
      const moved = [...cols]
      const items = dragCols.sort((a, b) => a - b).map((idx) => moved[idx])
      // 先移除，再在 drop 位置插入
      for (let i = dragCols.length - 1; i >= 0; i--) moved.splice(dragCols[i], 1)
      moved.splice(dropCol, 0, ...items)
      return moved
    })
  }

  // 参考 GridViewBaseInner.tsx 的 onPrefillingGridScrollChanged 实现
  const handleScrollChanged = useCallback((sl?: number, st?: number) => {
    console.log('Grid scrolled:', { scrollLeft: sl, scrollTop: st })
    // 这里可以添加其他滚动相关的逻辑，比如同步其他组件的滚动位置
  }, [])

  // 添加调试信息来验证滚动条计算
  const totalContentWidth = columns.reduce((prev, column) => prev + (column.width || 150), 100)
  const totalContentHeight = 40 + (rowCount * 40) + 100
  console.log('滚动条调试信息:', {
    容器宽度: 900,
    容器高度: 500,
    内容宽度: totalContentWidth,
    内容高度: totalContentHeight,
    需要水平滚动条: totalContentWidth > 900,
    需要垂直滚动条: totalContentHeight > 500,
    列信息: columns.map(col => ({ id: col.id, width: col.width }))
  })

  // 添加双击单元格回调
  const handleCellDblClick = useCallback((cell: ICellItem) => {
    const [col, row] = cell
    const columnId = columns[col]?.id
    console.log('🔥 SimpleDemo - Cell double clicked:', { cell, columnId, row })
    
    // 调试编辑器位置
    setTimeout(() => {
      const editor = document.querySelector('[id^="editor-container"]')
      const editorDiv = editor?.querySelectorAll('div[style*="position: absolute"]')
      const gridContainer = document.querySelector('[data-t-grid-container]')
      
      console.log('找到的编辑器div数量:', editorDiv?.length)
      editorDiv?.forEach((div, i) => {
        const rect = div.getBoundingClientRect()
        const style = window.getComputedStyle(div)
        console.log(`编辑器div${i}:`, {
          top: style.top,
          left: style.left,
          position: style.position,
          zIndex: style.zIndex,
          inlineStyle: (div as HTMLElement).style.cssText,
          rect: { x: rect.x, y: rect.y }
        })
      })
      
      const firstEditorDiv = editorDiv?.[1] // 第二个div才是真正的编辑器（第一个是容器）
      
      if (firstEditorDiv && gridContainer) {
        const editorRect = editorDiv.getBoundingClientRect()
        const gridRect = gridContainer.getBoundingClientRect()
        const editorStyle = window.getComputedStyle(editorDiv)
        const editorContainerStyle = window.getComputedStyle(editor!)
        
        const relativeX = editorRect.x - gridRect.x
        const relativeY = editorRect.y - gridRect.y
        const positionCorrect = Math.abs(relativeX - 48) < 10 && Math.abs(relativeY - 40) < 10
        
        // 检查InteractionLayer
        const interactionLayer = gridContainer?.querySelector('.absolute')
        const interactionStyle = interactionLayer ? window.getComputedStyle(interactionLayer as Element) : null
        const interactionRect = interactionLayer ? (interactionLayer as Element).getBoundingClientRect() : null
        
        const info = `
=== 编辑器位置调试 ===

Grid容器位置:
  x: ${gridRect.x}, y: ${gridRect.y}
  宽度: ${gridRect.width}, 高度: ${gridRect.height}

InteractionLayer:
  position: ${interactionStyle?.position}
  top: ${interactionStyle?.top}
  left: ${interactionStyle?.left}
  BoundingRect: x=${interactionRect?.x}, y=${interactionRect?.y}

编辑器容器 computed style:
  position: ${editorContainerStyle.position}
  top: ${editorContainerStyle.top}
  left: ${editorContainerStyle.left}

编辑器 BoundingRect:
  x: ${editorRect.x}, y: ${editorRect.y}
  宽度: ${editorRect.width}, 高度: ${editorRect.height}

编辑器 computed style:
  position: ${editorStyle.position} ${editorStyle.position !== 'absolute' ? '❌ 应该是absolute!' : '✅'}
  top: ${editorStyle.top}
  left: ${editorStyle.left}
  zIndex: ${editorStyle.zIndex} ${editorStyle.zIndex === 'auto' ? '❌ 应该是10!' : '✅'}

编辑器 inline style:
  ${(editorDiv as HTMLElement).style.cssText || '(none)'}

相对Grid的位置:
  x: ${relativeX} (期望≈206)
  y: ${relativeY} (期望≈280)
  
位置判断: ${positionCorrect ? '✅ 位置正确！' : '❌ 位置不正确！'}

说明: 从控制台看到计算的y=280是正确的，如果显示位置不对，说明CSS定位有问题
        `.trim()
        
        console.log(info)
        setDebugInfo(info)
      }
    }, 300)
  }, [columns])
  
  // 注释掉自动测试，避免干扰
  // useEffect(() => {
  //   if (!autoTestDone && typeof window !== 'undefined') {
  //     const timer = setTimeout(() => {
  //       const gridContainer = document.querySelector('[data-t-grid-container]')
  //       const interactionLayer = gridContainer?.querySelector('.absolute')
  //       const editorContainer = document.querySelector('[id^="editor-container"]')
  //       const canvas = document.querySelector('canvas')
  //       
  //       const info = `自动DOM结构检查:

  // Grid容器: ${gridContainer ? '✅ 存在' : '❌ 不存在'}
  // InteractionLayer: ${interactionLayer ? '✅ 存在' : '❌ 不存在'}  
  // EditorContainer: ${editorContainer ? '✅ 存在' : '❌ 不存在'}
  // Canvas: ${canvas ? '✅ 存在' : '❌ 不存在'}

  // 提示：双击任意单元格测试编辑器，或点击"测试编辑器位置"按钮`
  //       
  //       setDebugInfo(info)
  //       setAutoTestDone(true)
  //     }, 2000)
  //     
  //     return () => clearTimeout(timer)
  //   }
  // }, [autoTestDone])

  const toolbar = (
    <div className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50">
      {/* <button 
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        onClick={() => setFreeze((f) => (f + 1) % Math.max(1, columns.length))}
      >
        切换冻结列
      </button>
      <button 
        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        onClick={() => setSelectable((s: SelectableType) => (s === SelectableType.All ? SelectableType.Cell : SelectableType.All))}
      >
        切换选择模式
      </button>
      <button 
        className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        onClick={() => setDraggable((d: DraggableType) => (d === DraggableType.All ? DraggableType.None : DraggableType.All))}
      >
        切换拖拽
      </button> */}
      <button 
        className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        onClick={handleRowAppend}
      >
        追加行
      </button>
      <button 
        className="px-3 py-1 text-sm bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
        onClick={handleColumnAppend}
      >
        追加列
      </button>
      <button 
        className="px-3 py-1 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
        onClick={() => gridRef.current?.scrollToItem([columns.length - 1, rowCount - 1])}
      >
        滚动到末尾
      </button>
      <button 
        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        onClick={() => gridRef.current?.resetState()}
      >
        重置内部状态
      </button>
      <button 
        className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        onClick={() => gridRef.current?.scrollTo(0, 0)}
      >
        滚动到顶部
      </button>
      <button 
        className="px-3 py-1 text-sm bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
        onClick={() => {
          // 增加更多行来测试垂直滚动条
          setRowCount(20)
        }}
      >
        增加行数测试滚动条
      </button>
      <button 
        className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        onClick={() => {
          // 直接检查DOM元素
          const gridContainer = document.querySelector('[data-t-grid-container]')
          const interactionLayer = gridContainer?.querySelector('.absolute')
          const editorContainer = document.querySelector('[id^="editor-container"]')
          
          const info = `DOM结构检查:
Grid容器: ${gridContainer ? '✅ 存在' : '❌ 不存在'}
InteractionLayer: ${interactionLayer ? '✅ 存在' : '❌ 不存在'}
EditorContainer: ${editorContainer ? '✅ 存在' : '❌ 不存在'}
Canvas: ${document.querySelector('canvas') ? '✅ 存在' : '❌ 不存在'}`
          
          setDebugInfo(info)
        }}
      >
        检查DOM结构
      </button>
      <button 
        className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        onClick={() => {
          setDebugInfo('正在测试...')
          
          // 模拟双击第一行第一列
          const canvas = document.querySelector('canvas')
          if (!canvas) {
            setDebugInfo('❌ 未找到Canvas元素')
            return
          }
          
          const rect = canvas.getBoundingClientRect()
          const clickX = rect.x + 100
          const clickY = rect.y + 80
          
          console.log('准备双击Canvas:', { rect, clickX, clickY })
          
          // 先单击选中
          const click = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX: clickX,
            clientY: clickY
          })
          canvas.dispatchEvent(click)
          
          // 然后双击进入编辑
          setTimeout(() => {
            const dblClick = new MouseEvent('dblclick', {
              bubbles: true,
              cancelable: true,
              clientX: clickX,
              clientY: clickY
            })
            canvas.dispatchEvent(dblClick)
            console.log('双击事件已触发')
          }, 100)
        }}
      >
        测试编辑器位置
      </button>
      <button 
        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        onClick={() => {
          const editorTypes = [
            { name: '文本编辑器', col: 0, row: 0, description: 'Name 列 - 支持文本输入' },
            { name: '链接编辑器', col: 1, row: 0, description: 'Email 列 - 支持邮件链接' },
            { name: '网站链接编辑器', col: 2, row: 0, description: 'Website 列 - 支持网站链接' },
            { name: '选择编辑器', col: 3, row: 0, description: 'Status 列 - 支持下拉选择' },
            { name: '评分编辑器', col: 4, row: 0, description: 'Rating 列 - 支持星级评分' },
            { name: '用户编辑器', col: 5, row: 0, description: 'Assignees 列 - 支持用户选择' },
            { name: '日期编辑器', col: 6, row: 0, description: 'Birth Date 列 - 支持日期选择' },
            { name: '附件编辑器', col: 7, row: 0, description: 'Attachments 列 - 支持文件上传' },
            { name: '图表编辑器', col: 8, row: 0, description: 'Chart Data 列 - 支持数字数据' },
            { name: '布尔编辑器', col: 9, row: 0, description: 'Done 列 - 支持复选框' },
          ]
          
          let info = '=== 所有编辑器类型测试指南 ===\n\n'
          editorTypes.forEach((editor, index) => {
            info += `${index + 1}. ${editor.name}\n`
            info += `   位置: 第${editor.col + 1}列，第${editor.row + 1}行\n`
            info += `   描述: ${editor.description}\n`
            info += `   测试方法: 双击该单元格进入编辑模式\n\n`
          })
          
          info += '=== 测试步骤 ===\n'
          info += '1. 双击任意单元格进入编辑模式\n'
          info += '2. 观察编辑器是否正确显示在单元格内\n'
          info += '3. 尝试编辑内容并保存\n'
          info += '4. 检查编辑器背景是否正确覆盖原始内容\n\n'
          info += '提示：所有编辑器都应该有白色背景，无重叠显示问题！'
          
          setDebugInfo(info)
        }}
      >
        编辑器类型说明
      </button>
      <button 
        className="px-3 py-1 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
        onClick={() => {
          // 模拟显示字段类型选择器
          console.log('测试字段类型选择器')
          // TODO: 实现字段类型选择器的显示逻辑
        }}
      >
        测试添加列
      </button>
      <button 
        className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
        onClick={async () => {
          try {
            setDebugInfo('开始自动验证编辑器位置...')
            const grid = gridRef.current
            const container = grid?.getContainer?.()
            if (!grid || !container) {
              setDebugInfo('❌ 未获取到 Grid 或容器')
              return
            }

            // 选取一个稳定的文本单元格：列1("email")，行5
            const target: [number, number] = [1, 5]
            
            // 首先滚动到目标单元格
            grid.scrollToItem(target)
            await new Promise(r => setTimeout(r, 100))
            
            // 设置活动单元格
            grid.setActiveCell(target)
            await new Promise(r => setTimeout(r, 100))

            // 获取单元格边界（用于验证）
            const expectBounds = grid.getCellBounds(target)
            if (!expectBounds) {
              setDebugInfo('❌ 无法获取目标单元格边界')
              return
            }

            // 模拟双击进入编辑
            const canvas = container.querySelector('canvas')
            if (!canvas) {
              setDebugInfo('❌ 未找到Canvas元素')
              return
            }
            
            const canvasRect = canvas.getBoundingClientRect()
            const clickX = canvasRect.left + expectBounds.x + expectBounds.width / 2
            const clickY = canvasRect.top + expectBounds.y + expectBounds.height / 2
            
            // 触发双击事件
            const dblClickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              clientX: clickX,
              clientY: clickY,
              detail: 2
            })
            canvas.dispatchEvent(dblClickEvent)
            
            // 等待编辑器渲染
            await new Promise(r => setTimeout(r, 200))

            // 查找编辑器元素
            const editorContainer = container.querySelector('[id^="editor-container"]')
            const absDivs = editorContainer?.querySelectorAll('div[style*="position: absolute"]') as NodeListOf<HTMLElement> | undefined
            const editor = absDivs && absDivs.length > 1 ? absDivs[1] : null
            
            if (!editor) {
              setDebugInfo('❌ 未找到编辑器DOM（可能未进入编辑状态）')
              return
            }

            const style = window.getComputedStyle(editor)
            const actualTop = parseFloat(style.top || '0')
            const actualLeft = parseFloat(style.left || '0')
            const actualWidth = parseFloat(style.minWidth || String(editor.offsetWidth))
            const actualHeight = parseFloat(style.minHeight || String(editor.offsetHeight))

            const tol = 2 // 允许 2px 误差
            const passTop = Math.abs(actualTop - expectBounds.y) <= tol
            const passLeft = Math.abs(actualLeft - expectBounds.x) <= tol
            const passW = Math.abs(actualWidth - expectBounds.width) <= tol
            const passH = Math.abs(actualHeight - expectBounds.height) <= tol

            const pass = passTop && passLeft && passW && passH

            // 获取命中位置
            const hit = grid.getCellIndicesAtPosition?.(expectBounds.x + 5, expectBounds.y + 5) || null

            const report = `=== 自动验证结果 ===\n\n` +
              `测试单元格: 列${target[0]}, 行${target[1]}\n` +
              `命中检测: col=${hit ? hit[0] : 'NA'}, row=${hit ? hit[1] : 'NA'} ${hit && hit[0] === target[0] && hit[1] === target[1] ? '✅' : '❌'}\n\n` +
              `期望位置:\n` +
              `  top=${expectBounds.y.toFixed(1)}, left=${expectBounds.x.toFixed(1)}\n` +
              `  width=${expectBounds.width.toFixed(1)}, height=${expectBounds.height.toFixed(1)}\n\n` +
              `实际位置:\n` +
              `  top=${actualTop.toFixed(1)}, left=${actualLeft.toFixed(1)}\n` +
              `  width=${actualWidth.toFixed(1)}, height=${actualHeight.toFixed(1)}\n\n` +
              `误差(px):\n` +
              `  top: ${(actualTop - expectBounds.y).toFixed(1)} ${passTop ? '✅' : '❌'}\n` +
              `  left: ${(actualLeft - expectBounds.x).toFixed(1)} ${passLeft ? '✅' : '❌'}\n` +
              `  width: ${(actualWidth - expectBounds.width).toFixed(1)} ${passW ? '✅' : '❌'}\n` +
              `  height: ${(actualHeight - expectBounds.height).toFixed(1)} ${passH ? '✅' : '❌'}\n\n` +
              `最终结果: ${pass ? '✅ 全部通过' : '❌ 存在偏差'}`

            setDebugInfo(report)
          } catch (err) {
            setDebugInfo(`❌ 自动验证异常: ${(err as Error).message}\n${(err as Error).stack}`)
          }
        }}
      >
        自动验证编辑器位置
      </button>
    </div>
  )

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* 工具栏 */}
      {toolbar}
      
      {/* 调试信息显示 */}
      {debugInfo && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          border: '3px solid #000',
          zIndex: 99999,
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <button onClick={() => setDebugInfo(null)} style={{
            float: 'right',
            padding: '5px 10px',
            cursor: 'pointer'
          }}>关闭</button>
          <h3 style={{ marginTop: 0 }}>编辑器位置调试信息</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{debugInfo}</pre>
        </div>
      )}
      
      <div className="relative" style={{ height: '600px' }}>
        {/* 添加自定义滚动条样式 */}
        <style>{`
          .scrollbar-h-\\[10px\\]::-webkit-scrollbar {
            height: 10px;
            background-color: #f1f5f9;
          }
          .scrollbar-h-\\[10px\\]::-webkit-scrollbar-thumb {
            background-color: #64748b;
            border-radius: 5px;
          }
          .scrollbar-h-\\[10px\\]::-webkit-scrollbar-thumb:hover {
            background-color: #475569;
          }
          .scrollbar-w-\\[10px\\]::-webkit-scrollbar {
            width: 10px;
            background-color: #f1f5f9;
          }
          .scrollbar-w-\\[10px\\]::-webkit-scrollbar-thumb {
            background-color: #64748b;
            border-radius: 5px;
          }
          .scrollbar-w-\\[10px\\]::-webkit-scrollbar-thumb:hover {
            background-color: #475569;
          }
        `}</style>
        <Grid
          ref={gridRef}
          theme={gridTheme}
          columns={columns}
          rowCount={rowCount}
          rowHeight={40}
          columnHeaderHeight={40}
          scrollBarVisible={true}
         // freezeColumnCount={freeze}
          
          getCellContent={getCellContent}
          onCellEdited={handleCellEdited}
          onCellDblClick={handleCellDblClick}
          onRowAppend={handleRowAppend}
         // onColumnAppend={handleColumnAppend}
         // onRowOrdered={handleRowOrdered}
           onColumnOrdered={handleColumnOrdered}
           onColumnResize={handleColumnResize}
           onScrollChanged={handleScrollChanged}
           onAddColumn={handleAddColumn}
           onEditColumn={handleEditColumn}
           onDuplicateColumn={handleDuplicateColumn}
           onDeleteColumn={handleDeleteColumn}
           
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  )
}