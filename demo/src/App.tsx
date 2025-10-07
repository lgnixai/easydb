import { useState } from 'react'
import './App.css'
import SimpleDemo from './SimpleDemo'
import FullFeaturedDemo from './FullFeaturedDemo'
import ColumnManagementDemo from './ColumnManagementDemo'

function App() {
  const [demoMode, setDemoMode] = useState<'simple' | 'full' | 'column'>('full')

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Demo 切换器 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-xl font-bold">Grid Table Kanban - Demo Gallery</h1>
          <p className="text-sm text-blue-100">高性能表格组件演示</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDemoMode('simple')}
            className={`px-4 py-2 rounded-lg transition-all ${
              demoMode === 'simple'
                ? 'bg-white text-blue-600 font-semibold shadow-lg'
                : 'bg-blue-500 hover:bg-blue-400 text-white'
            }`}
          >
            📝 简单示例
          </button>
          <button
            onClick={() => setDemoMode('full')}
            className={`px-4 py-2 rounded-lg transition-all ${
              demoMode === 'full'
                ? 'bg-white text-purple-600 font-semibold shadow-lg'
                : 'bg-purple-500 hover:bg-purple-400 text-white'
            }`}
          >
            🎯 完整功能
          </button>
          <button
            onClick={() => setDemoMode('column')}
            className={`px-4 py-2 rounded-lg transition-all ${
              demoMode === 'column'
                ? 'bg-white text-green-600 font-semibold shadow-lg'
                : 'bg-green-500 hover:bg-green-400 text-white'
            }`}
          >
            🔧 列管理
          </button>
        </div>
      </div>

      {/* Demo 内容 */}
      <div className="flex-1 min-h-0">
        {demoMode === 'simple' && <SimpleDemo />}
        {demoMode === 'full' && <FullFeaturedDemo />}
        {demoMode === 'column' && <ColumnManagementDemo />}
      </div>
    </div>
  )
}

export default App
