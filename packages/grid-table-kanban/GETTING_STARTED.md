# Getting Started with Grid Table Kanban

Welcome! This guide will help you get up and running with `@teable/grid-table-kanban` in just a few minutes.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Your First Grid](#your-first-grid)
4. [Your First Kanban Board](#your-first-kanban-board)
5. [What's Next](#whats-next)

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 20+ installed
- **React** 18+ in your project
- **Package manager**: npm, pnpm, or yarn

## Installation

Install the package in your React project:

```bash
# Using npm
npm install @teable/grid-table-kanban

# Using pnpm (recommended)
pnpm add @teable/grid-table-kanban

# Using yarn
yarn add @teable/grid-table-kanban
```

## Your First Grid

Let's create a simple data table in 3 steps:

### Step 1: Import the Grid

```tsx
import { Grid } from '@teable/grid-table-kanban';
import type { IGridColumn, ICellItem, ICell } from '@teable/grid-table-kanban';
```

### Step 2: Define Your Data

```tsx
function MyFirstGrid() {
  // Define columns
  const columns: IGridColumn[] = [
    { id: '1', name: 'Name', width: 200 },
    { id: '2', name: 'Email', width: 250 },
    { id: '3', name: 'Status', width: 150 },
  ];

  // Your data (can be from API, database, etc.)
  const data = [
    ['Alice Johnson', 'alice@example.com', 'Active'],
    ['Bob Smith', 'bob@example.com', 'Inactive'],
    ['Carol White', 'carol@example.com', 'Active'],
  ];

  // Cell content provider - tells Grid what to display
  const getCellContent = ([colIndex, rowIndex]: ICellItem): ICell => {
    return {
      type: 'text',
      data: data[rowIndex]?.[colIndex] || '',
    };
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Grid
        columns={columns}
        rowCount={data.length}
        getCellContent={getCellContent}
      />
    </div>
  );
}
```

### Step 3: Use It

```tsx
function App() {
  return (
    <div className="App">
      <h1>My First Grid</h1>
      <MyFirstGrid />
    </div>
  );
}
```

🎉 **That's it!** You now have a working data grid.

## Your First Kanban Board

Let's create a task management board:

### Step 1: Import Kanban Components

```tsx
import { useEffect } from 'react';
import { useKanbanStore, KanbanBoard } from '@teable/grid-table-kanban';
```

### Step 2: Initialize and Add Tasks

```tsx
function MyFirstKanban() {
  const { initializeBoard, addTask } = useKanbanStore();

  useEffect(() => {
    // Initialize the board
    initializeBoard({
      name: 'My First Project',
      description: 'Learning Kanban basics',
      currentSprint: 'Sprint 1',
    });

    // Add some tasks
    addTask({
      title: 'Setup development environment',
      description: 'Install tools and dependencies',
      developer: 'You',
      complexity: 'S',
      goal: 'Get ready to code',
      status: 'done',
    });

    addTask({
      title: 'Build user interface',
      description: 'Create the main UI components',
      developer: 'You',
      complexity: 'M',
      goal: 'Working UI',
      status: 'in_progress',
    });

    addTask({
      title: 'Add authentication',
      description: 'Implement user login',
      developer: 'You',
      complexity: 'L',
      goal: 'Secure access',
      status: 'todo',
    });
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', padding: '20px' }}>
      <KanbanBoard 
        onTaskClick={(task) => alert(`Clicked: ${task.title}`)}
      />
    </div>
  );
}
```

### Step 3: Use It

```tsx
function App() {
  return (
    <div className="App">
      <MyFirstKanban />
    </div>
  );
}
```

🎉 **Done!** You have a working Kanban board with drag-and-drop.

## Common Use Cases

### Use Case 1: Load Data from API

```tsx
function ApiGrid() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(users => {
        setData(users);
        setLoading(false);
      });
  }, []);

  const getCellContent = ([col, row]: ICellItem): ICell => {
    const user = data[row];
    if (!user) return { type: 'text', data: '' };

    switch (col) {
      case 0: return { type: 'text', data: user.name };
      case 1: return { type: 'text', data: user.email };
      case 2: return { type: 'boolean', data: user.active };
      default: return { type: 'text', data: '' };
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Grid
      columns={columns}
      rowCount={data.length}
      getCellContent={getCellContent}
    />
  );
}
```

### Use Case 2: Editable Grid

```tsx
function EditableGrid() {
  const [data, setData] = useState([
    ['Alice', 'alice@example.com'],
    ['Bob', 'bob@example.com'],
  ]);

  const handleCellEdit = (cell: ICellItem, newValue: IInnerCell) => {
    const [col, row] = cell;
    const newData = [...data];
    newData[row][col] = newValue.data;
    setData(newData);
  };

  return (
    <Grid
      columns={columns}
      rowCount={data.length}
      getCellContent={getCellContent}
      onCellEdited={handleCellEdit}
    />
  );
}
```

### Use Case 3: Move Tasks in Kanban

```tsx
function InteractiveKanban() {
  const { moveTask, addSubTask } = useKanbanStore();

  const handleTaskClick = (task) => {
    // Add a sub-task
    addSubTask(task.id, {
      title: 'Review implementation',
      completed: false,
    });
  };

  // Tasks can be moved by dragging or programmatically
  const handleMoveTaskToDone = (taskId: string) => {
    const result = moveTask(taskId, 'done');
    if (!result.success) {
      alert(`Cannot move task: ${result.error}`);
    }
  };

  return <KanbanBoard onTaskClick={handleTaskClick} />;
}
```

### Use Case 4: Using Example Data

```tsx
import { exampleTasks } from '@teable/grid-table-kanban';

function ExampleKanban() {
  const { initializeBoard } = useKanbanStore();

  useEffect(() => {
    // Load with pre-built examples
    initializeBoard({
      name: 'Example Board',
      tasks: exampleTasks, // 7 example tasks!
    });
  }, []);

  return <KanbanBoard />;
}
```

## Troubleshooting

### Grid not rendering?

Make sure you set a height on the container:

```tsx
<div style={{ width: '100%', height: '400px' }}>
  <Grid ... />
</div>
```

### Kanban board empty?

Did you call `initializeBoard()`? Make sure it runs in `useEffect`:

```tsx
useEffect(() => {
  useKanbanStore.getState().initializeBoard({ name: 'My Board' });
}, []);
```

### TypeScript errors?

Import the types:

```tsx
import type { IGridColumn, ICellItem, ICell } from '@teable/grid-table-kanban';
```

## What's Next?

Now that you have the basics working, explore more:

### 📖 Learn More

- **[QUICKSTART.md](./QUICKSTART.md)** - 7 detailed examples
- **[README.md](./README.md)** - Complete API reference
- **[INDEX.md](./INDEX.md)** - Documentation index

### 🎯 Try These Features

**Grid Features**:
- Different cell types (boolean, rating, select)
- Column resizing and freezing
- Row selection and multi-select
- Keyboard navigation
- Custom themes

**Kanban Features**:
- Add sub-tasks to tasks
- Track bugs with P0/P1/P2 priority
- Add test cases
- Set acceptance criteria
- Track code reviews

### 📚 Example Code

Check out `src/kanban/examples.ts` for 7 comprehensive example tasks showing:
- Tasks in all workflow stages
- Complete metadata usage
- Bug tracking
- Code reviews
- Test cases
- Development logs

### 🚀 Advanced Usage

```tsx
// Grid with different cell types
const getCellContent = ([col, row]: ICellItem): ICell => {
  switch (col) {
    case 0: return { type: 'text', data: 'Hello' };
    case 1: return { type: 'boolean', data: true };
    case 2: return { 
      type: 'rating', 
      data: { rating: 4, max: 5 } 
    };
    case 3: return { 
      type: 'select', 
      data: { 
        options: [{ id: '1', name: 'Active', color: '#10B981' }],
        value: '1'
      }
    };
    default: return { type: 'text', data: '' };
  }
};
```

## Need Help?

- 📖 **Documentation**: See [INDEX.md](./INDEX.md)
- 🐛 **Issues**: Report on GitHub
- 💬 **Questions**: Check README.md

## Tips for Success

1. **Start Small**: Begin with basic examples, then add features
2. **Use TypeScript**: Type definitions help catch errors early
3. **Read Examples**: The example tasks show best practices
4. **Explore API**: README.md has complete API reference
5. **Customize**: All components accept className for styling

## Quick Reference

```tsx
// Grid
import { Grid } from '@teable/grid-table-kanban';
<Grid columns={cols} rowCount={100} getCellContent={fn} />

// Kanban
import { useKanbanStore, KanbanBoard } from '@teable/grid-table-kanban';
const { addTask, moveTask } = useKanbanStore();
<KanbanBoard onTaskClick={fn} />

// Types
import type { 
  IGridColumn, ICellItem, ICell,
  IKanbanTask, TaskStatus 
} from '@teable/grid-table-kanban';
```

---

**Happy Coding!** 🎉

If you found this helpful, check out the full documentation in [INDEX.md](./INDEX.md)!