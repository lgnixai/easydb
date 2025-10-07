# Grid Table Kanban

> High-performance Grid-based Table and Kanban system extracted from Teable SDK

🚀 **[Getting Started](./GETTING_STARTED.md)** | 📖 **[Documentation Index](./INDEX.md)** | ⚡ **[Quick Start](./QUICKSTART.md)** | 📊 **[Summary](./SUMMARY.md)**

## Overview

`@teable/grid-table-kanban` is a standalone package that provides:

1. **High-Performance Grid System**: Canvas-based virtual grid with complex interactions and large data optimization
2. **Kanban Task Management**: Complete workflow-based task tracking system with strict quality gates
3. **Reusable Components**: Fully typed TypeScript components for building table and kanban interfaces

## Features

### Grid System

- ✅ **Canvas Rendering**: High-performance canvas-based rendering with layer composition
- ✅ **Virtual Scrolling**: Efficiently handle millions of rows with smooth scrolling
- ✅ **Cell Renderers**: Extensible cell renderer system (text, number, boolean, select, rating, etc.)
- ✅ **Cell Editors**: In-place editing with custom editor components
- ✅ **Drag & Drop**: Row and column reordering
- ✅ **Column Resizing**: Interactive column width adjustment
- ✅ **Column Freezing**: Freeze columns for better data navigation
- ✅ **Selection**: Multiple selection modes (cell, row, column)
- ✅ **Keyboard Navigation**: Full keyboard support for navigation and editing
- ✅ **Touch Support**: Mobile-friendly touch interactions
- ✅ **Grouping**: Hierarchical data grouping with collapse/expand
- ✅ **Theming**: Customizable theme support

### Kanban System

- ✅ **7-Column Workflow**: Backlog → To Do → In Progress → In Review → Testing → Blocked → Done
- ✅ **Task Management**: Complete task lifecycle with metadata
- ✅ **Sub-tasks**: Break down tasks into manageable pieces
- ✅ **Acceptance Criteria**: Define and validate acceptance criteria
- ✅ **Test Cases**: Track test case execution and results
- ✅ **Bug Tracking**: P0/P1/P2 bug priority system
- ✅ **Code Review**: PR review workflow with approvals
- ✅ **Development Log**: Track development progress and issues
- ✅ **Dependencies**: Task dependency tracking
- ✅ **State Validation**: Strict workflow rules and quality gates
- ✅ **Markdown Export**: Export tasks to markdown format

## Installation

```bash
npm install @teable/grid-table-kanban
# or
pnpm add @teable/grid-table-kanban
# or
yarn add @teable/grid-table-kanban
```

## Usage

### Grid System

```typescript
import { Grid } from '@teable/grid-table-kanban';
import type { IGridProps, ICell, ICellItem } from '@teable/grid-table-kanban';

function MyTableView() {
  const columns = [
    { id: 'col1', name: 'Name', width: 200 },
    { id: 'col2', name: 'Email', width: 250 },
    { id: 'col3', name: 'Status', width: 150 },
  ];

  const getCellContent = (cell: ICellItem): ICell => {
    const [colIndex, rowIndex] = cell;
    // Return cell data based on column and row
    return {
      type: 'text',
      data: `Cell ${colIndex},${rowIndex}`,
    };
  };

  return (
    <Grid
      columns={columns}
      rowCount={1000}
      getCellContent={getCellContent}
      onCellEdited={(cell, newValue) => {
        console.log('Cell edited:', cell, newValue);
      }}
    />
  );
}
```

### Kanban System

```typescript
import { useKanbanStore } from '@teable/grid-table-kanban';
import { TaskCard } from '@teable/grid-table-kanban/kanban/components';

function MyKanbanBoard() {
  const { board, addTask, moveTask } = useKanbanStore();

  // Initialize board
  useEffect(() => {
    useKanbanStore.getState().initializeBoard({
      name: 'My Project',
    });
  }, []);

  // Add a new task
  const handleAddTask = () => {
    addTask({
      title: 'New Feature',
      description: 'Implement new feature',
      goal: 'Deliver working feature',
      developer: 'John Doe',
      complexity: 'M',
      acceptanceCriteria: [
        {
          id: 'ac-1',
          description: 'Feature works as expected',
          validated: false,
        },
      ],
    });
  };

  // Move task to different column
  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    const result = moveTask(taskId, newStatus);
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <div className="kanban-board">
      {board?.columns.map(column => (
        <div key={column.id} className="kanban-column">
          <h2>{column.name}</h2>
          {board.tasks
            .filter(task => task.status === column.id)
            .map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleSelectTask(task.id)}
              />
            ))}
        </div>
      ))}
    </div>
  );
}
```

## Kanban Workflow

### 7 Workflow Columns

