'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * "Try a sale": a working miniature of the CRM. Pick a customer, press Sotish,
 * and watch the same sale land in stock, the customer card and the report —
 * each along its own path from the till. Runs itself until someone touches it.
 */

type Product = { id: string; name: string; price: number; cost: number; stock: number; max: number; tint: string }
type Customer = { id: string; name: string; points: number; tier: string }

const INITIAL_PRODUCTS: Product[] = [
  { id: 'a55', name: 'Samsung Galaxy A55', price: 4_290_000, cost: 3_700_000, stock: 6, max: 12, tint: '#e9e9e4' },
  { id: 'jbl', name: 'JBL Flip 6', price: 1_650_000, cost: 1_320_000, stock: 4, max: 10, tint: '#0f7f86' },
  { id: 'cola', name: 'Coca-Cola 1,5 L', price: 14_000, cost: 10_500, stock: 36, max: 60, tint: '#d01f26' },
  { id: 'non', name: 'Non (tandir)', price: 5_000, cost: 3_200, stock: 44, max: 80, tint: '#c98a3d' },
]
const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'aziza', name: 'Aziza R.', points: 1_240, tier: 'VIP' },
  { id: 'bekzod', name: 'Bekzod T.', points: 320, tier: 'Doimiy' },
  { id: 'guest', name: 'Mehmon', points: 0, tier: '—' },
]
const HOURS = ['09', '10', '11', '12', '13', '14', '15', '16']
const INITIAL_BARS = [3.1, 5.4, 4.2, 7.8, 6.1, 8.9, 5.2, 2.4].map((m) => m * 1_000_000)

const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU').replace(/ |,/g, ' ')

function useTween(value: number, ms = 700) {
  const [v, setV] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const a = from.current
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      const k = 1 - Math.pow(1 - t, 3)
      setV(a + (value - a) * k)
      if (t < 1) raf = requestAnimationFrame(step)
      else from.current = value
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return v
}

