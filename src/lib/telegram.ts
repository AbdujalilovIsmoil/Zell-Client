import { parsePhoneNumberFromString } from 'libphonenumber-js'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export type Lead = { shop: string; owner: string; phone: string; category: string }

/** Sends a lead straight to the Telegram bot (sendMessage) from the browser. */
export type SendResult = { ok: true } | { ok: false; reason: string }

export async function sendLead(l: Lead): Promise<SendResult> {
  const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
  const chat = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID
  if (!token || !chat) return { ok: false, reason: 'Telegram sozlanmagan (token yoki chat ID yo‘q)' }

  const country = parsePhoneNumberFromString(l.phone)?.country
  const when = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Tashkent' }).format(new Date())
  const text = [
    '🆕 <b>Yangi so‘rov — Zell</b>',
    '━━━━━━━━━━━━━━',
    `🏪 <b>Do‘kon:</b> ${esc(l.shop)}`,
    `👤 <b>Ism:</b> ${esc(l.owner)}`,
    `📞 <b>Telefon:</b> ${esc(l.phone)}${country ? ` (${country})` : ''}`,
    `🗂 <b>Kategoriya:</b> ${esc(l.category)}`,
    '━━━━━━━━━━━━━━',
    `🕐 ${when} (Toshkent)`,
  ].join('\n')

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    })
    if (res.ok) return { ok: true }
    const data = await res.json().catch(() => null)
    return { ok: false, reason: data?.description ?? `Telegram xatosi (${res.status})` }
  } catch {
    return { ok: false, reason: 'Internetga ulanib bo‘lmadi' }
  }
}
