export default function SectionCard({
  title,
  description,
  children,
  rightAction,
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h5 className="text-md font-semibold">{title}</h5>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>

      {children}
    </div>
  );
}
