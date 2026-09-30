'use client'

import { useEffect, useState } from 'react'

/**
 * Guided tour over real CRM screenshots. Numbered spots sit on the actual UI;
 * picking one (dot or list) zooms the screenshot into that spot and explains
 * it. Progress counts what's been seen across all three screens.
 */

type Spot = { x: number; y: number; title: string; text: string } // x,y in % of the screenshot
type Screen = { id: string; label: string; shot: string; spots: Spot[] }

const SCREENS: Screen[] = [
  {
    id: 'pos',
    label: 'Kassa',
    shot: 'pos',
    spots: [
      { x: 27, y: 10.3, title: 'Skanerlang yoki yozing', text: 'Shtrix-kodni skanerlang yoki nomining bir qismini yozing — tovar darhol topiladi.' },
      { x: 10, y: 23, title: 'Bir bosishda savatga', text: "Tovar kartasini bosing — u savatga tushadi. Narx va qoldiq kartaning o'zida." },
      { x: 34.5, y: 29.6, title: 'Qoldiq ko‘z oldida', text: "“3 dona qoldi” — kassir omborga borib so'ramaydi, sotishdan oldin ko'radi." },
      { x: 83, y: 12.4, title: 'Mijozni biriktiring', text: "Telefon raqami bilan mijozni tanlang — ball o'zi yoziladi, chegirma o'zi qo'llanadi." },
      { x: 90, y: 90.7, title: 'F4 — to‘lash', text: "Naqd, karta yoki aralash to'lov. Klaviatura bilan ham ishlaydi: F2 qidiruv, F4 to'lash." },
    ],
  },
  {
    id: 'products',
    label: 'Tovarlar',
    shot: 'products',
    spots: [
      { x: 59.9, y: 21, title: 'Skanerlab qo‘shish', text: "Yangi tovarni shtrix-kodidan qo'shing — nom va kodni qo'lda terish shart emas." },
      { x: 44.6, y: 21, title: 'Excel’dan yuklash', text: "Butun narxnomani bitta fayl bilan yuklang. Yuzlab tovar bir necha soniyada." },
      { x: 40, y: 27.9, title: 'Tez qidiruv', text: "Nomi yoki SKU bo'yicha qidiring, kategoriya va holat bo'yicha saralang." },
      { x: 86.3, y: 42.2, title: 'Narx va holat', text: "Narxni shu yerda o'zgartirasiz — kassada darhol yangilanadi." },
    ],
  },
  {
    id: 'reports',
    label: 'Hisobot',
    shot: 'reports',
    spots: [
      { x: 22.7, y: 20.6, title: 'Bir sahifada hammasi', text: "Savdo, mahsulot, mijoz, sotuvchi va yetkazib beruvchi — tab bilan almashtirasiz." },
      { x: 40.7, y: 29.8, title: 'Davrni tanlang', text: "Kun, hafta yoki oy — istalgan oraliqni tanlang, filial bo'yicha ajrating." },
      { x: 94.5, y: 62.3, title: 'Eng yaxshi kun', text: "29-sentabr: 81,9 mln so'm. Qaysi kun kuchli ekanini bir qarashda ko'rasiz." },
      { x: 91.5, y: 13.5, title: 'Buxgalterga yuboring', text: "Excel yoki CSV ga eksport — bir tugma bilan." },
    ],
  },
]

