import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, 
  Play, 
  Copy, 
  Trash2, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { WorkspaceListItem } from "@/types/workspace";
import { formatDistanceToNow } from "date-fns";

interface WorkspaceCardProps {
  workspace: WorkspaceListItem;
  onOpen: (id: string) => void;
  onDuplicate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function WorkspaceCard({ workspace, onOpen, onDuplicate, onDelete }: WorkspaceCardProps) {
  // Debug log to check workspace data
  console.log('WorkspaceCard received data:', workspace);
  
  if (!workspace) {
    console.error('WorkspaceCard: workspace is null or undefined');
    return <div>Error: Workspace data not available</div>;
  }
  
  const getStepProgress = () => {
    return Math.round((workspace.currentStep / workspace.totalSteps) * 100);
  };

  const formatDate = (dateValue: any) => {
    try {
      if (!dateValue) {
        console.warn('Empty date value provided');
        return "Unknown";
      }
      
      // Handle MongoDB date format { "$date": "..." }
      let dateString: string;
      if (typeof dateValue === 'object' && dateValue.$date) {
        dateString = dateValue.$date;
      } else if (typeof dateValue === 'string') {
        dateString = dateValue;
      } else {
        console.warn('Invalid date format:', dateValue);
        return "Unknown";
      }
      
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return "Unknown";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error, dateValue);
      return "Unknown";
    }
  };

  const getStatusBadge = () => {
    if (workspace.isCompleted) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <AlertCircle className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-creative-300">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold truncate mb-1">
              {workspace.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground truncate">
              {workspace.description || "\u00A0"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpen(workspace.id)}>
                <Play className="mr-2 h-4 w-4" />
                Open Workspace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(workspace.id, workspace.name)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(workspace.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3 flex-1 flex flex-col">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-creative-100 to-creative-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden flex-shrink-0">
          {workspace.thumbnail ? (
            <img
              src={workspace.thumbnail}
              alt={workspace.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-creative-500 text-4xl font-bold opacity-50">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Status and Progress */}
        <div className="space-y-3 flex-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            {getStatusBadge()}
            <span className="text-sm text-muted-foreground">
              Step {workspace.currentStep}/{workspace.totalSteps}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 flex-shrink-0">
            <div
              className="bg-creative-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground min-h-[2rem] mt-auto">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(workspace.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Updated {formatDate(workspace.updatedAt)}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 flex-shrink-0">
        <Button
          onClick={() => onOpen(workspace.id)}
          className="w-full bg-creative-500 hover:bg-creative-600 text-white font-semibold min-h-[2.5rem]"
        >
          <Play className="mr-2 h-4 w-4" />
          {workspace.isCompleted ? "View Project" : "Continue Working"}
        </Button>
      </CardFooter>
    </Card>
  );
}
