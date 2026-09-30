/** Button with a round arrow chip that turns on hover. */
export default function Btn({ href, children, tone = 'ink' }: { href: string; children: React.ReactNode; tone?: 'ink' | 'brand' | 'paper' }) {
  return (
    <a href={href} className={`btn btn-${tone}`}>
      <span className="btn-label">{children}</span>
      <span className="btn-chip" aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 7h11M8 2.5 12.5 7 8 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  )
}
