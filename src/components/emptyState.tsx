export default function EmptyState({ title, body }: { title: string; body: string }) {
  return (
     <div className="rounded-lg border border-dashed border-stone px-6 py-16 text-center">
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}