1. **Backlog (需求池)**: Tasks identified but not scheduled
2. **To Do (Sprint待办)**: Tasks scheduled for current sprint
3. **In Progress (开发中)**: Tasks currently being developed
4. **In Review (代码审查)**: PR submitted for code review
5. **Testing / QA (QA测试中)**: QA executing test cases
6. **Blocked (阻塞)**: Tasks blocked by dependencies or issues
7. **Done (验收通过)**: Tasks that passed product acceptance

### Task Card Requirements

Each task must include:

- **Goal**: Clear objective of the task
- **Sub-tasks**: Breakdown into manageable pieces
- **Developer**: Assigned developer
- **Complexity**: S/M/L size estimate
- **Acceptance Criteria**: Validation criteria
- **Test Cases**: Test scenarios and results
- **Related Files**: Links to code/design files
- **Dependencies**: Task dependencies

### Workflow Rules

#### In Progress → In Review

- Must have acceptance criteria defined
- Must create PR with proper description:
  - Modification points
  - Run instructions
  - Impact areas
  - Regression risks

#### In Review → Testing

- Requires at least 1 approved review
- PR description must be complete

#### Testing → Done

- All test cases must pass
- All P0 bugs must be fixed
- P1 bugs need evaluation
- All acceptance criteria validated

### Bug Priority System

- **P0**: Critical - Must be fixed before release
- **P1**: High - Needs evaluation before release
- **P2**: Medium - Can be deferred to next sprint

## API Reference

### Grid Props

```typescript
interface IGridProps {
  columns: IGridColumn[];
  rowCount: number;
  getCellContent: (cell: ICellItem) => ICell;
  
  // Optional
  theme?: Partial<IGridTheme>;
  rowHeight?: number;
  freezeColumnCount?: number;
  draggable?: DraggableType;
  selectable?: SelectableType;
  
  // Events
  onCellEdited?: (cell: ICellItem, newValue: IInnerCell) => void;
  onCellDblClick?: (cell: ICellItem) => void;
  onSelectionChanged?: (selection: CombinedSelection) => void;
  onRowOrdered?: (dragRowIndexCollection: number[], dropRowIndex: number) => void;
  onColumnOrdered?: (dragColIndexCollection: number[], dropColIndex: number) => void;
  onColumnResize?: (column: IGridColumn, newSize: number, colIndex: number) => void;
}
```

### Kanban Store API

```typescript
interface IKanbanStore {
  // State
  board: IKanbanBoard | null;
  selectedTask: IKanbanTask | null;
  
  // Board Operations
  initializeBoard: (boardData?: Partial<IKanbanBoard>) => void;
  updateBoard: (updates: Partial<IKanbanBoard>) => void;
  
  // Task Operations
  addTask: (task: Partial<IKanbanTask>) => void;
  updateTask: (taskId: string, updates: Partial<IKanbanTask>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, toStatus: TaskStatus) => { success: boolean; error?: string };
  selectTask: (taskId: string | null) => void;
  
  // Sub-task Operations
  addSubTask: (taskId: string, subTask: Omit<ISubTask, 'id'>) => void;
  updateSubTask: (taskId: string, subTaskId: string, updates: Partial<ISubTask>) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  
  // And many more...
}
```

## Architecture

### Grid System

```
src/grid/
├── Grid.tsx                 # Main Grid component
├── interface.ts             # Type definitions
├── configs/                 # Configuration
│   ├── grid.ts
│   └── gridTheme.ts
├── managers/                # Core managers
│   ├── coordinate-manager/  # Coordinate calculations
│   ├── sprite-manager/      # Icon/sprite management
│   ├── image-manager/       # Image caching
│   └── selection-manager/   # Selection handling
├── renderers/               # Rendering system
│   ├── base-renderer/
│   ├── cell-renderer/       # Cell type renderers
│   └── layout-renderer/     # Layout rendering
├── components/              # UI components
│   └── editor/              # Cell editors
├── hooks/                   # React hooks
└── utils/                   # Utilities
```

### Kanban System

```
src/kanban/
├── types.ts                 # Type definitions
├── constants.ts             # Constants and config
├── utils.ts                 # Utility functions
├── store.ts                 # Zustand store
└── components/              # React components
    └── TaskCard.tsx
```

## Development

### Build

```bash
pnpm install
pnpm build
```

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
```

## Project Structure

This package follows a monorepo structure and can be used in two ways:

1. **As a Library**: Import and use components in your project
2. **As a Reference**: Study the implementation for building your own system

## Dependencies

- React 18+
- TypeScript 5.4+
- Lodash
- Zustand (state management)
- LRU Cache

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Credits

Extracted and adapted from [Teable](https://github.com/teableio/teable) - An open-source Airtable alternative.

## Support

For issues and questions, please open an issue on GitHub.