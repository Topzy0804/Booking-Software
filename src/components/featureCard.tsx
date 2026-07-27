export default function FeatureCard({
  tag,
  title,
  body,
}: {
  tag: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-stone bg-paper-raised p-6 text-left shadow-sm">
      <span className="font-mono text-[10px] font-medium uppercase tracking-wide text-moss">
        {tag}
      </span>
      <h3 className="mt-2 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}