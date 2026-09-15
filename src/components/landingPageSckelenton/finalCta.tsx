import Link from "next/link";
import Image from "next/image";

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-moss">
      <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/5 blur-3xl sm:h-72 sm:w-72" />

      <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl sm:h-80 sm:w-80" />

      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto flex h-15 w-35 items-center justify-center rounded-xl bg-white text-lg text-white sm:h-20 sm:w-40 sm:text-xl">
            <Image src="/logo.png" alt="Topzy logo" width={140} height={30} />
          
        </div>

        <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:mt-6 sm:text-4xl">
          Give your clients a better way to book.
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/75 sm:mt-4 sm:text-[15px] sm:leading-7">
          Create your booking page, share the link, and let Topzy booking software handle the
          scheduling while you focus on your business.
        </p>

        <div className="mt-7">
          <Link
            href="/signup"
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-moss-dark shadow-sm transition hover:bg-stone-soft"
          >
            Start taking bookings
            <ArrowRightIcon />
          </Link>
        </div>

        <p className="mt-4 font-mono text-[9px] uppercase tracking-wider text-white/50 sm:text-[10px]">
          No credit card required
        </p>
      </div>
    </section>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}