'use client'

import { useEffect, useRef, useState } from 'react'
import Btn from '@/components/Arrow'

/**
 * Pricing as a receipt: pick branches, staff and modules on the left and the
 * bill prints itself on the right, line by line. A few presets fill it in for you.
 *
 * Placeholder prices — confirm before launch.
 */

type ModId = 'loyalty' | 'ai' | 'api' | 'manager'
type Mod = { id: ModId; name: string; about: string; price: number }

const BASE = 199_000 // per branch: kassa + ombor + hisobotlar
const STAFF_FREE = 3 // staff included per branch
const STAFF_EXTRA = 15_000 // per extra staff member
const YEAR_MONTHS = 10 // yearly billing: 2 months free

const MODS: Mod[] = [
  {
    id: 'loyalty',
    name: 'Sodiqlik va ballar',
    about: 'Mijoz kartasi, ball, chegirma',
    price: 99_000,
  },
  {
    id: 'ai',
    name: 'AI prognoz',
    about: 'Qoldiq va savdo bashorati',
    price: 249_000,
  },
  {
    id: 'api',
    name: 'Integratsiya / API',
    about: 'Boshqa tizimlar bilan ulash',
    price: 199_000,
  },
  {
    id: 'manager',
    name: 'Shaxsiy menejer',
    about: "24/7 yordam, ma'lumot ko'chirish",
    price: 149_000,
  },
]

type PlanCard = {
  id: string
  name: string
  about: string
  branches: number
  staff: number
  mods: ModId[]
  features: string[]
  hot?: boolean
  free?: boolean
}
const PLANS: PlanCard[] = [
  {
    id: 'biznes',
    name: 'Biznes',
    free: true,
    about: "Bitta do'kon, bir-ikki xodim.",
    branches: 1,
    staff: 3,
    mods: [],
    features: ['1 ta filial', '3 tagacha xodim', 'Kassa (POS) va ombor', 'Asosiy hisobotlar'],
  },
  {
    id: 'premium',
    name: 'Premium',
    about: "Bir nechta filial bilan o'sayotgan savdo.",
    branches: 3,
    staff: 9,
    mods: ['loyalty'],
    features: ['3 ta filial', '9 tagacha xodim', 'Kassa (POS) va ombor', 'Kengaytirilgan hisobotlar', 'Rollar va ruxsatlar'],
    hot: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    about: 'Tarmoq va franchayzalar uchun.',
    branches: 8,
    staff: 30,
    mods: ['loyalty', 'ai', 'api', 'manager'],
    features: ['8 va undan ko‘p filial', 'Cheksiz xodim', 'Kassa (POS) va ombor', 'Barcha hisobotlar', 'Rollar va ruxsatlar'],
  },
]

function priceOf(branches: number, staff: number, mods: ModId[]) {
  const extra = Math.max(0, staff - STAFF_FREE * branches)
  return branches * BASE + extra * STAFF_EXTRA + MODS.filter((m) => mods.includes(m.id)).reduce((s, m) => s + m.price, 0)
}

const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU').replace(/ |,/g, ' ')

function useTween(value: number, ms = 600) {
  const [v, setV] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const a = from.current
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      const next = a + (value - a) * (1 - Math.pow(1 - t, 3))
      setV(next)
      from.current = next
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return v
}

function PlanCardView({ plan, yearly, active, onPick }: { plan: PlanCard; yearly: boolean; active: boolean; onPick: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const monthly = plan.free ? 0 : priceOf(plan.branches, plan.staff, plan.mods)
  const shown = useTween(yearly ? (monthly * YEAR_MONTHS) / 12 : monthly)

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || e.pointerType === 'touch') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
    el.style.setProperty('--rx', `${(0.5 - y) * 8}deg`)
    el.style.setProperty('--ry', `${(x - 0.5) * 10}deg`)
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--mx', '50%')
    el.style.setProperty('--my', '0%')
  }

  return (
    <div className={`pc${plan.hot ? ' hot' : ''}${active ? ' active' : ''}`} ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="pc-glow" aria-hidden="true" />
      <div className="pc-in">
        {plan.hot && <span className="pc-tag">Eng ko‘p tanlanadi</span>}
        <div className="pc-dots" aria-hidden="true">
          {Array.from({ length: plan.id === 'enterprise' ? 12 : plan.branches }, (_, i) => (
            <i key={i} style={{ transitionDelay: `${i * 35}ms` }} className={plan.id === 'enterprise' && i >= 8 ? 'ext' : ''} />
          ))}
        </div>
        <h3>{plan.name}</h3>
        <p className="pc-about">{plan.about}</p>

        <div className="pc-price">
          {!plan.free && <span>dan</span>}
          <b>{fmt(Math.round(shown / 1000) * 1000)}</b>
          <small>so&apos;m / oy</small>
        </div>
        <p className="pc-year">{yearly ? `Yiliga ${fmt(monthly * YEAR_MONTHS)} so'm` : '\u00a0'}</p>

        <ul className="pc-feat">
          {plan.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <div className="pc-mods">
          {MODS.map((m) => (
            <span key={m.id} className={plan.mods.includes(m.id) ? 'on' : ''}>
              {m.name}
            </span>
          ))}
        </div>

        <button className="pc-btn" onClick={onPick}>
          {active ? 'Chekda ✓' : 'Chekda ko‘rish'}
          <span aria-hidden="true">↓</span>
        </button>
      </div>
    </div>
  )
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  hint: string
  value: number
  min: number
  max: number
  onChange: (n: number) => void
}) {
  return (
    <div className="pr-step">
      <div>
        <span>{label}</span>
        <small>{hint}</small>
      </div>
      <div className="pr-ctl">
        <button aria-label={`${label}: kamaytirish`} disabled={value <= min} onClick={() => onChange(value - 1)}>
          −
        </button>
        <b>{value}</b>
        <button aria-label={`${label}: ko'paytirish`} disabled={value >= max} onClick={() => onChange(value + 1)}>
          +
        </button>
      </div>
    </div>
  )
}

