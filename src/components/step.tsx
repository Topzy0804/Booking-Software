export default function Step({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="text-left">
      <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full border border-gold font-mono text-xs font-semibold text-gold">
        {number}
      </div>
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}