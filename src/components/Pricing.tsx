'use client'

import { useEffect, useRef, useState } from 'react'
import Btn from '@/components/Arrow'

/**
 * Plan picker: describe the business with two sliders and a few switches,
 * the smallest plan that covers it is chosen for you (or click one yourself).
 * The brand block slides to the chosen plan and its price counts over.
 */

type Need = 'loyalty' | 'ai' | 'api'
type Plan = {
  id: string
  name: string
  about: string
  monthly: number
  branches: number // Infinity = unlimited
  staff: number
  has: Need[]
  features: string[]
}

const PLANS: Plan[] = [
  {
    id: 'start',
    name: 'Start',
    about: "Bitta do'kon, bir-ikki xodim.",
    monthly: 199_000,
    branches: 1,
    staff: 2,
    has: [],
    features: ['1 ta filial', '2 tagacha xodim', 'Kassa (POS) va ombor', 'Asosiy hisobotlar', 'Email orqali yordam'],
  },
  {
    id: 'biznes',
    name: 'Biznes',
    about: "Bir nechta filial va jamoa bilan o'sayotgan savdo.",
    monthly: 499_000,
    branches: 5,
    staff: 15,
    has: ['loyalty'],
    features: ['5 tagacha filial', '15 tagacha xodim', 'Mijozlar va sodiqlik tizimi', 'Kengaytirilgan hisobotlar', 'Rollar va ruxsatlar', 'Ustuvor yordam'],
  },
  {
    id: 'premium',
    name: 'Premium',
    about: 'Tarmoq va franchayzalar uchun.',
    monthly: 999_000,
    branches: Infinity,
    staff: Infinity,
    has: ['loyalty', 'ai', 'api'],
    features: ['Cheksiz filial va xodim', 'AI yordamchi va prognoz', 'Integratsiya va API', 'Shaxsiy menejer', "Ma'lumotlarni ko'chirish", '24/7 yordam'],
  },
]

const NEEDS: { id: Need; label: string }[] = [
  { id: 'loyalty', label: 'Sodiqlik va ballar' },
  { id: 'ai', label: 'AI prognoz' },
  { id: 'api', label: 'Integratsiya / API' },
]

// Yearly billing: 2 months free. Placeholder policy — confirm before launch.
const YEAR_MONTHS = 10

const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU').replace(/ |,/g, ' ')

function useTween(value: number, ms = 650) {
  const [v, setV] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const a = from.current
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      setV(a + (value - a) * (1 - Math.pow(1 - t, 3)))
      if (t < 1) raf = requestAnimationFrame(step)
      else from.current = value
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return v
}

