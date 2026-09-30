'use client'

import { useEffect, useState } from 'react'

const links = [
  { href: '#imkoniyatlar', label: 'Imkoniyatlar' },
  { href: '#tariflar', label: 'Tariflar' },
  { href: '#savollar', label: 'Savollar' },
]

export default function Nav() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
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
          <button className="theme-switch" onClick={toggle} aria-label="Mavzuni almashtirish" data-mode={theme}>
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
