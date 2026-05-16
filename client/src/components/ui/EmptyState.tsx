import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <Icon className="h-7 w-7" />
      </span>
      <p className="font-medium text-fg">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-fg-muted">{description}</p>
      )}
    </div>
  );
}
