import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  Cloud,
  CreditCard,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
} from 'lucide-react'
import Nav from '@/components/Nav'
import Reveal from '@/components/Reveal'
import CrmPreview, { FloatCards } from '@/components/CrmPreview'
import HeroScene from '@/components/HeroScene'

const stats = [
  { v: '500+', l: 'Faol biznes' },
  { v: '1.2 mln', l: 'Oylik sotuvlar' },
  { v: '99.9%', l: 'Ishlash vaqti' },
  { v: '24/7', l: "Qo'llab-quvvatlash" },
]

const features = [
  { icon: ShoppingCart, t: 'Tezkor kassa (POS)', d: "Skaner, chek, qaytarish va smena boshqaruvi — sekundlar ichida sotuv." },
  { icon: Boxes, t: 'Ombor va zaxira', d: "Kirim, ko'chirish, hisobdan chiqarish va real vaqtdagi qoldiq nazorati." },
  { icon: Users, t: 'Mijozlar bazasi', d: 'Xaridlar tarixi, sodiqlik ballari, aksiyalar va kupon tizimi.' },
  { icon: Store, t: "Ko'p filial", d: "Barcha do'kon va omborlarni bitta paneldan boshqaring va solishtiring." },
  { icon: BarChart3, t: 'Hisobot va tahlil', d: "Foyda, savdo dinamikasi va prognozlar — chiroyli grafiklarda." },
  { icon: ShieldCheck, t: 'Rollar va xavfsizlik', d: "Har bir xodim uchun alohida ruxsatlar, ikki bosqichli himoya." },
]

const points = [
  "Bitta oynada savdo, ombor va mijozlar",
  "Real vaqtda yangilanuvchi statistika",
  "Telefon, planshet va kompyuterda qulay",
  "Och va qorong'u rejim — ko'zingizga mos",
]

const plans = [
  {
    name: 'Start',
    desc: "Yangi boshlayotgan kichik do'konlar uchun.",
    price: '199 000',
    features: ['1 ta filial', '2 tagacha xodim', 'Kassa (POS) va ombor', 'Asosiy hisobotlar', 'Email yordam'],
  },
  {
    name: 'Biznes',
    desc: "O'sib borayotgan savdo tarmoqlari uchun eng qulay tanlov.",
    price: '499 000',
    featured: true,
    features: ['5 tagacha filial', '15 tagacha xodim', 'Mijozlar va sodiqlik tizimi', 'Kengaytirilgan hisobotlar', 'Rollar va ruxsatlar', 'Ustuvor yordam'],
  },
  {
    name: 'Premium',
    desc: "Yirik korxonalar va franchayzalar uchun to'liq imkoniyat.",
    price: '999 000',
    features: ['Cheksiz filial va xodim', 'AI yordamchi va prognoz', 'Integratsiyalar va API', 'Shaxsiy menejer', 'Ma’lumotlarni ko‘chirish', '24/7 yordam'],
  },
]

