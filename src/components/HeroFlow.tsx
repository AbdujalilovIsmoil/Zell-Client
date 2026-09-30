'use client'

import { useEffect, useState } from 'react'

/**
 * What happens after one receipt, as a four-step chain. Each time the printer
 * finishes a receipt the steps light up one after another.
 */
export default function HeroFlow() {
  const [r, setR] = useState({ total: 6_660_000, points: 66, n: 0 })
  const [step, setStep] = useState(-1)

  useEffect(() => {
    const timers: number[] = []
    const run = () => {
      timers.forEach(clearTimeout)
      timers.length = 0
      for (let i = 0; i <= 4; i++) timers.push(window.setTimeout(() => setStep(i), 350 + i * 420))
    }
    const on = (e: Event) => {
      const { total } = (e as CustomEvent<{ total: number }>).detail
      setR((p) => ({ total, points: Math.max(1, Math.round(total / 100_000)), n: p.n + 1 }))
      run()
    }
    run()
    window.addEventListener('zell:receipt', on)
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('zell:receipt', on)
    }
  }, [])

  const mln = r.total >= 1_000_000 ? `${(r.total / 1_000_000).toFixed(2).replace('.', ',')} mln` : `${Math.round(r.total / 1000)} ming`
  const steps = [
    { k: 'Chek', v: mln },
    { k: 'Ombor', v: 'qoldiq −1' },
    { k: 'Mijoz', v: `+${r.points} ball` },
    { k: 'Hisobot', v: 'yangilandi' },
  ]

  return (
    <ol className="flow" aria-label="Bitta chekdan keyin nima bo'ladi">
      {steps.map((s, i) => (
        <li key={s.k} className={step >= i ? 'on' : ''} style={{ transitionDelay: step >= i ? '0s' : `${(3 - i) * 40}ms` }}>
          <span className="flow-k">{s.k}</span>
          <span className="flow-v" key={`${r.n}-${i}`}>
            {s.v}
          </span>
        </li>
      ))}
    </ol>
  )
}
