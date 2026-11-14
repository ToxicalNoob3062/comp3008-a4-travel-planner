import Image from "next/image";

export default function AppBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2.5 sm:h-16 sm:gap-3 border-b border-[#e4e4e7] bg-white px-4 sm:px-8">
      <Image src="/img/logo-ring.svg" alt="" width={36} height={36} priority className="size-8 sm:size-9" />
      <p className="text-lg whitespace-nowrap sm:text-xl">
        <span className="font-bold text-brand">OC Transpo</span>
        <span aria-hidden="true" className="text-ink">{"  |  "}</span>
        <span className="font-semibold text-ink">Travel Planner</span>
      </p>
    </header>
  );
}
