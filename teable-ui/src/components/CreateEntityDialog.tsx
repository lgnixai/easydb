import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string, description?: string) => void;
  title: string;
  entityType: "space" | "base" | "table";
  loading?: boolean;
}

export const CreateEntityDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  entityType,
  loading = false,
}: CreateEntityDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim(), description.trim() || undefined);
      setName("");
      setDescription("");
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-obsidian-surface border-obsidian-border text-obsidian-text">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-obsidian-text">{title}</DialogTitle>
            <DialogDescription className="text-obsidian-text-muted">
              {entityType === "space" && "创建一个新的工作空间"}
              {entityType === "base" && "在当前空间下创建一个新的数据库"}
              {entityType === "table" && "在当前数据库下创建一个新的表格"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-obsidian-text">
                名称 *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  entityType === "space"
                    ? "例如：我的工作空间"
                    : entityType === "base"
                    ? "例如：CMS"
                    : "例如：用户表"
                }
                className="bg-obsidian-bg border-obsidian-border text-obsidian-text"
                autoFocus
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-obsidian-text">
                描述（可选）
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="添加描述信息..."
                className="bg-obsidian-bg border-obsidian-border text-obsidian-text resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-obsidian-border text-obsidian-text hover:bg-obsidian-surface-hover"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || loading}
              className="bg-obsidian-accent hover:bg-obsidian-accent/90 text-white"
            >
              {loading ? "创建中..." : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

