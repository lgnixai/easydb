# Quick Start Guide

Get started with `@teable/grid-table-kanban` in 5 minutes!

## Installation

```bash
npm install @teable/grid-table-kanban
# or
pnpm add @teable/grid-table-kanban
# or
yarn add @teable/grid-table-kanban
```

## 1. Basic Grid Table

Create a simple data table:

```tsx
import { Grid } from '@teable/grid-table-kanban';
import type { IGridColumn, ICellItem, ICell } from '@teable/grid-table-kanban';

function MyTable() {
  // Define columns
  const columns: IGridColumn[] = [
    { id: '1', name: 'Name', width: 200 },
    { id: '2', name: 'Email', width: 250 },
    { id: '3', name: 'Status', width: 150 },
  ];

  // Sample data
  const data = [
    ['Alice', 'alice@example.com', 'Active'],
    ['Bob', 'bob@example.com', 'Inactive'],
    ['Carol', 'carol@example.com', 'Active'],
  ];

  // Cell content provider
  const getCellContent = ([colIndex, rowIndex]: ICellItem): ICell => {
    return {
      type: 'text',
      data: data[rowIndex]?.[colIndex] || '',
    };
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Grid
        columns={columns}
        rowCount={data.length}
        getCellContent={getCellContent}
      />
    </div>
  );
}
```

## 2. Editable Grid

Add editing capabilities:

```tsx
import { Grid } from '@teable/grid-table-kanban';
import { useState } from 'react';

function EditableTable() {
  const [data, setData] = useState([
    ['Alice', 'alice@example.com', 'Active'],
    ['Bob', 'bob@example.com', 'Inactive'],
  ]);

  const columns = [
    { id: '1', name: 'Name', width: 200 },
    { id: '2', name: 'Email', width: 250 },
    { id: '3', name: 'Status', width: 150 },
  ];

  const getCellContent = ([colIndex, rowIndex]) => ({
    type: 'text',
    data: data[rowIndex]?.[colIndex] || '',
  });

  const handleCellEdit = (cell, newValue) => {
    const [colIndex, rowIndex] = cell;
    const newData = [...data];
    newData[rowIndex][colIndex] = newValue.data;
    setData(newData);
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Grid
        columns={columns}
        rowCount={data.length}
        getCellContent={getCellContent}
        onCellEdited={handleCellEdit}
      />
    </div>
  );
}
```

## 3. Simple Kanban Board

Create a basic task board:

```tsx
import { useEffect } from 'react';
import { useKanbanStore, KanbanBoard } from '@teable/grid-table-kanban';

function MyKanban() {
  const { initializeBoard, addTask } = useKanbanStore();

  useEffect(() => {
    // Initialize board
    initializeBoard({
      name: 'My Project Board',
      description: 'Track project tasks',
      currentSprint: 'Sprint 1',
    });

    // Add sample tasks
    addTask({
      title: 'Setup project',
      description: 'Initialize project structure',
      developer: 'Alice',
      complexity: 'S',
      goal: 'Get project started',
      status: 'in_progress',
    });

    addTask({
      title: 'Build authentication',
      description: 'Add user login',
      developer: 'Bob',
      complexity: 'M',
      goal: 'Secure user access',
      status: 'todo',
    });
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', padding: '20px' }}>
      <KanbanBoard onTaskClick={(task) => console.log('Clicked:', task)} />
    </div>
  );
}
```

## 4. Kanban with Task Management

Full task lifecycle example:

```tsx
import { useKanbanStore, KanbanBoard, TaskCard } from '@teable/grid-table-kanban';

function AdvancedKanban() {
  const { 
    initializeBoard, 
    addTask, 
    moveTask,
    addSubTask,
    addAcceptanceCriteria,
  } = useKanbanStore();

  useEffect(() => {
    initializeBoard({ name: 'Development Board' });

    // Add a complete task
    const taskId = 'TASK-001';
    addTask({
      id: taskId,
      title: 'Implement search feature',
      description: 'Add search with filters',
      developer: 'Carol',
      complexity: 'M',
      goal: 'Allow users to search content',
      status: 'in_progress',
    });

    // Add sub-tasks
    addSubTask(taskId, {
      title: 'Design search UI',
      completed: true,
    });
    addSubTask(taskId, {
      title: 'Implement search API',
      completed: false,
    });

    // Add acceptance criteria
    addAcceptanceCriteria(taskId, {
      description: 'Search returns results in < 500ms',
      validated: false,
    });
  }, []);

  const handleTaskClick = (task) => {
    console.log('Task clicked:', task);
    // Open task detail modal/drawer
  };

  const handleMoveTask = async (taskId, newStatus) => {
    const result = moveTask(taskId, newStatus);
    if (!result.success) {
      alert(`Cannot move task: ${result.error}`);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <KanbanBoard 
        onTaskClick={handleTaskClick}
        showStats={true}
      />
    </div>
  );
}
```

