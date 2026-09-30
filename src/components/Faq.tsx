'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * FAQ as a support chat. Pick a question on the left (or type your own) and it
 * is "sent"; Zell answers after a short typing pause, letter by letter.
 * Free text is matched to an answer by keywords.
 */

type QA = { id: string; q: string; a: string; keys: string[] }

const FAQ: QA[] = [
  {
    id: 'trial',
    q: "Avval sinab ko'rsam bo'ladimi?",
    a: "Ha. Har qanday tarifni 14 kun bepul ishlatasiz, karta ma'lumoti so'ralmaydi. Sinov tugagach tarifni tanlaysiz yoki shunchaki to'xtatasiz.",
    keys: ['sinab', 'sinov', 'bepul', 'trial', 'test', "ko'rsam"],
  },
  {
    id: 'import',
    q: "Eski ma'lumotlarimni ko'chirib beradimi?",
    a: "Mahsulot va mijozlar bazasini Excel yoki CSV fayldan bir necha daqiqada yuklaysiz. Baza katta bo'lsa, jamoamiz ko'chirishga yordam beradi.",
    keys: ["ko'chir", 'kochir', 'excel', 'csv', 'import', 'eski', 'baza', 'yukla'],
  },
  {
    id: 'mobile',
    q: 'Telefonda ishlaydimi?',
    a: "Ha. Zell brauzerda ishlaydi — kompyuter, planshet va telefonda ochiladi. Alohida dastur o'rnatish shart emas.",
    keys: ['telefon', 'mobil', 'planshet', 'android', 'iphone', 'dastur', 'ilova'],
  },
  {
    id: 'scanner',
    q: 'Shtrix-kod skaner bilan ishlaydimi?',
    a: "Ha. Kassada skaner bilan sotasiz, omborga tovarni ham skanerlab qabul qilasiz. Shtrix-kodi yo'q tovarlarni nomi yoki SKU bo'yicha topasiz.",
    keys: ['skaner', 'shtrix', 'barcode', 'kod', 'sku'],
  },
  {
    id: 'roles',
    q: "Xodimlar hamma narsani ko'ra oladimi?",
    a: "Yo'q. Har bir xodimga rol beriladi: kassir faqat kassani, omborchi faqat omborni ko'radi. Ruxsatlarni o'zingiz sozlaysiz.",
    keys: ['xodim', 'rol', 'ruxsat', 'kassir', 'omborchi', "ko'ra"],
  },
  {
    id: 'branches',
    q: "Bir nechta do'konim bo'lsa-chi?",
    a: "Barcha filiallar bitta hisobda. Har birining savdosi va qoldig'ini alohida ko'rasiz, filiallar orasida tovar ko'chirasiz.",
    keys: ['filial', "do'kon", 'dokon', 'tarmoq', 'bir nechta', 'franchayz'],
  },
  {
    id: 'security',
    q: "Ma'lumotlarim xavfsizmi?",
    a: "Kirish ikki bosqichli himoya bilan yopiladi, faol sessiyalarni ko'rib turasiz va notanish qurilmadan kirilsa ogohlantirish olasiz.",
    keys: ['xavfsiz', 'himoya', 'parol', 'sessiya', "o'g'ri", 'xaker'],
  },
  {
    id: 'plan',
    q: "Tarifni keyin o'zgartirsam bo'ladimi?",
    a: "Istalgan vaqtda. Yuqoriroq yoki pastroq tarifga o'tsangiz, to'lov avtomatik qayta hisoblanadi.",
    keys: ['tarif', 'narx', "o'zgartir", 'pul', "to'lov", 'qancha', 'arzon'],
  },
]

type Msg = { id: number; from: 'me' | 'zell'; text: string; typing?: boolean; suggest?: boolean }

const norm = (s: string) => s.toLowerCase().replace(/[‘’`ʻʼ]/g, "'")

function match(text: string): QA | null {
  const t = norm(text)
  let best: QA | null = null
  let score = 0
  for (const qa of FAQ) {
    const s = qa.keys.reduce((n, k) => n + (t.includes(k) ? 1 : 0), 0)
    if (s > score) {
      score = s
      best = qa
    }
  }
  return best
}

let uid = 1

export default function Faq() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, from: 'zell', text: "Assalomu alaykum! Chapdan savol tanlang yoki o'zingiz yozing — darhol javob beraman." },
  ])
  const [asked, setAsked] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState('')
  const scroller = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [msgs])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms))

  const reply = (text: string, suggest = false) => {
    const id = uid++
    setMsgs((m) => [...m, { id, from: 'zell', text: '', typing: true }])
    later(() => {
      // type it out
      let i = 0
      const step = () => {
        i = Math.min(text.length, i + 2)
        setMsgs((m) => m.map((x) => (x.id === id ? { ...x, text: text.slice(0, i), typing: false, suggest: i === text.length && suggest } : x)))
        if (i < text.length) later(step, 14)
        else setBusy(false)
      }
      step()
    }, 750)
  }

  const ask = (text: string, qa: QA | null) => {
    if (busy || !text.trim()) return
    setBusy(true)
    setMsgs((m) => [...m, { id: uid++, from: 'me', text }])
    if (qa) {
      setAsked((a) => (a.includes(qa.id) ? a : [...a, qa.id]))
      later(() => reply(qa.a), 300)
    } else {
      later(() => reply("Bu savolga aniq javobim yo'q. Mana bular yordam berishi mumkin:", true), 300)
    }
  }

  const unasked = FAQ.filter((q) => !asked.includes(q.id)).slice(0, 3)

  return (
    <div className="fq">
      <ol className="fq-list">
        {FAQ.map((qa, i) => (
          <li key={qa.id}>
            <button className={asked.includes(qa.id) ? 'done' : ''} onClick={() => ask(qa.q, qa)} disabled={busy}>
              <span className="fq-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="fq-q">{qa.q}</span>
              <span className="fq-go" aria-hidden="true">
                {asked.includes(qa.id) ? '✓' : '↗'}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="fq-chat">
        <div className="fq-top">
          <span className="fq-ava">Z</span>
          <div>
            <b>Zell yordam</b>
            <small>{busy ? 'yozmoqda…' : 'onlayn'}</small>
          </div>
        </div>

        <div className="fq-msgs" ref={scroller} data-lenis-prevent aria-live="polite">
          {msgs.map((m) => (
            <div key={m.id} className={`fq-msg ${m.from}`}>
              {m.typing ? (
                <span className="fq-dots" aria-label="yozmoqda">
                  <i />
                  <i />
                  <i />
                </span>
              ) : (
                <p>{m.text}</p>
              )}
              {m.suggest && (
                <div className="fq-suggest">
                  {(unasked.length ? unasked : FAQ.slice(0, 3)).map((qa) => (
                    <button key={qa.id} onClick={() => ask(qa.q, qa)}>
                      {qa.q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <form
          className="fq-input"
          onSubmit={(e) => {
            e.preventDefault()
            const t = draft
            setDraft('')
            ask(t, match(t))
          }}
        >
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Savolingizni yozing…" aria-label="Savol" />
          <button type="submit" disabled={busy || !draft.trim()} aria-label="Yuborish">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
