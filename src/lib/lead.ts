/** Sends the landing form to the backend through our own /api/lead route. */

const UTM_KEY = 'zell-utm'
const UTM = ['utm_source', 'utm_medium', 'utm_campaign'] as const

export type Lead = { owner: string; phone: string; shop: string; category: string; website: string }
export type SendResult = { ok: true } | { ok: false; reason: string }

/** Keeps the first visit's ?utm_* so they survive moving to another page. */
export function rememberUtm() {
  try {
    if (sessionStorage.getItem(UTM_KEY)) return
    const q = new URLSearchParams(location.search)
    const utm = Object.fromEntries(UTM.flatMap((k) => (q.get(k) ? [[k, q.get(k)!.slice(0, 255)]] : [])))
    if (Object.keys(utm).length) sessionStorage.setItem(UTM_KEY, JSON.stringify(utm))
  } catch {}
}

function savedUtm(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_KEY) ?? '{}') ?? {}
  } catch {
    return {}
  }
}

export async function sendLead(l: Lead): Promise<SendResult> {
  const body: Record<string, string> = {
    contact_name: l.owner,
    phone: l.phone,
    ...savedUtm(),
    page_url: location.href.slice(0, 500),
    // Honeypot: always sent, a person leaves it empty.
    website: l.website,
  }
  if (l.shop) body.company_name = l.shop
  if (l.category) body.message = `Kategoriya: ${l.category}`

  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.status === 202 || res.ok) return { ok: true }
    if (res.status === 429) return { ok: false, reason: "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring" }
    if (res.status === 422) {
      const data = await res.json().catch(() => null)
      const fields: string[] = Array.isArray(data?.detail) ? data.detail.map((d: { loc?: unknown[] }) => String(d?.loc?.at(-1) ?? '')) : []
      if (fields.includes('phone') || !fields.length) return { ok: false, reason: 'Telefon raqamni tekshiring' }
      if (fields.includes('contact_name')) return { ok: false, reason: 'Ismingizni tekshiring (kamida 2 harf)' }
      return { ok: false, reason: "Ma'lumotlarni tekshiring" }
    }
    return { ok: false, reason: "Xatolik yuz berdi, qayta urinib ko'ring" }
  } catch {
    return { ok: false, reason: "Internetga ulanib bo'lmadi, qayta urinib ko'ring" }
  }
}
