import { Button } from "@/components/ui/button";
import { Send, Trash2, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LeadActionsProps {
  selectedCount: number;
  onMessageSelected: () => void;
  onClearSelection: () => void;
}

export const LeadActions = ({ selectedCount, onMessageSelected, onClearSelection }: LeadActionsProps) => {
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
