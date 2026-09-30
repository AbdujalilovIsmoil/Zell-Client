import { BarChart3, Boxes, LayoutDashboard, Receipt, Settings, ShoppingCart, TrendingUp, Users, Wallet } from 'lucide-react'

const nav = [
  { icon: LayoutDashboard, label: 'Boshqaruv', on: true },
  { icon: ShoppingCart, label: 'Kassa (POS)' },
  { icon: Boxes, label: 'Ombor' },
  { icon: Users, label: 'Mijozlar' },
  { icon: Receipt, label: 'Sotuvlar' },
  { icon: BarChart3, label: 'Hisobotlar' },
  { icon: Settings, label: 'Sozlamalar' },
]

const kpis = [
  { label: 'Bugungi savdo', value: "12 480 000", delta: '+12.4%' },
  { label: 'Buyurtmalar', value: '284', delta: '+8.1%' },
  { label: 'Yangi mijozlar', value: '46', delta: '+21%' },
  { label: 'Qaytarishlar', value: '3', delta: '-2.0%', down: true },
]

const bars = [42, 58, 47, 72, 65, 88, 76, 94, 82, 100, 90, 112]

const orders = [
  { n: '#10482', c: 'Aziza R.', s: '1 240 000', t: "To'landi" },
  { n: '#10481', c: 'Bekzod T.', s: '860 000', t: "To'landi" },
  { n: '#10480', c: 'Malika S.', s: '2 150 000', t: 'Kutilmoqda', warn: true },
  { n: '#10479', c: 'Jasur K.', s: '540 000', t: "To'landi" },
]

export default function CrmPreview({ compact = false }: { compact?: boolean }) {
  const max = Math.max(...bars)
  return (
    <div className="crm" role="img" aria-label="CRM boshqaruv paneli ko'rinishi">
      <aside className="crm-side">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" />
        {nav.map(({ icon: Icon, label, on }) => (
          <div key={label} className={`crm-nav${on ? ' on' : ''}`}>
            <Icon size={16} />
            {label}
          </div>
        ))}
      </aside>
      <div className="crm-main">
        <div className="crm-top">
          <div>
            <h4>Xayrli kun, Ismoil 👋</h4>
            <small>Bugungi biznes ko&apos;rsatkichlari</small>
          </div>
          <span className="crm-pill">+ Yangi sotuv</span>
        </div>

        <div className="crm-kpis">
          {kpis.map((k) => (
            <div className="kpi" key={k.label}>
              <small>{k.label}</small>
              <b>{k.value}</b>
              <i className={k.down ? 'down' : ''}>{k.delta}</i>
            </div>
          ))}
        </div>

        <div className="crm-row">
          <div className="panel">
            <h5>Savdo dinamikasi · 12 oy</h5>
            <svg className="chart" viewBox="0 0 360 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2fd580" />
                  <stop offset="1" stopColor="#02b856" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="0" x2="360" y1={12 + i * 40} y2={12 + i * 40} stroke="currentColor" strokeOpacity=".08" />
              ))}
              {bars.map((b, i) => {
                const h = (b / max) * 128
                return <rect key={i} x={i * 30 + 5} y={140 - h} width="20" height={h} rx="6" fill="url(#bar)" opacity={i === 11 ? 1 : 0.55} />
              })}
            </svg>
          </div>
          <div className="panel">
            <h5>So&apos;nggi buyurtmalar</h5>
            <div className="tbl">
              {(compact ? orders.slice(0, 3) : orders).map((o) => (
                <div key={o.n}>
                  <span>
                    <b>{o.n}</b> · {o.c}
                  </span>
                  <span className={`tag${o.warn ? ' warn' : ''}`}>{o.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FloatCards() {
  return (
    <>
      <div className="float-card" style={{ right: 190, top: -28 }}>
        <span className="dot">
          <TrendingUp size={18} />
        </span>
        <span>
          Oylik o&apos;sish<b>+34.8%</b>
        </span>
      </div>
      <div className="float-card" style={{ left: -26, bottom: '9%', animationDelay: '-3s' }}>
        <span className="dot">
          <Wallet size={18} />
        </span>
        <span>
          Bugungi tushum<b>12.48 mln so&apos;m</b>
        </span>
      </div>
    </>
  )
}