## 5. Using Example Tasks

Load pre-built example tasks:

```tsx
import { useEffect } from 'react';
import { useKanbanStore, KanbanBoard, exampleTasks } from '@teable/grid-table-kanban';

function ExampleKanban() {
  const { initializeBoard } = useKanbanStore();

  useEffect(() => {
    // Initialize with example tasks
    initializeBoard({
      name: 'Example Project',
      description: 'Demonstrates full workflow',
      tasks: exampleTasks,
      currentSprint: 'Sprint 1',
    });
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <KanbanBoard />
    </div>
  );
}
```

## 6. Grid with Different Cell Types

Use various cell renderers:

```tsx
import { Grid } from '@teable/grid-table-kanban';

function AdvancedGrid() {
  const columns = [
    { id: '1', name: 'Name', width: 200 },
    { id: '2', name: 'Active', width: 100 },
    { id: '3', name: 'Rating', width: 150 },
    { id: '4', name: 'Tags', width: 200 },
  ];

  const getCellContent = ([colIndex, rowIndex]) => {
    switch (colIndex) {
      case 0:
        return { type: 'text', data: `User ${rowIndex}` };
      
      case 1:
        return { type: 'boolean', data: rowIndex % 2 === 0 };
      
      case 2:
        return { 
          type: 'rating', 
          data: { 
            rating: (rowIndex % 5) + 1,
            max: 5 
          } 
        };
      
      case 3:
        return { 
          type: 'select', 
          data: {
            options: [
              { id: '1', name: 'Frontend', color: '#3B82F6' },
              { id: '2', name: 'Backend', color: '#10B981' },
            ],
            value: rowIndex % 2 === 0 ? '1' : '2',
          }
        };
      
      default:
        return { type: 'text', data: '' };
    }
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Grid
        columns={columns}
        rowCount={100}
        getCellContent={getCellContent}
      />
    </div>
  );
}
```

## 7. Customizing Theme

Apply custom theme:

```tsx
import { Grid } from '@teable/grid-table-kanban';

function ThemedGrid() {
  const customTheme = {
    fontSizeSM: 12,
    fontSizeMD: 14,
    fontSizeLG: 16,
    iconSizeSM: 14,
    iconSizeMD: 18,
    iconSizeLG: 22,
  };

  return (
    <Grid
      columns={columns}
      rowCount={100}
      getCellContent={getCellContent}
      theme={customTheme}
    />
  );
}
```

## Common Patterns

### Pattern 1: Load Data from API

```tsx
function ApiDataGrid() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Grid
      columns={columns}
      rowCount={data.length}
      getCellContent={([col, row]) => ({
        type: 'text',
        data: data[row]?.[columns[col].id] || ''
      })}
    />
  );
}
```

### Pattern 2: Persist Kanban State

```tsx
function PersistentKanban() {
  const { board, exportToJSON, importFromJSON } = useKanbanStore();

  const handleSave = () => {
    const json = exportToJSON();
    localStorage.setItem('kanban-board', json);
  };

  const handleLoad = () => {
    const json = localStorage.getItem('kanban-board');
    if (json) {
      importFromJSON(json);
    }
  };

  useEffect(() => {
    handleLoad();
  }, []);

  return (
    <>
      <button onClick={handleSave}>Save Board</button>
      <KanbanBoard />
    </>
  );
}
```

### Pattern 3: Filter Tasks

```tsx
function FilteredKanban() {
  const { board, setFilter } = useKanbanStore();

  const handleFilterByDeveloper = (developer) => {
    setFilter({ developer });
  };

  const handleFilterByStatus = (status) => {
    setFilter({ status: [status] });
  };

  const handleClearFilter = () => {
    setFilter({});
  };

  return (
    <>
      <div>
        <button onClick={() => handleFilterByDeveloper('Alice')}>
          Alice's Tasks
        </button>
        <button onClick={() => handleFilterByStatus('in_progress')}>
          In Progress
        </button>
        <button onClick={handleClearFilter}>
          Clear Filter
        </button>
      </div>
      <KanbanBoard />
    </>
  );
}
```

## Next Steps

1. **Explore Examples**: Check `src/kanban/examples.ts` for comprehensive task examples
2. **Read API Docs**: See `README.md` for complete API reference
3. **Customize**: Extend components for your specific needs
4. **Contribute**: Share your improvements with the community

## Need Help?

- 📖 **Documentation**: See `README.md`
- 📝 **Examples**: Check `src/kanban/examples.ts`
- 🐛 **Issues**: Report on GitHub
- 💬 **Discussions**: Join community forums

## Tips

1. **Performance**: Use virtual scrolling for datasets > 1000 rows
2. **State**: Zustand store is reactive - components update automatically
3. **Types**: Import types for better autocomplete
4. **Validation**: Task movement validates workflow rules automatically
5. **Customization**: All components accept className for styling

Happy coding! 🚀