export default function Playground() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS)
  const [cid, setCid] = useState('aziza')
  const [lines, setLines] = useState<{ key: number; name: string; price: number }[]>([])
  const [revenue, setRevenue] = useState(68_450_000)
  const [profit, setProfit] = useState(11_870_000)
  const [bars, setBars] = useState(INITIAL_BARS)
  const [pulse, setPulse] = useState({ n: 0, product: '' })
  const [touched, setTouched] = useState(false)

  const customer = customers.find((c) => c.id === cid)!
  const rev = useTween(revenue)
  const prof = useTween(profit)
  const pts = useTween(customer.points, 600)

  const sell = useCallback(
    (id: string, byUser = true) => {
      if (byUser) setTouched(true)
      const p = products.find((x) => x.id === id)
      if (!p || p.stock === 0) return
      setProducts((ps) => ps.map((x) => (x.id === id ? { ...x, stock: x.stock - 1 } : x)))
      const earned = cid === 'guest' ? 0 : Math.max(1, Math.round(p.price / 100_000))
      setCustomers((cs) => cs.map((c) => (c.id === cid ? { ...c, points: c.points + earned } : c)))
      setLines((ls) => [...ls, { key: Date.now(), name: p.name, price: p.price }].slice(-3))
      setRevenue((r) => r + p.price)
      setProfit((r) => r + p.price - p.cost)
      setBars((b) => b.map((v, i) => (i === b.length - 1 ? v + p.price : v)))
      setPulse((s) => ({ n: s.n + 1, product: id }))
    },
    [products, cid],
  )

  /* ---------- paths from the till to each module ---------- */
  const board = useRef<HTMLDivElement>(null)
  const till = useRef<HTMLDivElement>(null)
  const targets = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)]
  const [paths, setPaths] = useState<string[]>([])
  const [box, setBox] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    const measure = () => {
      const b = board.current
      const t = till.current
      if (!b || !t) return
      const B = b.getBoundingClientRect()
      const T = t.getBoundingClientRect()
      setBox({ w: B.width, h: B.height })
      const x0 = T.right - B.left
      const y0 = T.top - B.top + T.height * 0.5
      setPaths(
        targets.map((r) => {
          const R = r.current!.getBoundingClientRect()
          const x1 = R.left - B.left
          const y1 = R.top - B.top + Math.min(R.height / 2, 60)
          const mx = (x0 + x1) / 2
          return `M ${x0} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`
        }),
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (board.current) ro.observe(board.current)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---------- self-running demo while nobody has touched it ---------- */
  const inView = useRef(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.35 })
    if (board.current) io.observe(board.current)
    return () => io.disconnect()
  }, [])
  const sellRef = useRef(sell)
  sellRef.current = sell
  useEffect(() => {
    if (touched) return
    let i = 0
    const order = ['cola', 'a55', 'non', 'jbl', 'cola']
    const who = ['aziza', 'bekzod', 'guest', 'aziza', 'bekzod']
    const id = window.setInterval(() => {
      if (!inView.current) return
      setCid(who[i % who.length])
      window.setTimeout(() => sellRef.current(order[i % order.length], false), 450)
      i++
    }, 3200)
    return () => clearInterval(id)
  }, [touched])

  const maxBar = Math.max(...bars)

  return (
    <div className="pg" ref={board}>
      <svg className="pg-wires" width={box.w} height={box.h} aria-hidden="true">
        {paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
      {pulse.n > 0 &&
        paths.map((d, i) => (
          <span key={`${pulse.n}-${i}`} className="pg-dot" style={{ offsetPath: `path('${d}')`, animationDelay: `${i * 90}ms` }} />
        ))}

      {/* ---------- till ---------- */}
      <div className="pg-till" ref={till}>
        <div className="pg-head">
          <span>Kassa</span>
          <small>{touched ? 'Siz boshqaryapsiz' : 'Avtomatik namoyish — bosib ko‘ring'}</small>
        </div>
        <div className="pg-cust" role="radiogroup" aria-label="Xaridor">
          {customers.map((c) => (
            <button
              key={c.id}
              role="radio"
              aria-checked={cid === c.id}
              className={cid === c.id ? 'on' : ''}
              onClick={() => {
                setTouched(true)
                setCid(c.id)
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
        <ul className="pg-products">
          {products.map((p) => (
            <li key={p.id}>
              <i style={{ background: p.tint }} />
              <span className="pg-name">
                {p.name}
                <small>{fmt(p.price)} so&apos;m</small>
              </span>
              <button className="pg-sell" onClick={() => sell(p.id)} disabled={p.stock === 0}>
                {p.stock === 0 ? 'Tugadi' : 'Sotish'}
              </button>
            </li>
          ))}
        </ul>
        <div className="pg-receipt">
          {lines.length === 0 && <p className="pg-empty">Chek bo&apos;sh</p>}
          {lines.map((l) => (
            <div key={l.key} className="pg-line">
              <span>{l.name}</span>
              <b>{fmt(l.price)}</b>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- modules ---------- */}
      <div className="pg-mods">
        <div className="pg-mod" ref={targets[0]}>
          <div className="pg-head">
            <span>Ombor</span>
            <small>Qoldiq</small>
          </div>
          <ul className="pg-stock">
            {products.map((p) => (
              <li
                key={pulse.product === p.id ? `${p.id}-${pulse.n}` : p.id} // remount to replay the flash
                className={`${pulse.product === p.id ? 'hit' : ''}${p.stock <= 3 ? ' low' : ''}`}
              >
                <span>
                  {p.name}
                  {p.stock <= 3 && <em>{p.stock === 0 ? 'Tugadi' : 'Kam qoldi'}</em>}
                </span>
                <span className="pg-bar">
                  <i style={{ width: `${(p.stock / p.max) * 100}%` }} />
                </span>
                <b>{p.stock}</b>
              </li>
            ))}
          </ul>
        </div>

        <div className="pg-mod" ref={targets[1]}>
          <div className="pg-head">
            <span>Mijoz</span>
            <small>{customer.tier}</small>
          </div>
          <div className="pg-customer" key={`c-${cid}-${pulse.n}`}>
            <span className="pg-avatar">{customer.name[0]}</span>
            <div>
              <b>{customer.name}</b>
              <small>{cid === 'guest' ? "Ball yozilmaydi — kartasi yo'q" : 'Sodiqlik balli'}</small>
            </div>
            <strong>{cid === 'guest' ? '—' : fmt(pts)}</strong>
          </div>
        </div>

        <div className="pg-mod" ref={targets[2]}>
          <div className="pg-head">
            <span>Hisobot</span>
            <small>Bugun</small>
          </div>
          <div className="pg-report">
            <div>
              <small>Tushum</small>
              <b>{fmt(rev)}</b>
            </div>
            <div>
              <small>Foyda</small>
              <b>{fmt(prof)}</b>
            </div>
          </div>
          <div className="pg-chart">
            {bars.map((v, i) => (
              <span key={HOURS[i]} className={i === bars.length - 1 ? 'now' : ''}>
                <i style={{ height: `${(v / maxBar) * 100}%` }} />
                <small>{HOURS[i]}</small>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
