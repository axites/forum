import { Badge } from "@/components/ui/badge";
import { Shield, Star, Award, User as UserIcon } from "lucide-react";

interface UserBadgeProps {
  rank: string;
}

export function UserBadge({ rank }: UserBadgeProps) {
  const getRankConfig = (rank: string) => {
    switch (rank) {
      case "Admin":
        return { icon: Shield, variant: "default" as const, color: "text-primary" };
      case "Elite":
        return { icon: Award, variant: "secondary" as const, color: "text-primary" };
      case "Member":
        return { icon: Star, variant: "secondary" as const, color: "text-muted-foreground" };
      default:
        return { icon: UserIcon, variant: "secondary" as const, color: "text-muted-foreground" };
    }
  };

  const config = getRankConfig(rank);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="text-xs gap-1">
      <Icon className={`h-3 w-3 ${config.color}`} />
      {rank}
    </Badge>
  );
}
