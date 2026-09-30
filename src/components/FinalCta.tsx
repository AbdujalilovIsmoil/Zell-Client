'use client'

import { useEffect, useRef, useState } from 'react'
import Btn from '@/components/Arrow'

/**
 * Closing CTA: type your shop's name, pick what you sell, and a paper receipt
 * with your name on it is set up live. "Birinchi chekni chiqarish" prints it
 * line by line and stamps it; the main button then carries your shop's name.
 */

type Kind = { id: string; label: string; items: [string, number][] }

const KINDS: Kind[] = [
  { id: 'food', label: 'Oziq-ovqat', items: [['Non (tandir)', 5_000], ['Sut 1 L', 13_500], ['Choy Ahmad', 32_000]] },
  { id: 'clothes', label: 'Kiyim', items: [['Futbolka, paxta', 149_000], ['Jinsi shim', 320_000]] },
  { id: 'tech', label: 'Elektronika', items: [['Quloqchin, simsiz', 290_000], ['Zaryadlovchi 20W', 85_000]] },
  { id: 'pharmacy', label: 'Dorixona', items: [['Paratsetamol', 12_000], ['Vitamin C', 45_000], ['Niqob, 10 dona', 15_000]] },
  { id: 'cafe', label: 'Kafe', items: [['Osh, 1 porsiya', 38_000], ['Choy, choynak', 8_000], ['Non', 4_000]] },
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
  const [time, setTime] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => setTime(today()), [])

  const shop = name.trim() || "Do'koningiz"
  const total = kind.items.reduce((s, [, p]) => s + p, 0)

  const reset = () => {
    setPrinted(false)
    setPrinting(false)
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
      <div className="fc-left">
        <span className="fc-eyebrow">Bir daqiqada boshlang</span>
        <label className="fc-ask" htmlFor="shop-name">
          Do&apos;koningiz nomi <em>nima?</em>
        </label>
        <input
          id="shop-name"
          ref={input}
          className="fc-name"
          value={name}
          maxLength={24}
          placeholder="Masalan, Baraka Market"
          autoComplete="off"
          onChange={(e) => {
            setName(e.target.value)
            reset()
          }}
        />
        <div className="fc-kinds" role="radiogroup" aria-label="Nima sotasiz">
          {KINDS.map((k) => (
            <button
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
        <div className="fc-actions">
          <Btn href="#tariflar" tone="ink">
            {name.trim() ? `«${shop}» ni 14 kun bepul ochish` : '14 kun bepul boshlash'}
          </Btn>
          <span>Karta so&apos;ralmaydi</span>
        </div>
      </div>

      <div className="fc-right">
        <div className="fc-printer">
          <span className="fc-slot" />
          <button className="fc-print" onClick={print} disabled={printing}>
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
