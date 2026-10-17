'use client'

import { useEffect, useRef, useState } from 'react'
import PhoneField from '@/components/PhoneField'
import { rememberUtm, sendLead } from '@/lib/lead'

/**
 * Closing CTA: type your shop's name, pick what you sell, and a paper receipt
 * with your name on it is set up live. "Birinchi chekni chiqarish" prints it
 * line by line and stamps it; the main button then carries your shop's name.
 */

const KEY = 'zell-lead'

type Kind = { id: string; label: string; items: [string, number][] }

const KINDS: Kind[] = [
  { id: 'food', label: 'Oziq-ovqat', items: [['Non (tandir)', 5_000], ['Sut 1 L', 13_500], ['Choy Ahmad', 32_000]] },
  { id: 'clothes', label: 'Kiyim', items: [['Futbolka, paxta', 149_000], ['Jinsi shim', 320_000]] },
  { id: 'tech', label: 'Elektronika', items: [['Quloqchin, simsiz', 290_000], ['Zaryadlovchi 20W', 85_000]] },
  { id: 'pharmacy', label: 'Dorixona', items: [['Paratsetamol', 12_000], ['Vitamin C', 45_000], ['Niqob, 10 dona', 15_000]] },
  { id: 'cafe', label: 'Kafe', items: [['Osh, 1 porsiya', 38_000], ['Choy, choynak', 8_000], ['Non', 4_000]] },
  { id: 'other', label: 'Boshqa', items: [['Xizmat / mahsulot', 100_000], ['Qo\'shimcha xizmat', 50_000]] },
]