const ZOOM = 2.1
const TOTAL = SCREENS.reduce((n, s) => n + s.spots.length, 0)
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export default function Tour() {
  const [si, setSi] = useState(0)
  const [step, setStep] = useState<number | null>(null)
  const [seen, setSeen] = useState<Set<string>>(new Set())

  const screen = SCREENS[si]
  const spot = step === null ? null : screen.spots[step]

  useEffect(() => {
    if (step === null) return
    setSeen((s) => new Set(s).add(`${screen.id}:${step}`))
  }, [step, screen.id])

  const go = (i: number | null) => setStep(i)
  const next = () => {
    if (step === null) return go(0)
    if (step < screen.spots.length - 1) return go(step + 1)
    if (si < SCREENS.length - 1) {
      setSi(si + 1)
      setStep(0)
    } else go(null)
  }
  const prev = () => {
    if (step === null || step === 0) return go(null)
    go(step - 1)
  }

  // zoom so the spot sits in the middle, without showing past the image edges
  const s = spot ? ZOOM : 1
  const tx = spot ? clamp(50 - s * spot.x, 100 - 100 * s, 0) : 0
  const ty = spot ? clamp(50 - s * spot.y, 100 - 100 * s, 0) : 0
  const done = seen.size
  const allDone = done === TOTAL

  return (
    <div className="tr">
      <div className="tr-side">
        <div className="tr-tabs" role="tablist">
          {SCREENS.map((sc, i) => (
            <button
              key={sc.id}
              role="tab"
              aria-selected={i === si}
              className={i === si ? 'on' : ''}
              onClick={() => {
                setSi(i)
                setStep(null)
              }}
            >
              {sc.label}
              <small>
                {sc.spots.filter((_, j) => seen.has(`${sc.id}:${j}`)).length}/{sc.spots.length}
              </small>
            </button>
          ))}
        </div>

        <ol className="tr-steps">
          {screen.spots.map((sp, i) => (
            <li key={sp.title} className={`${step === i ? 'on' : ''}${seen.has(`${screen.id}:${i}`) ? ' seen' : ''}`}>
              <button onClick={() => go(step === i ? null : i)}>
                <span className="tr-num">{seen.has(`${screen.id}:${i}`) && step !== i ? '✓' : i + 1}</span>
                <span className="tr-title">{sp.title}</span>
              </button>
              <div className="tr-text">
                <p>{sp.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="tr-nav">
          <button onClick={prev} disabled={step === null}>
            ← Orqaga
          </button>
          <button className="tr-next" onClick={next}>
            {step === null ? 'Boshlash' : step === screen.spots.length - 1 && si === SCREENS.length - 1 ? 'Tugatish' : 'Keyingi →'}
          </button>
        </div>

        <div className="tr-progress">
          <span>
            {allDone ? 'Tayyor — kassir birinchi kuniga tayyor.' : `O'rganildi: ${done} / ${TOTAL}`}
          </span>
          <i>
            <b style={{ width: `${(done / TOTAL) * 100}%` }} />
          </i>
        </div>
      </div>

      <div className={`tr-stage${spot ? ' zoomed' : ''}`}>
        <div className="tr-canvas" style={{ transform: `translate(${tx}%, ${ty}%) scale(${s})`, '--s': s } as React.CSSProperties}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="only-light" src={`/shots/${screen.shot}-light.png`} alt={`${screen.label} sahifasi`} key={`l-${screen.id}`} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="only-dark" src={`/shots/${screen.shot}-dark.png`} alt="" key={`d-${screen.id}`} />
          {screen.spots.map((sp, i) => (
            <button
              key={`${screen.id}-${i}`}
              className={`tr-dot${step === i ? ' on' : ''}${seen.has(`${screen.id}:${i}`) ? ' seen' : ''}`}
              style={{ left: `${sp.x}%`, top: `${sp.y}%` }}
              onClick={() => go(step === i ? null : i)}
              aria-label={sp.title}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {spot ? (
          <div className="tr-card" key={`${screen.id}-${step}`}>
            <small>
              {screen.label} · {step! + 1}/{screen.spots.length}
            </small>
            <b>{spot.title}</b>
            <p>{spot.text}</p>
            <button onClick={() => go(null)}>Umumiy ko&apos;rinish</button>
          </div>
        ) : (
          <div className="tr-hint">Raqamli nuqtani bosing</div>
        )}
      </div>
    </div>
  )
}