const faqs = [
  { q: "Tizimni sinab ko'rish mumkinmi?", a: "Ha, barcha tariflar uchun 14 kunlik bepul sinov muddati mavjud. Karta kiritish shart emas." },
  { q: "Ma'lumotlarim xavfsizmi?", a: "Ma'lumotlar shifrlangan holda saqlanadi, muntazam zaxira nusxalari olinadi va har bir xodim faqat o'z ruxsatidagi bo'limlarni ko'radi." },
  { q: "Tarifni keyin o'zgartirsam bo'ladimi?", a: "Albatta. Istalgan vaqtda yuqori yoki quyi tarifga o'tishingiz mumkin, hisob-kitob avtomatik qayta hisoblanadi." },
  { q: "Eski ma'lumotlarimni ko'chirib beradimi?", a: "Ha, Excel yoki boshqa tizimdan mahsulot va mijozlar bazasini ko'chirishda jamoamiz yordam beradi." },
]

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="hero">
          <HeroScene />
          <div className="container">
            <div className="hero-copy">
              <span className="eyebrow">
                <b>Yangi</b> AI yordamchi va prognozlar qo&apos;shildi
              </span>
              <h1>
                Biznesingizni <span className="grad">bitta tizimda</span> boshqaring
              </h1>
              <p className="lead">
                Savdo, ombor, mijozlar va hisobotlar — barchasi bitta tez va zamonaviy CRM&apos;da. Vaqtni tejang, xatolarni kamaytiring va
                daromadni oshiring.
              </p>
              <div className="hero-cta">
                <a href="#tariflar" className="btn btn-primary">
                  Bepul boshlash <ArrowRight size={18} />
                </a>
                <a href="#korinish" className="btn btn-ghost">
                  Tizimni ko&apos;rish
                </a>
              </div>
              <p className="hero-note">14 kun bepul · Karta shart emas · Istalgan vaqt bekor qilish</p>
            </div>

            <div className="hero-shot" style={{ position: 'relative' }}>
              <CrmPreview />
              <FloatCards />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="stats">
          <div className="container stats-grid">
            {stats.map((s, i) => (
              <Reveal key={s.l} delay={i * 80}>
                <div className="stat">
                  <strong>{s.v}</strong>
                  <span>{s.l}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="section" id="imkoniyatlar">
          <div className="container">
            <Reveal className="section-head">
              <span className="kicker">Imkoniyatlar</span>
              <h2>Savdoni boshqarish uchun kerak bo&apos;lgan hamma narsa</h2>
              <p>Alohida dasturlar orasida adashib yurmang — barcha vositalar bir joyda va bir-biri bilan bog&apos;langan.</p>
            </Reveal>
            <div className="features">
              {features.map(({ icon: Icon, t, d }, i) => (
                <Reveal key={t} delay={(i % 3) * 90}>
                  <div className="feature">
                    <span className="feature-icon">
                      <Icon size={22} />
                    </span>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Showcase */}
        <section className="section" id="korinish" style={{ paddingTop: 24 }}>
          <div className="container showcase">
            <Reveal>
              <div>
                <span className="kicker">Ko&apos;rinish</span>
                <h2>Chiroyli, tushunarli va juda tez</h2>
                <p>Interfeys shunday yaratilganki, yangi xodim ham bir necha daqiqada ishlashni boshlaydi.</p>
                <ul className="checks">
                  {points.map((p) => (
                    <li key={p}>
                      <Check size={20} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <CrmPreview compact />
            </Reveal>
          </div>
        </section>

        {/* Pricing */}
        <section className="section" id="tariflar">
          <div className="container">
            <Reveal className="section-head">
              <span className="kicker">Tariflar</span>
              <h2>Biznesingiz hajmiga mos tarif</h2>
              <p>Yashirin to&apos;lovlarsiz, shaffof narxlar. Istalgan vaqtda tarifni o&apos;zgartirishingiz mumkin.</p>
            </Reveal>
            <div className="pricing">
              {plans.map((p, i) => (
                <Reveal key={p.name} delay={i * 100}>
                  <div className={`plan${p.featured ? ' featured' : ''}`} style={{ height: '100%' }}>
                    {p.featured && <span className="badge">Eng ommabop</span>}
                    <h3>{p.name}</h3>
                    <p className="desc">{p.desc}</p>
                    <div className="price">
                      <strong>{p.price}</strong>
                      <span>so&apos;m / oy</span>
                    </div>
                    <ul>
                      {p.features.map((f) => (
                        <li key={f}>
                          <Check size={18} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a href="#" className={`btn ${p.featured ? 'btn-primary' : 'btn-ghost'}`}>
                      {p.featured ? <Sparkles size={16} /> : <CreditCard size={16} />} Tanlash
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="savollar" style={{ paddingTop: 24 }}>
          <div className="container">
            <Reveal className="section-head">
              <span className="kicker">Savollar</span>
              <h2>Ko&apos;p beriladigan savollar</h2>
            </Reveal>
            <Reveal>
              <div className="faq">
                {faqs.map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="container">
            <Reveal>
              <div className="cta">
                <h2>Bugun boshlang — 14 kun bepul</h2>
                <p>Biznesingizni yangi darajaga olib chiqing. Ro&apos;yxatdan o&apos;tish bir daqiqa vaqt oladi.</p>
                <a href="#tariflar" className="btn btn-light">
                  <Cloud size={18} /> Hoziroq sinab ko&apos;ring
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Cognilabs" />
          <nav>
            <a href="#imkoniyatlar">Imkoniyatlar</a>
            <a href="#tariflar">Tariflar</a>
            <a href="#savollar">Savollar</a>
          </nav>
          <span>© {new Date().getFullYear()} Cognilabs. Barcha huquqlar himoyalangan.</span>
        </div>
      </footer>
    </>
  )
}