export default function Pricing() {
  const [branches, setBranches] = useState(3)
  const [staff, setStaff] = useState(8)
  const [mods, setMods] = useState<ModId[]>(['loyalty'])
  const [yearly, setYearly] = useState(false)
  const paper = useRef<HTMLDivElement>(null)

  const preset = PLANS.findIndex((p) => p.branches === branches && p.staff === staff && p.mods.length === mods.length && p.mods.every((m) => mods.includes(m)))
  const freePlan = preset >= 0 && PLANS[preset].free
  const extra = Math.max(0, staff - STAFF_FREE * branches)
  const lines = [
    {
      key: 'base',
      name: 'Kassa, ombor, hisobot',
      qty: `${branches} filial × ${fmt(BASE)}`,
      sum: branches * BASE,
    },
    extra > 0
      ? {
          key: 'staff',
          name: "Qo'shimcha xodim",
          qty: `${extra} × ${fmt(STAFF_EXTRA)}`,
          sum: extra * STAFF_EXTRA,
        }
      : { key: 'staff', name: 'Xodimlar', qty: `${staff} ta`, sum: 0 },
    ...MODS.filter((m) => mods.includes(m.id)).map((m) => ({
      key: m.id,
      name: m.name,
      qty: '',
      sum: m.price,
    })),
  ]
  if (freePlan) lines.push({ key: 'free', name: `${PLANS[preset].name} tarifi`, qty: 'bepul', sum: -lines.reduce((t, l) => t + l.sum, 0) })
  const monthly = lines.reduce((s, l) => s + l.sum, 0)
  const total = yearly ? monthly * YEAR_MONTHS : monthly
  const shown = useTween(total)

  const applyPreset = (i: number) => {
    const p = PLANS[i]
    setBranches(p.branches)
    setStaff(p.staff)
    setMods(p.mods)
    paper.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  const toggle = (id: ModId) => setMods((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

  return (
    <>
      <div className="pc-row">
        {PLANS.map((p, i) => (
          <PlanCardView key={p.id} plan={p} yearly={yearly} active={preset === i} onPick={() => applyPreset(i)} />
        ))}
      </div>

      <div className="pr">
        {/* ---------- controls ---------- */}
        <div className="pr-form">
          <p className="pr-q">Yoki chekni o&apos;zingiz yig&apos;ing</p>
          <Stepper label="Filiallar" hint="Har biri alohida kassa va ombor" value={branches} min={1} max={50} onChange={setBranches} />
          <Stepper label="Xodimlar" hint={`Har filialga ${STAFF_FREE} tasi kiradi`} value={staff} min={1} max={200} onChange={setStaff} />

          <div className="pr-mods">
            {MODS.map((m) => {
              const on = mods.includes(m.id)
              return (
                <button key={m.id} className={on ? 'on' : ''} aria-pressed={on} onClick={() => toggle(m.id)}>
                  <span className="pr-sw" aria-hidden="true" />
                  <span className="pr-mod-t">
                    {m.name}
                    <small>{m.about}</small>
                  </span>
                  <span className="pr-mod-p">+{fmt(m.price)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ---------- receipt ---------- */}
        <div className="pr-paper-wrap" ref={paper}>
          <div className="pr-paper" aria-live="polite">
            <header className="pr-ph">
              <strong>ZELL</strong>
              <span>Tarif cheki</span>
            </header>

            <ul className="pr-lines">
              {lines.map((l) => (
                <li key={l.key}>
                  <span className="pr-ln">
                    {l.name}
                    {l.qty && <small>{l.qty}</small>}
                  </span>
                  <span className="pr-dots" aria-hidden="true" />
                  <span className="pr-ls">{l.sum ? fmt(l.sum) : 'kiritilgan'}</span>
                </li>
              ))}
            </ul>

            <div className="pr-sub">
              <span>Oylik</span>
              <span>{fmt(monthly)}</span>
            </div>
            {yearly && (
              <div className="pr-sub save">
                <span>12 oy o&apos;rniga 10 oy</span>
                <span>−{fmt(monthly * (12 - YEAR_MONTHS))}</span>
              </div>
            )}

            <div className="pr-total">
              <span>{yearly ? 'Yiliga' : 'Oyiga'}</span>
              <b>
                {fmt(shown)}
                <small>so&apos;m</small>
              </b>
            </div>

            <div className="pr-bill">
              <button className={!yearly ? 'on' : ''} onClick={() => setYearly(false)}>
                Oylik
              </button>
              <button className={yearly ? 'on' : ''} onClick={() => setYearly(true)}>
                Yillik <em>2 oy bepul</em>
              </button>
            </div>

            <div className="pr-cta">
              <Btn href="#" tone="ink">
                14 kun bepul sinash
              </Btn>
              <small>Karta so‘ralmaydi. Istalgan vaqt o‘zgartirasiz.</small>
            </div>

            <div className="pr-bar" aria-hidden="true" />
          </div>
        </div>
      </div>
    </>
  )
}
