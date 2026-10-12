'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AsYouType, getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'

/**
 * Phone input with a country picker. Digits are formatted as you type for the
 * chosen country; `onChange` reports the E.164 number (or '' while invalid).
 */

const TOP: CountryCode[] = ['UZ', 'RU', 'KZ', 'KG', 'TJ', 'TM', 'AZ', 'TR', 'UA', 'US']
const KEY = 'zell-phone'
const flag = (c: string) => String.fromCodePoint(...[...c].map((ch) => 0x1f1a5 + ch.charCodeAt(0)))

type Item = { code: CountryCode; name: string; dial: string }

export default function PhoneField({ onChange }: { onChange: (e164: string) => void }) {
  const [country, setCountry] = useState<CountryCode>('UZ')
  const [national, setNational] = useState('')
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const box = useRef<HTMLDivElement>(null)

  const items = useMemo<Item[]>(() => {
    const names = new Intl.DisplayNames(['uz', 'en'], { type: 'region' })
    const all = getCountries().map((code) => ({ code, name: names.of(code) ?? code, dial: getCountryCallingCode(code) }))
    const rest = all.filter((i) => !TOP.includes(i.code)).sort((a, b) => a.name.localeCompare(b.name))
    return [...TOP.map((c) => all.find((i) => i.code === c)!), ...rest]
  }, [])
  const current = items.find((i) => i.code === country)!
  const shown = q.trim() ? items.filter((i) => (i.name + ' +' + i.dial).toLowerCase().includes(q.trim().toLowerCase())) : items

  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  const report = (c: CountryCode, text: string) => {
    const p = parsePhoneNumberFromString(text, c)
    onChange(p?.isValid() ? p.number : '')
    try {
      localStorage.setItem(KEY, JSON.stringify({ country: c, national: text }))
    } catch {}
  }

  // Take what the user typed last time.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null')
      if (saved?.country && getCountries().includes(saved.country) && typeof saved.national === 'string') {
        setCountry(saved.country)
        setNational(saved.national)
        const p = parsePhoneNumberFromString(saved.national, saved.country)
        onChange(p?.isValid() ? p.number : '')
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Typed, pasted or autofilled. A full "+998 90 …" number switches the country by itself.
  const input = (raw: string) => {
    let c = country
    let text = raw
    if (raw.trim().startsWith('+')) {
      const p = parsePhoneNumberFromString(raw)
      if (p?.country) {
        c = p.country
        text = p.nationalNumber
        setCountry(c)
      }
    }
    text = new AsYouType(c).input(text.replace(/[^\d\s()-]/g, ''))
    setNational(text)
    report(c, text)
  }

  return (
    <div className="fc-phone" ref={box}>
      <button type="button" className="fc-cc" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span aria-hidden="true">{flag(country)}</span>+{current.dial}
        <i aria-hidden="true">▾</i>
      </button>
      <input
        className="fc-field"
        type="tel"
        inputMode="tel"
        value={national}
        name="tel"
        maxLength={30}
        placeholder="90 123 45 67"
        aria-label="Telefon raqamingiz"
        autoComplete="tel"
        onChange={(e) => input(e.target.value)}
      />
      {open && (
        <div className="fc-cc-list" role="listbox">
          <input autoFocus className="fc-cc-q" value={q} placeholder="Davlatni qidiring" onChange={(e) => setQ(e.target.value)} />
          <ul>
            {shown.map((i) => (
              <li key={i.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i.code === country}
                  onClick={() => {
                    setCountry(i.code)
                    setOpen(false)
                    setQ('')
                    const text = new AsYouType(i.code).input(national)
                    setNational(text)
                    report(i.code, text)
                  }}
                >
                  <span aria-hidden="true">{flag(i.code)}</span>
                  {i.name}
                  <b>+{i.dial}</b>
                </button>
              </li>
            ))}
            {shown.length === 0 && <li className="fc-cc-empty">Topilmadi</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