const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/ |,/g, ' ')
const today = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function FinalCta() {
  const [name, setName] = useState('')
  const [kind, setKind] = useState(KINDS[0])
  const [printing, setPrinting] = useState(false)
  const [printed, setPrinted] = useState(false)
  const [stamp, setStamp] = useState(0)
  const [owner, setOwner] = useState('')
  const [phone, setPhone] = useState('')
  const [custom, setCustom] = useState('')
  const [restored, setRestored] = useState(false)
  const [phoneKey, setPhoneKey] = useState(0)
  const [sending, setSending] = useState(false)
  const [website, setWebsite] = useState('')
  const [toast, setToast] = useState<{ ok: boolean; text: string; id: number } | null>(null)
  const [time, setTime] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => setTime(today()), [])
  useEffect(rememberUtm, [])

  // Remember what was typed last time (phone remembers itself).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null')
      if (!saved) return
      if (typeof saved.name === 'string') setName(saved.name)
      if (typeof saved.owner === 'string') setOwner(saved.owner)
      if (typeof saved.custom === 'string') setCustom(saved.custom)
      const k = KINDS.find((x) => x.id === saved.kind)
      if (k) setKind(k)
    } catch {} finally {
      setRestored(true)
    }
  }, [])
  useEffect(() => {
    if (!restored) return
    try {
      localStorage.setItem(KEY, JSON.stringify({ name, owner, custom, kind: kind.id }))
    } catch {}
  }, [restored, name, owner, custom, kind])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 5000)
    return () => window.clearTimeout(t)
  }, [toast])

  const shop = name.trim() || "Do'koningiz"
  const other = kind.id === 'other'
  const categoryName = other ? custom.trim() : kind.label
  const valid = name.trim() && owner.trim() && phone && categoryName
  const total = kind.items.reduce((s, [, p]) => s + p, 0)

  const reset = () => {
    setPrinted(false)
    setPrinting(false)
  }

  // After a successful send: empty every field and forget what was remembered.
  const clearForm = () => {
    try {
      localStorage.removeItem(KEY)
      localStorage.removeItem('zell-phone')
    } catch {}
    setName('')
    setOwner('')
    setCustom('')
    setKind(KINDS[0])
    setPhone('')
    setPhoneKey((k) => k + 1)
    reset()
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || sending) return
    setSending(true)
    const res = await sendLead({ shop: name.trim(), owner: owner.trim(), phone, category: categoryName, website })
    setSending(false)
    if (res.ok) clearForm()
    setToast(
      res.ok
        ? { ok: true, text: "Rahmat! Tez orada siz bilan bog'lanamiz.", id: Date.now() }
        : { ok: false, text: res.reason, id: Date.now() },
    )
  }

  const print = () => {
    setTime(today())
    setPrinted(false)
    setPrinting(true)
    setStamp((s) => s + 1)
    window.setTimeout(() => {
      setPrinting(false)
      setPrinted(true)
    }, 1500)
  }

  return (
    <div className="fc">
      <form className="fc-left" onSubmit={submit} noValidate>
        <span className="fc-eyebrow">Bir daqiqada boshlang</span>
        <label className="fc-ask" htmlFor="shop-name">
          Do&apos;koningiz nomi <em>nima?</em>
        </label>
        <input
          id="shop-name"
          name="organization"
          ref={input}
          className="fc-name"
          value={name}
          maxLength={24}
          placeholder="Masalan, Baraka Market"
          autoComplete="organization"
          onChange={(e) => {
            setName(e.target.value)
            reset()
          }}
        />
        <div className="fc-kinds" role="radiogroup" aria-label="Nima sotasiz">
          {KINDS.map((k) => (
            <button
              type="button"
              key={k.id}
              role="radio"
              aria-checked={kind.id === k.id}
              className={kind.id === k.id ? 'on' : ''}
              onClick={() => {
                setKind(k)
                reset()
              }}
            >
              {k.label}
            </button>
          ))}
        </div>
        {other && (
          <input
            className="fc-field"
            value={custom}
            maxLength={40}
            placeholder="Xizmat yoki mahsulot nomi"
            aria-label="Xizmat nomi"
            autoComplete="off"
            onChange={(e) => setCustom(e.target.value)}
          />
        )}
        <div className="fc-fields">
          <input
            className="fc-field"
            value={owner}
            maxLength={40}
            placeholder="Ismingiz"
            aria-label="Ismingiz"
            name="name"
            autoComplete="name"
            onChange={(e) => setOwner(e.target.value)}
          />
          <PhoneField key={phoneKey} onChange={setPhone} />
        </div>
        {/* Honeypot: off-screen (not display:none) so bots still fill it; people never see it. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{ position: 'absolute', left: -9999 }}
        />
        <div className="fc-actions">
          <button type="submit" className="btn btn-ink" disabled={!valid || sending}>
            <span className="btn-label">{sending ? 'Yuborilmoqda…' : "Ma'lumot olish"}</span>
            <span className="btn-chip" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h11M8 2.5 12.5 7 8 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
          <span>Bepul. Karta so&apos;ralmaydi</span>
        </div>
      </form>
      {toast && (
        <div key={toast.id} className={`fc-toast ${toast.ok ? 'ok' : 'err'}`} role={toast.ok ? 'status' : 'alert'} onClick={() => setToast(null)}>
          <span aria-hidden="true">{toast.ok ? '✓' : '!'}</span>
          {toast.text}
        </div>
      )}

      <div className="fc-right">
        <div className="fc-printer">
          <span className="fc-slot" />
          <button type="button" className="fc-print" onClick={print} disabled={printing}>
            {printing ? 'Chiqarilmoqda…' : printed ? 'Yana bittasini chiqarish' : 'Birinchi chekni chiqarish'}
          </button>
        </div>
        <div className={`fc-paper${printing ? ' is-printing' : ''}${printed ? ' is-printed' : ''}`} key={stamp}>
          <div className="fc-shop">{shop}</div>
          <div className="fc-sub">
            {kind.label} · Kassa 1
            <br />
            Chek № 000001 · {time}
          </div>
          <div className="fc-rule" />
          {kind.items.map(([n, p], i) => (
            <div className="fc-row" key={n} style={{ animationDelay: `${0.25 + i * 0.18}s` }}>
              <span>{n}</span>
              <b>{fmt(p)}</b>
            </div>
          ))}
          <div className="fc-rule" />
          <div className="fc-total" style={{ animationDelay: `${0.3 + kind.items.length * 0.18}s` }}>
            <span>JAMI</span>
            <b>{fmt(total)} so&apos;m</b>
          </div>
          <div className="fc-bars" aria-hidden="true">
            {Array.from({ length: 38 }, (_, i) => (
              <i key={i} style={{ width: 1 + ((i * 7 + shop.length) % 4) }} />
            ))}
          </div>
          <div className="fc-thanks">Xaridingiz uchun rahmat!</div>
          {printed && <span className="fc-stamp">✓ Birinchi sotuv</span>}
        </div>
      </div>
    </div>
  )
}
