'use client'

import { useEffect, useLayoutEffect, useState } from 'react'

const links = [
  { href: '#imkoniyatlar', label: 'Imkoniyatlar' },
  { href: '#tariflar', label: 'Tariflar' },
  { href: '#savollar', label: 'Savollar' },
]

export default function Nav() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Sync with the real theme before the first paint, and only enable the
  // switch transition afterwards so it never animates on load.
  useLayoutEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const on = () => setScrolled(scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('theme', next)
    } catch {}
    setTheme(next)
    window.dispatchEvent(new Event('themechange'))
  }

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="wrap nav-in">
        <a href="#" className="nav-logo" aria-label="Zell">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Zell" />
        </a>
        <nav className="nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-right">
          <button className={`theme-switch${ready ? ' is-ready' : ''}`} data-mode={theme} onClick={toggle} aria-label="Mavzuni almashtirish">
            <span />
          </button>
          <button className="burger" onClick={() => setOpen(!open)} aria-label="Menyu" aria-expanded={open}>
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}
