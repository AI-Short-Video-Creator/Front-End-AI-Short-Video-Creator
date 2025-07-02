import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WorkspaceCard } from "./WorkspaceCard";
import { WorkspaceListItem } from "@/types/workspace";
import { Search, Plus, Filter, SortAsc, Copy, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface WorkspaceGridProps {
  workspaces: WorkspaceListItem[];
  isLoading: boolean;
  onSearch: (query: string) => void;
  onOpenWorkspace: (id: string) => void;
  onDuplicateWorkspace: (id: string, newName: string) => void;
  onDeleteWorkspace: (id: string) => void;
  onCreateNew: (name: string, description: string) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isCreatingWorkspace?: boolean;
}

export function WorkspaceGrid({
  workspaces,
  isLoading,
  onSearch,
  onOpenWorkspace,
  onDuplicateWorkspace,
  onDeleteWorkspace,
  onCreateNew,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isCreatingWorkspace,
}: WorkspaceGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"created" | "updated" | "name">("updated");
  const [filterBy, setFilterBy] = useState<"all" | "completed" | "in-progress">("all");
  const [duplicateDialog, setDuplicateDialog] = useState<{
    isOpen: boolean;
    workspaceId: string;
    originalName: string;
  }>({ isOpen: false, workspaceId: "", originalName: "" });
  const [duplicateName, setDuplicateName] = useState("");
  const [createNewDialog, setCreateNewDialog] = useState < {
    isOpen: boolean;
    name: string;
    description: string;
  }>({ isOpen: false, name: "", description: "" });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleCreateNew = () => {
    setCreateNewDialog({ isOpen: true, name: "", description: "" });
  }

  const handleDuplicate = (id: string, originalName: string) => {
    setDuplicateDialog({ isOpen: true, workspaceId: id, originalName });
    setDuplicateName(`${originalName} (Copy)`);
  };

  const confirmDuplicate = () => {
    if (duplicateName.trim()) {
      onDuplicateWorkspace(duplicateDialog.workspaceId, duplicateName.trim());
      setDuplicateDialog({ isOpen: false, workspaceId: "", originalName: "" });
      setDuplicateName("");
    }
  };

  const filteredAndSortedWorkspaces = React.useMemo(() => {
    let filtered = workspaces;

    // Filter
    switch (filterBy) {
      case "completed":
        filtered = workspaces.filter(w => w.isCompleted);
        break;
      case "in-progress":
        filtered = workspaces.filter(w => !w.isCompleted);
        break;
      default:
        filtered = workspaces;
    }

    // Sort
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "created":
          return new Date(b.createdAt.$date).getTime() - new Date(a.createdAt.$date).getTime();
        case "updated":
        default:
          return new Date(b.updatedAt.$date).getTime() - new Date(a.updatedAt.$date).getTime();
      }
    });
  }, [workspaces, filterBy, sortBy]);

  if (isLoading && searchQuery === "") {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        
        {/* Filter Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="aspect-video bg-gray-200 rounded" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-2 bg-gray-200 rounded" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">My Workspaces</h1>
          <p className="text-muted-foreground">
            Manage your video creation projects and continue where you left off.
          </p>
        </div>
        <Button onClick={handleCreateNew} className="bg-creative-500 hover:bg-creative-600">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SortAsc className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Last Updated</SelectItem>
            <SelectItem value="created">Date Created</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filteredAndSortedWorkspaces.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? "No workspaces found" : "No workspaces yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "Try adjusting your search or filters" 
              : "Create your first video project to get started"}
          </p>
          {!searchQuery && (
            <Button onClick={handleCreateNew} className="bg-creative-500 hover:bg-creative-600">
              <Plus className="mr-2 h-4 w-4" />
              Create First Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedWorkspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              onOpen={onOpenWorkspace}
              onDuplicate={handleDuplicate}
              onDelete={onDeleteWorkspace}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Results info */}
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} workspaces
          </div>
          
          {/* Pagination controls */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Create New Workspace Dialog */}
      <Dialog open={createNewDialog.isOpen} onOpenChange={(open) => 
        setCreateNewDialog({ ...createNewDialog, isOpen: open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Start a new video project to organize your media and edits.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input
              id="workspace-name"
              required
              value={createNewDialog.name}
              onChange={(e) => setCreateNewDialog({ ...createNewDialog, name: e.target.value })}
              placeholder="Enter workspace name..."
              className="mt-2"
            />
          </div>
          <div className="py-4">
            <Label htmlFor="workspace-description">Description</Label>
            <Input
              id="workspace-description"
              value={createNewDialog.description}
              onChange={(e) => setCreateNewDialog({ ...createNewDialog, description: e.target.value })}
              placeholder="Enter workspace description..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateNewDialog({ isOpen: false, name: "", description: "" })}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onCreateNew(createNewDialog.name, createNewDialog.description);
              }}
              disabled={!createNewDialog.name.trim() || isCreatingWorkspace}
              className="bg-creative-500 hover:bg-creative-600"
            >
              Create Workspace
              {isCreatingWorkspace && (
                <RefreshCw className="animate-spin mr-2 h-4 w-4" />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialog.isOpen} onOpenChange={(open) => 
        setDuplicateDialog({ ...duplicateDialog, isOpen: open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Workspace</DialogTitle>
            <DialogDescription>
              Create a copy of "{duplicateDialog.originalName}" with a new name.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="duplicate-name">New workspace name</Label>
            <Input
              id="duplicate-name"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              placeholder="Enter new name..."
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDuplicateDialog({ isOpen: false, workspaceId: "", originalName: "" })}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDuplicate}
              disabled={!duplicateName.trim()}
              className="bg-creative-500 hover:bg-creative-600"
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
