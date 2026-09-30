'use client'

import { useEffect, useState } from 'react'
import { Menu, Moon, Sun, X } from 'lucide-react'

const links = [
  { href: '#imkoniyatlar', label: 'Imkoniyatlar' },
  { href: '#korinish', label: "Ko'rinish" },
  { href: '#tariflar', label: 'Tariflar' },
  { href: '#savollar', label: 'Savollar' },
]

export default function Nav() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light')
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
    <header className="nav">
      <div className="container nav-inner">
        <a href="#" className="nav-logo" aria-label="Cognilabs CRM">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Cognilabs" />
        </a>
        <nav className={`nav-links${open ? ' open' : ''}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" onClick={toggle} aria-label="Mavzuni almashtirish">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a href="#tariflar" className="btn btn-primary btn-sm nav-cta">
            Boshlash
          </a>
          <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label="Menyu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  )
}
