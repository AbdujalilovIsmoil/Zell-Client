/**
 * Forwards the landing form to the backend from our server, so the
 * X-Landing-Key stays in the server env and never reaches the browser.
 * The backend's status (202 / 422 / 429 / 5xx) and body are passed through.
 */

const API = process.env.LANDING_API_URL ?? 'https://pos.api.cognilabs.org'
const FIELDS = ['contact_name', 'phone', 'company_name', 'message', 'utm_source', 'utm_medium', 'utm_campaign', 'page_url', 'website']

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return Response.json({ detail: 'Bad request' }, { status: 400 })

  // Only the documented fields; source, stage and owner are set by the backend.
  const lead: Record<string, string> = {}
  for (const f of FIELDS) {
    const v = (body as Record<string, unknown>)[f]
    if (typeof v === 'string') lead[f] = v
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const key = process.env.LANDING_API_KEY
  if (key) headers['X-Landing-Key'] = key
  // Rate limits are per IP, so pass the visitor's address on.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip')
  if (ip) headers['X-Forwarded-For'] = ip

  try {
    const res = await fetch(`${API}/api/v1/landing/leads`, { method: 'POST', headers, body: JSON.stringify(lead), cache: 'no-store' })
    const text = await res.text()
    return new Response(text || null, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' } })
  } catch {
    return Response.json({ detail: 'Upstream unavailable' }, { status: 502 })
  }
}
