export function documentStatusVariant(
  status: string
): "success" | "warning" | "error" | "neutral" {
  if (status === "ready") return "success";
  if (status === "processing") return "warning";
  if (status === "failed") return "error";
  return "neutral";
}

export function documentStatusLabel(status: string): string {
  if (status === "ready") return "Ready";
  if (status === "processing") return "Processing";
  if (status === "failed") return "Failed";
  return status.replace(/_/g, " ");
}
