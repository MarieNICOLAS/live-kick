type SimplePageProps = {
  title: string
  eyebrow: string
  message: string
}

export function SimplePage({ title, eyebrow, message }: SimplePageProps) {
  return (
    <section className="page-section">
      <div className="page-heading">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
    </section>
  )
}
