import { useState, useRef } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { DirectoryTree } from "./DirectoryTree";
import { DraggableTabSystem } from "./DraggableTabSystem";
import { RightSidebar } from "./RightSidebar";
import { ThemeSwitch } from "./ThemeSwitch";
import { SpaceBaseSelector, SpaceOption, SpaceSelect, BaseSelect } from "./SpaceBaseSelector";
import { AuthStatus } from "./AuthStatus";
import { CreateEntityDialog } from "./CreateEntityDialog";
import teable from "@/lib/teable-simple";
import { useEffect } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tab {
  id: string;
  title: string;
  content: string;
  type: "markdown" | "table";
  tableId?: string;
  baseId?: string;
}

export const ObsidianLayout = () => {
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);
  const leftPanelRef = useRef<any>(null);
  const rightPanelRef = useRef<any>(null);
  const [openTabs, setOpenTabs] = useState<Tab[]>([
    { id: "tab1", title: "新标签页", content: "# 欢迎使用 Obsidian 风格编辑器\n\n开始编写您的内容...", type: "markdown" },
  ]);
  const [activeTab, setActiveTab] = useState("tab1");
  const { toast } = useToast();
  const { isAuthenticated, error: authError } = useAuth();
  const [spaces, setSpaces] = useState<SpaceOption[]>([]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>("");
  const [selectedBaseId, setSelectedBaseId] = useState<string>("");
  const [loadingData, setLoadingData] = useState(false);
  const [currentTables, setCurrentTables] = useState<string[]>([]);
  
  // 创建对话框状态
  const [showCreateSpaceDialog, setShowCreateSpaceDialog] = useState(false);
  const [showCreateBaseDialog, setShowCreateBaseDialog] = useState(false);
  const [showCreateTableDialog, setShowCreateTableDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  // 初始化时获取所有 spaces
  useEffect(() => {
    const loadSpaces = async () => {
      if (!isAuthenticated) return;
      
      setLoadingData(true);
      try {
        const spaceResp = await teable.listSpaces({ limit: 50 });
        const spaceItems = spaceResp.data;
        const combined: SpaceOption[] = spaceItems.map(s => ({
          id: s.id,
          name: s.name,
          bases: [], // 初始为空，等选择 space 后再加载
        }));
        setSpaces(combined);
        if (combined.length) {
          setSelectedSpaceId(combined[0].id);
        }
      } catch (e: any) {
        toast({ 
          title: "获取空间列表失败", 
          description: String(e?.message || e), 
          variant: "destructive" 
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadSpaces();
  }, [isAuthenticated, toast]);

  // 当 selectedSpaceId 变化时，获取该 space 下的 bases
  useEffect(() => {
    const loadBases = async () => {
      if (!selectedSpaceId || !isAuthenticated) return;
      
      setLoadingData(true);
      try {
        const baseResp = await teable.listBases({ limit: 100 });
        // 过滤出当前 space 下的 bases
        const spaceBases = baseResp.data
          .filter(b => b.space_id === selectedSpaceId)
          .map(b => ({ id: b.id, name: b.name, tables: [] }));
        
        // 更新 spaces 中对应 space 的 bases
        setSpaces(prev => prev.map(space => 
          space.id === selectedSpaceId 
            ? { ...space, bases: spaceBases }
            : space
        ));
        
        // 默认选中第一个 base
        if (spaceBases.length > 0) {
          setSelectedBaseId(spaceBases[0].id);
        } else {
          setSelectedBaseId("");
          setCurrentTables([]);
        }
      } catch (e: any) {
        toast({ 
          title: "获取数据库列表失败", 
          description: String(e?.message || e), 
          variant: "destructive" 
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadBases();
  }, [selectedSpaceId, isAuthenticated, toast]);

  // 当 selectedBaseId 变化时，获取该 base 下的 tables
  useEffect(() => {
    const loadTables = async () => {
      if (!selectedBaseId || !isAuthenticated) return;
      
      setLoadingData(true);
      try {
        const tablesResp = await teable.listTables({ base_id: selectedBaseId, limit: 200 });
        if (tablesResp.data.length > 0) {
          const tableNames = tablesResp.data.map(t => `${t.name}.md`);
          setCurrentTables(tableNames);
        } else {
          // 如果没有 tables，显示一些示例数据
          const spaceName = spaces.find(s => s.id === selectedSpaceId)?.name || "未命名空间";
          const baseName = spaces.find(s => s.id === selectedSpaceId)?.bases.find(b => b.id === selectedBaseId)?.name || "未命名数据库";
          setCurrentTables([
            `${baseName}表1.md`,
            `${baseName}表2.md`, 
            `${baseName}表3.md`
          ]);
        }
      } catch (e: any) {
        toast({ 
          title: "获取表格列表失败", 
          description: String(e?.message || e), 
          variant: "destructive" 
        });
        setCurrentTables([]);
      } finally {
        setLoadingData(false);
      }
    };

    loadTables();
  }, [selectedBaseId, isAuthenticated, toast, selectedSpaceId, spaces]);

  const handleTabClose = (tabId: string) => {
    const newTabs = openTabs.filter(tab => tab.id !== tabId);
    setOpenTabs(newTabs);
    
    if (activeTab === tabId && newTabs.length > 0) {
      setActiveTab(newTabs[0].id);
    }
  };

  const handleFileOpen = (fileName: string) => {
    // Check if file is already open
    const existingTab = openTabs.find(tab => tab.title === fileName);
    if (existingTab) {
      setActiveTab(existingTab.id);
      return;
    }

    // 从当前表列表中解析 tableId（当前实现：去掉 .md，再通过 listTables 找到同名表）
    const name = fileName.replace(/\.md$/i, "");
    const createTableTab = async () => {
      try {
        const tablesResp = await teable.listTables({ base_id: selectedBaseId, limit: 200 });
        const match = tablesResp.data.find(t => t.name === name);
        if (match) {
          const newTab: Tab = {
            id: `tab-${Date.now()}`,
            title: fileName,
            content: "",
            type: "table",
            tableId: match.id,
            baseId: selectedBaseId,
          };
          setOpenTabs(prev => [...prev, newTab]);
          setActiveTab(newTab.id);
          return;
        }
      } catch {}
      const newTab: Tab = {
        id: `tab-${Date.now()}`,
        title: fileName,
        content: `# ${fileName}\n\n这是 ${fileName} 的内容...`,
        type: "markdown"
      };
      setOpenTabs(prev => [...prev, newTab]);
      setActiveTab(newTab.id);
    };
    createTableTab();
  };

  const handleFileCreate = (fileName: string, type: string) => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: fileName,
      content: type === "markdown" ? `# ${fileName}\n\n` : "",
      type: "markdown"
    };
    
    setOpenTabs([...openTabs, newTab]);
    setActiveTab(newTab.id);
    toast({
      title: "文件已创建",
      description: `${fileName} 已成功创建`,
    });
  };

  const handleFileDelete = (fileName: string) => {
    // Close tab if open
    const tabToClose = openTabs.find(tab => tab.title === fileName);
    if (tabToClose) {
      handleTabClose(tabToClose.id);
    }
    
    toast({
      title: "文件已删除",
      description: `${fileName} 已被删除`,
      variant: "destructive",
    });
  };

  const handleNewFile = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: "新标签页",
      content: "# 新文档\n\n开始编写...",
      type: "markdown"
    };
    
    setOpenTabs([...openTabs, newTab]);
    setActiveTab(newTab.id);
  };

  const handleSave = () => {
    toast({
      title: "已保存",
      description: "文档已保存到本地",
    });
  };

  const handleTabAdd = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      title: "新标签页",
      content: "# 新文档\n\n开始编写...",
      type: "markdown"
    };
    
    setOpenTabs([...openTabs, newTab]);
    setActiveTab(newTab.id);
  };

  const handleTabsReorder = (newTabs: Tab[]) => {
    setOpenTabs(newTabs);
  };

  const handleContentChange = (tabId: string, content: string) => {
    setOpenTabs(tabs => 
      tabs.map(tab => 
        tab.id === tabId ? { ...tab, content } : tab
      )
    );
  };

  // 创建 Space
  const handleCreateSpace = async (name: string, description?: string) => {
    setCreating(true);
    try {
      const response = await teable.createSpace({ name, description });
      const newSpace: SpaceOption = {
        id: response.data.id,
        name: response.data.name,
        bases: [],
      };
      setSpaces(prev => [...prev, newSpace]);
      setSelectedSpaceId(newSpace.id);
      toast({
        title: "创建成功",
        description: `空间 "${name}" 已创建`,
      });
      setShowCreateSpaceDialog(false);
    } catch (e: any) {
      toast({
        title: "创建失败",
        description: String(e?.message || e),
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // 创建 Base
  const handleCreateBase = async (name: string, description?: string) => {
    if (!selectedSpaceId) {
      toast({
        title: "创建失败",
        description: "请先选择一个空间",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const response = await teable.createBase({
        space_id: selectedSpaceId,
        name,
        description,
      });
      const newBase = {
        id: response.data.id,
        name: response.data.name,
        tables: [],
      };
      
      // 更新当前 space 的 bases
      setSpaces(prev =>
        prev.map(space =>
          space.id === selectedSpaceId
            ? { ...space, bases: [...space.bases, newBase] }
            : space
        )
      );
      setSelectedBaseId(newBase.id);
      toast({
        title: "创建成功",
        description: `数据库 "${name}" 已创建`,
      });
      setShowCreateBaseDialog(false);
    } catch (e: any) {
      toast({
        title: "创建失败",
        description: String(e?.message || e),
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // 创建 Table
  const handleCreateTable = async (name: string, description?: string) => {
    if (!selectedBaseId) {
      toast({
        title: "创建失败",
        description: "请先选择一个数据库",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const response = await teable.createTable({
        base_id: selectedBaseId,
        name,
        description,
      });
      
      // 刷新表格列表
      const tablesResp = await teable.listTables({ base_id: selectedBaseId, limit: 200 });
      const tableNames = tablesResp.data.map(t => `${t.name}.md`);
      setCurrentTables(tableNames);
      
      toast({
        title: "创建成功",
        description: `表格 "${name}" 已创建`,
      });
      setShowCreateTableDialog(false);
    } catch (e: any) {
      toast({
        title: "创建失败",
        description: String(e?.message || e),
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewFile: handleNewFile,
    onSave: handleSave,
    onCloseTab: () => {
      if (activeTab) {
        handleTabClose(activeTab);
      }
    },
  });

  return (
    <div className="h-screen bg-obsidian-bg text-obsidian-text overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-obsidian-border bg-obsidian-surface">
        <div className="flex items-center space-x-2">
          <button
            className="px-2 py-1 text-xs rounded border border-obsidian-border hover:bg-obsidian-surface-hover"
            onClick={() => {
              setShowLeft(v => {
                const next = !v;
                if (next) {
                  leftPanelRef.current?.expand?.();
                } else {
                  leftPanelRef.current?.collapse?.();
                }
                return next;
              });
            }}
            title={showLeft ? "收起左侧栏" : "展开左侧栏"}
          >
            {showLeft ? "隐藏左栏" : "显示左栏"}
          </button>
          <button
            className="px-2 py-1 text-xs rounded border border-obsidian-border hover:bg-obsidian-surface-hover"
            onClick={() => {
              setShowRight(v => {
                const next = !v;
                if (next) {
                  rightPanelRef.current?.expand?.();
                } else {
                  rightPanelRef.current?.collapse?.();
                }
                return next;
              });
            }}
            title={showRight ? "收起右侧栏" : "展开右侧栏"}
          >
            {showRight ? "隐藏右栏" : "显示右栏"}
          </button>
          {isAuthenticated && !loadingData && (
            <>
              <SpaceSelect
                spaces={spaces}
                spaceId={selectedSpaceId}
                onChange={(sid) => {
                  setSelectedSpaceId(sid);
                  setSelectedBaseId("");
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateSpaceDialog(true)}
                className="text-obsidian-text-muted hover:text-obsidian-text h-7 w-7 p-0"
                title="创建空间"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <AuthStatus />
          <ThemeSwitch />
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="h-full" autoSaveId="obsidian-layout-panels">
        {/* Left Sidebar - Directory Tree */}
        <ResizablePanel
          ref={leftPanelRef}
          defaultSize={20}
          minSize={10}
          maxSize={35}
          collapsible
          collapsedSize={0}
        >
          <DirectoryTree 
            onFileOpen={handleFileOpen}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            items={currentTables}
            onCreateTable={() => setShowCreateTableDialog(true)}
            headerLeft={isAuthenticated && !loadingData ? (
              <div className="flex items-center gap-1">
                <BaseSelect
                  bases={spaces.find(s=>s.id===selectedSpaceId)?.bases ?? []}
                  baseId={selectedBaseId}
                  onChange={(bid) => setSelectedBaseId(bid)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateBaseDialog(true)}
                  className="text-obsidian-text-muted hover:text-obsidian-text h-7 w-7 p-0"
                  title="创建数据库"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : null}
          />
        </ResizablePanel>
        
        <ResizableHandle className={`w-1 bg-obsidian-border hover:bg-obsidian-accent transition-colors ${!showLeft ? "invisible pointer-events-none" : ""}`} />
        
        {/* Main Content Area */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <DraggableTabSystem 
            tabs={openTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onTabClose={handleTabClose}
            onTabSplit={(tabId, direction) => {
              console.log("Split tab", tabId, direction);
            }}
            onTabsReorder={handleTabsReorder}
            onTabAdd={handleTabAdd}
            onContentChange={handleContentChange}
          />
        </ResizablePanel>
        
        <ResizableHandle className={`w-1 bg-obsidian-border hover:bg-obsidian-accent transition-colors ${!showRight ? "invisible pointer-events-none" : ""}`} />
        
        {/* Right Sidebar */}
        <ResizablePanel
          ref={rightPanelRef}
          defaultSize={20}
          minSize={10}
          maxSize={35}
          collapsible
          collapsedSize={0}
        >
          <RightSidebar />
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* 创建对话框 */}
      <CreateEntityDialog
        open={showCreateSpaceDialog}
        onOpenChange={setShowCreateSpaceDialog}
        onConfirm={handleCreateSpace}
        title="创建空间"
        entityType="space"
        loading={creating}
      />
      <CreateEntityDialog
        open={showCreateBaseDialog}
        onOpenChange={setShowCreateBaseDialog}
        onConfirm={handleCreateBase}
        title="创建数据库"
        entityType="base"
        loading={creating}
      />
      <CreateEntityDialog
        open={showCreateTableDialog}
        onOpenChange={setShowCreateTableDialog}
        onConfirm={handleCreateTable}
        title="创建表格"
        entityType="table"
        loading={creating}
      />
      
      <Toaster />
    </div>
  );
};