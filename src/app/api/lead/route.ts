import { NextResponse } from 'next/server'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_CHAT_ID
  if (!token || !chat) return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 500 })

  const body = await req.json().catch(() => null)
  const shop = clip(body?.shop, 60)
  const owner = clip(body?.owner, 60)
  const parsed = parsePhoneNumberFromString(clip(body?.phone, 24))
  const category = clip(body?.category, 60)

  if (!shop || !owner || !category || !parsed?.isValid()) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  const when = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Tashkent' }).format(new Date())
  const text = [
    '🆕 <b>Yangi so‘rov — Zell</b>',
    '━━━━━━━━━━━━━━',
    `🏪 <b>Do‘kon:</b> ${esc(shop)}`,
    `👤 <b>Ism:</b> ${esc(owner)}`,
    `📞 <b>Telefon:</b> <code>${esc(parsed!.number)}</code>${parsed!.country ? ` (${parsed!.country})` : ''}`,
    `🗂 <b>Kategoriya:</b> ${esc(category)}`,
    '━━━━━━━━━━━━━━',
    `🕐 ${when} (Toshkent)`,
  ].join('\n')

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  }).catch(() => null)

  if (!res?.ok) return NextResponse.json({ ok: false, error: 'telegram' }, { status: 502 })
  return NextResponse.json({ ok: true })
}
