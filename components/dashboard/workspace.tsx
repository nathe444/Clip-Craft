export function WorkspacePanel({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-medium tracking-[-0.03em]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--dash-muted)]">{body}</p>
      </div>
    </div>
  );
}
