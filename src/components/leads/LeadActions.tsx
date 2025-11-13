import { Button } from "@/components/ui/button";
import { Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LeadActionsProps {
  selectedCount: number;
  onMessageSelected: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onUpdateSelected?: () => void;
  deleteLoading?: boolean;
  updateLoading?: boolean;
}

export const LeadActions = ({ selectedCount, onMessageSelected, onClearSelection, onDeleteSelected, onUpdateSelected, deleteLoading, updateLoading }: LeadActionsProps) => {
  const { toast } = useToast();

  return (
    <div className="flex items-center justify-between py-4 px-6 bg-card border-y border-border">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {selectedCount > 0 ? (
            <span className="font-medium text-foreground">
              {selectedCount} lead{selectedCount === 1 ? '' : 's'} selected
            </span>
          ) : (
            'No leads selected'
          )}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
            >
              Clear Selection
            </Button>
            {selectedCount === 1 && onUpdateSelected && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onUpdateSelected}
                disabled={updateLoading}
                className="gap-2"
              >
                ✎ Update Lead
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteSelected}
              disabled={deleteLoading}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {deleteLoading ? 'Deleting...' : 'Delete Selected'}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onMessageSelected}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Message Selected
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
