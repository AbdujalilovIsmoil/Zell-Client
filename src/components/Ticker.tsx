'use client'

import { useEffect, useRef, useState } from 'react'

const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ')

/** Today's numbers under the hero; every printed receipt bumps them. */
export default function Ticker() {
  const [s, setS] = useState({ sales: 68_450_000, checks: 742, customers: 23 })
  const [shown, setShown] = useState(s)
  const [flash, setFlash] = useState(0)
  const from = useRef(s)

  useEffect(() => {
    const on = (e: Event) => {
      const { total, newCustomer } = (e as CustomEvent<{ total: number; newCustomer: boolean }>).detail
      setS((p) => ({ sales: p.sales + total, checks: p.checks + 1, customers: p.customers + (newCustomer ? 1 : 0) }))
      setFlash((f) => f + 1)
    }
    window.addEventListener('zell:receipt', on)
    return () => window.removeEventListener('zell:receipt', on)
  }, [])

  // ease the numbers toward their new values
  useEffect(() => {
    const start = performance.now()
    const a = { ...from.current }
    let raf = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 900)
      const k = 1 - Math.pow(1 - t, 3)
      setShown({
        sales: a.sales + (s.sales - a.sales) * k,
        checks: a.checks + (s.checks - a.checks) * k,
        customers: a.customers + (s.customers - a.customers) * k,
      })
      if (t < 1) raf = requestAnimationFrame(step)
      else from.current = s
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [s])

  const items = [
    { k: 'Bugungi savdo', v: `${fmt(shown.sales)} so'm` },
    { k: 'Cheklar', v: fmt(shown.checks) },
    { k: 'Yangi mijozlar', v: fmt(shown.customers) },
    { k: "O'rtacha chek", v: `${fmt(shown.sales / shown.checks)} so'm` },
  ]

  return (
    <div className="ticker">
      <span className="ticker-live" key={flash}>
        <i /> Jonli
      </span>
      {items.map((it) => (
        <div key={it.k}>
          <small>{it.k}</small>
          <b>{it.v}</b>
        </div>
      ))}
    </div>
  )
}
