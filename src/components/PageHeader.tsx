export default function PageHeader({ title, lead }: { title: React.ReactNode; lead?: string }) {
  return (
    <header className="mx-auto max-w-7xl px-6 pb-12 pt-36 md:px-8 md:pb-20 md:pt-48">
      <h1 className="font-display max-w-5xl text-6xl leading-[0.95] tracking-[-0.03em] md:text-8xl">{title}</h1>
      {lead && <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">{lead}</p>}
    </header>
  )
}
