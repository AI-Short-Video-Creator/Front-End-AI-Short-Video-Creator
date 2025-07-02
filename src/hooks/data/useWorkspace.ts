import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../use-toast";
import axiosInstance from "@/config";
import { AxiosError } from "axios";
import {
  WorkspaceData,
  WorkspaceListItem,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  WorkspaceApiResponse
} from "@/types/workspace";

const useWorkspace = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all workspaces
  const useGetWorkspaces = (page: number = 1, limit: number = 12, search?: string) => {
    console.log("Fetching workspaces with params:", { page, limit, search });
    return useQuery<WorkspaceApiResponse, AxiosError>({
      queryKey: ["workspaces", page, limit, search],
      queryFn: async () => {
        const params: any = { page, limit };
        if (search) params.search = search;
        
        const res = await axiosInstance.get<WorkspaceApiResponse>("/workspace", { params });
        return res.data;
      },
    });
  };

  // Get single workspace by ID
  const useGetWorkspace = (id: string) => {
    return useQuery<WorkspaceData, AxiosError>({
      queryKey: ["workspace", id],
      queryFn: async () => {
        const res = await axiosInstance.get<WorkspaceData>(`/workspace/${id}`);
        return res.data;
      },
      enabled: !!id,
    });
  };

  // Create new workspace
  const { mutateAsync: createWorkspace, isPending: isCreatingWorkspace } = useMutation({
    mutationFn: async (data: CreateWorkspaceRequest) => {
      const res = await axiosInstance.post<WorkspaceData>("/workspace", data);
      return res.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Workspace Created",
        description: `"${data.name}" has been saved successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast({
        title: "Failed to Create Workspace",
        description: error.response?.data?.message || "An error occurred while creating workspace.",
        variant: "destructive",
      });
    },
  });

  // Update existing workspace
  const { mutateAsync: updateWorkspace, isPending: isUpdatingWorkspace } = useMutation({
    mutationFn: async (data: UpdateWorkspaceRequest) => {
      const { id, ...updateData } = data;
      const res = await axiosInstance.put<WorkspaceData>(`/workspace/${id}`, updateData);
      return res.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Workspace Updated",
        description: `"${data.name}" has been updated successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspace", data.id] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast({
        title: "Failed to Update Workspace",
        description: error.response?.data?.message || "An error occurred while updating workspace.",
        variant: "destructive",
      });
    },
  });

  // Delete workspace
  const { mutateAsync: deleteWorkspace, isPending: isDeletingWorkspace } = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/workspace/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      toast({
        title: "Workspace Deleted",
        description: "Workspace has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.removeQueries({ queryKey: ["workspace", deletedId] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast({
        title: "Failed to Delete Workspace",
        description: error.response?.data?.message || "An error occurred while deleting workspace.",
        variant: "destructive",
      });
    },
  });

  // Duplicate workspace
  const { mutateAsync: duplicateWorkspace, isPending: isDuplicatingWorkspace } = useMutation({
    mutationFn: async ({ id, newName }: { id: string; newName: string }) => {
      const res = await axiosInstance.post<WorkspaceData>(`/workspace/${id}/duplicate`, { name: newName });
      return res.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Workspace Duplicated",
        description: `"${data.name}" has been created as a copy.`,
      });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast({
        title: "Failed to Duplicate Workspace",
        description: error.response?.data?.message || "An error occurred while duplicating workspace.",
        variant: "destructive",
      });
    },
  });

  return {
    useGetWorkspaces,
    useGetWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    duplicateWorkspace,
    isCreatingWorkspace,
    isUpdatingWorkspace,
    isDeletingWorkspace,
    isDuplicatingWorkspace,
  };
};

export default useWorkspace;
