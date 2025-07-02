import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/navigation/header";
import { WorkspaceGrid } from "@/components/workspace/WorkspaceGrid";
import useWorkspace from "@/hooks/data/useWorkspace";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateWorkspaceRequest } from "@/types/workspace";

export default function Workspace() {
  const navigate = useNavigate();
  const {
    useGetWorkspaces,
    createWorkspace,
    deleteWorkspace,
    duplicateWorkspace,
    isCreatingWorkspace,
    isDeletingWorkspace,
  } = useWorkspace();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    workspaceId: string;
    workspaceName: string;
  }>({ isOpen: false, workspaceId: "", workspaceName: "" });

  const itemsPerPage = 12;
  // Fetch workspaces
  const { data: workspaceResponse, isLoading } = useGetWorkspaces(
    currentPage,
    itemsPerPage,
    searchQuery || undefined
  );

  const workspaces = workspaceResponse?.data ?? [];
  const totalPages = Math.ceil((workspaceResponse?.total ?? 0) / itemsPerPage);
  console.log("totalPages:", totalPages);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleOpenWorkspace = (id: string) => {
    navigate(`/create?workspace=${id}`);
  };

  const handleDuplicateWorkspace = async (id: string, newName: string) => {
    try {
      await duplicateWorkspace({ id, newName });
    } catch (error) {
      console.error("Failed to duplicate workspace:", error);
    }
  };

  const handleDeleteWorkspace = (id: string) => {
    const workspace = workspaces.find(w => w.id === id);
    if (workspace) {
      setDeleteDialog({
        isOpen: true,
        workspaceId: id,
        workspaceName: workspace.name,
      });
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteWorkspace(deleteDialog.workspaceId);
      setDeleteDialog({ isOpen: false, workspaceId: "", workspaceName: "" });
    } catch (error) {
      console.error("Failed to delete workspace:", error);
    }
  };

  const handleCreateNew = async (name: string, description: string) => {
    const workspaceData: CreateWorkspaceRequest = {
      name,
      description,
    }
    const result = await createWorkspace(workspaceData);
    if (result) {
      navigate(`/create?workspace=${result.id}`);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 container py-8">
        <WorkspaceGrid
          workspaces={workspaces}
          isLoading={isLoading}
          onSearch={handleSearch}
          onOpenWorkspace={handleOpenWorkspace}
          onDuplicateWorkspace={handleDuplicateWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          onCreateNew={handleCreateNew}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={workspaceResponse?.total ?? 0}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          isCreatingWorkspace={isCreatingWorkspace}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog 
          open={deleteDialog.isOpen} 
          onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, isOpen: open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteDialog.workspaceName}"? 
                This action cannot be undone and will permanently remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeletingWorkspace}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeletingWorkspace ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}