import {
  Ghost,
  Hourglass,
  ShieldAlert,
  Flame,
  Cpu,
  Sparkles,
  Compass,
  TrendingUp,
  FolderPlus,
  type LucideProps,
} from "lucide-react";

export function NicheIcon({ name, ...props }: { name: string } & LucideProps) {
  switch (name) {
    case "ghost":
    case "scary-stories":
      return <Ghost {...props} />;
    case "history":
      return <Hourglass {...props} />;
    case "true-crime":
      return <ShieldAlert {...props} />;
    case "motivational":
      return <Flame {...props} />;
    case "tech":
      return <Cpu {...props} />;
    case "facts":
      return <Sparkles {...props} />;
    case "philosophy":
      return <Compass {...props} />;
    case "wealth":
      return <TrendingUp {...props} />;
    default:
      return <FolderPlus {...props} />;
  }
}
