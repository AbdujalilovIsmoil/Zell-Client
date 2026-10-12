'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AsYouType, getCountries, getCountryCallingCode, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'

/**
 * Phone input with a country picker. Digits are formatted as you type for the
 * chosen country; `onChange` reports the E.164 number (or '' while invalid).
 */

const TOP: CountryCode[] = ['UZ', 'RU', 'KZ', 'KG', 'TJ', 'TM', 'AZ', 'TR', 'UA', 'US']
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
        maxLength={20}
        placeholder="90 123 45 67"
        aria-label="Telefon raqamingiz"
        autoComplete="tel-national"
        onChange={(e) => {
          const text = new AsYouType(country).input(e.target.value.replace(/[^\d\s()-]/g, ''))
          setNational(text)
          report(country, text)
        }}
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