function PlanPrice({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  const perMonth = yearly ? (plan.monthly * YEAR_MONTHS) / 12 : plan.monthly
  const v = useTween(perMonth)
  return (
    <span className="pr-price">
      {fmt(Math.round(v / 1000) * 1000)}
      <small>so&apos;m / oy</small>
    </span>
  )
}

export default function Pricing() {
  const [branches, setBranches] = useState(3)
  const [staff, setStaff] = useState(8)
  const [needs, setNeeds] = useState<Need[]>(['loyalty'])
  const [yearly, setYearly] = useState(false)
  const [manual, setManual] = useState<string | null>(null)

  const fits = (p: Plan) => branches <= p.branches && staff <= p.staff && needs.every((n) => p.has.includes(n))
  const recommended = PLANS.find(fits) ?? PLANS[PLANS.length - 1]
  const active = PLANS.find((p) => p.id === manual) ?? recommended

  // the brand block slides between rows
  const list = useRef<HTMLDivElement>(null)
  const [hl, setHl] = useState({ top: 0, height: 0 })
  useEffect(() => {
    const measure = () => {
      const row = list.current?.querySelector<HTMLElement>(`[data-plan="${active.id}"]`)
      if (row) setHl({ top: row.offsetTop, height: row.offsetHeight })
    }
    measure()
    const ro = new ResizeObserver(measure)
    list.current && ro.observe(list.current)
    // rows grow while the open one animates; follow it for a moment
    const id = window.setInterval(measure, 60)
    const stop = window.setTimeout(() => clearInterval(id), 700)
    return () => {
      ro.disconnect()
      clearInterval(id)
      clearTimeout(stop)
    }
  }, [active.id, yearly])

  const touch = () => setManual(null)
  const toggleNeed = (n: Need) => {
    touch()
    setNeeds((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]))
  }

  const why = [
    `${branches} ta filial`,
    `${staff} ta xodim`,
    ...NEEDS.filter((n) => needs.includes(n.id)).map((n) => n.label),
  ]
  const yearTotal = active.monthly * YEAR_MONTHS

  return (
    <div className="pr">
      {/* ---------- configurator ---------- */}
      <div className="pr-form">
        <p className="pr-q">Biznesingiz qanday?</p>

        <label className="pr-slider">
          <span>
            Filiallar <b>{branches}</b>
          </span>
          <input
            type="range"
            min={1}
            max={20}
            value={branches}
            style={{ '--p': `${((branches - 1) / 19) * 100}%` } as React.CSSProperties}
            onChange={(e) => {
              touch()
              setBranches(+e.target.value)
            }}
          />
        </label>

        <label className="pr-slider">
          <span>
            Xodimlar <b>{staff}</b>
          </span>
          <input
            type="range"
            min={1}
            max={60}
            value={staff}
            style={{ '--p': `${((staff - 1) / 59) * 100}%` } as React.CSSProperties}
            onChange={(e) => {
              touch()
              setStaff(+e.target.value)
            }}
          />
        </label>

        <div className="pr-needs">
          <span>Kerak bo&apos;ladi</span>
          <div>
            {NEEDS.map((n) => (
              <button key={n.id} className={needs.includes(n.id) ? 'on' : ''} aria-pressed={needs.includes(n.id)} onClick={() => toggleNeed(n.id)}>
                {n.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pr-bill">
          <button className={!yearly ? 'on' : ''} onClick={() => setYearly(false)}>
            Oylik
          </button>
          <button className={yearly ? 'on' : ''} onClick={() => setYearly(true)}>
            Yillik <em>2 oy bepul</em>
          </button>
        </div>
      </div>

      {/* ---------- plans ---------- */}
      <div className="pr-list" ref={list}>
        <span className="pr-hl" style={{ transform: `translateY(${hl.top}px)`, height: hl.height }} aria-hidden="true" />
        {PLANS.map((p) => {
          const open = p.id === active.id
          return (
            <div key={p.id} data-plan={p.id} className={`pr-plan${open ? ' open' : ''}`}>
              <button className="pr-row" onClick={() => setManual(p.id)} aria-expanded={open}>
                <span className="pr-name">
                  {p.name}
                  {p.id === recommended.id && <em>Sizga mos</em>}
                </span>
                <PlanPrice plan={p} yearly={yearly} />
              </button>
              <div className="pr-body">
                <div className="pr-inner">
                  <p className="pr-about">{p.about}</p>
                  {p.id === recommended.id && (
                    <div className="pr-why">
                      {why.map((w) => (
                        <span key={w}>✓ {w}</span>
                      ))}
                    </div>
                  )}
                  <ul>
                    {p.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <div className="pr-foot">
                    <Btn href="#" tone="ink">
                      {p.name} ni tanlash
                    </Btn>
                    {yearly && <small>Yiliga {fmt(p.monthly * YEAR_MONTHS)} so&apos;m</small>}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <p className="pr-note">
          {manual && manual !== recommended.id
            ? `Siz ${active.name} ni tanladingiz. Kiritilganlarga ${recommended.name} yetadi.`
            : yearly
              ? `${active.name}: yiliga ${fmt(yearTotal)} so'm — 12 oy o'rniga 10 oy to'laysiz.`
              : '14 kun bepul. Karta so‘ralmaydi, istalgan vaqt tarifni almashtirasiz.'}
        </p>
      </div>
    </div>
  )
}
