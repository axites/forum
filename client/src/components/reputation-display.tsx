import { TrendingUp } from "lucide-react";

interface ReputationDisplayProps {
  reputation: number;
  className?: string;
}

export function ReputationDisplay({ reputation, className = "" }: ReputationDisplayProps) {
  const getColor = (rep: number) => {
    if (rep >= 100) return "text-primary";
    if (rep >= 50) return "text-green-500";
    if (rep >= 0) return "text-muted-foreground";
    return "text-destructive";
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <TrendingUp className={`h-3 w-3 ${getColor(reputation)}`} />
      <span className={`text-xs font-mono ${getColor(reputation)}`}>
        {reputation >= 0 ? "+" : ""}{reputation}
      </span>
    </div>
  );
}
