export function StudySection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="study-section">
      <div className="mb-3">
        <h3 className="study-section-title">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-fg-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
