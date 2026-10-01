import Nav from '@/components/Nav'
import Reveal from '@/components/Reveal'
import CheckoutScene from '@/components/CheckoutScene'
import Playground from '@/components/Playground'
import Pricing from '@/components/Pricing'
import Faq from '@/components/Faq'
import FinalCta from '@/components/FinalCta'
import Tour from '@/components/Tour'
import Ticker from '@/components/Ticker'
import Btn from '@/components/Arrow'
import HeroFlow from '@/components/HeroFlow'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* ---------- Hero ---------- */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <p className="hero-tag">Do&apos;konlar va savdo tarmoqlari uchun CRM</p>
              <h1 className="hero-title">
                <span className="ln">
                  <span>Har bir chek</span>
                </span>
                <span className="ln">
                  <span>
                    <em>o&apos;zi</em> hisobga
                  </span>
                </span>
                <span className="ln">
                  <span>
                    tushadi<i className="dot">.</i>
                  </span>
                </span>
              </h1>
              <p className="hero-lead">
                Kassada sotuv bo&apos;lgan soniyada ombor, mijoz kartasi va foyda hisoboti o&apos;zi yangilanadi. Siz faqat savdo qilasiz.
              </p>
              <div className="hero-cta">
                <Btn href="#tariflar" tone="brand">
                  14 kun bepul sinash
                </Btn>
                <a href="#imkoniyatlar" className="ulink">
                  Qanday ishlaydi
                </a>
              </div>
              <HeroFlow />
            </div>
            <div className="hero-visual">
              <CheckoutScene />
            </div>
          </div>
          <div className="wrap">
            <Ticker />
          </div>
        </section>

        {/* ---------- Services ---------- */}
        <section className="section" id="imkoniyatlar">
          <div className="wrap">
            <Reveal className="head">
              <span className="eyebrow">Imkoniyatlar</span>
              <h2>
                Bitta sotuv. <em>Uch</em> joyda natija.
              </h2>
              <p>Xaridorni tanlang va &quot;Sotish&quot;ni bosing — ombor, mijoz kartasi va hisobot qanday yangilanishini o&apos;zingiz ko&apos;ring.</p>
            </Reveal>
            <Reveal>
              <Playground />
            </Reveal>
            <Reveal className="more">
              <span>Yana:</span>
              {["Ko'p filial", 'Rollar va ruxsatlar', 'Kassa smenalari', 'Qaytarishlar', 'Aksiya va vaucherlar', 'Yetkazib beruvchilar', 'Soliq hisobi', 'AI prognoz', 'Integratsiyalar'].map((m) => (
                <b key={m}>{m}</b>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ---------- Showcase ---------- */}
        <section className="section" id="korinish">
          <div className="wrap">
            <Reveal className="head">
              <span className="eyebrow">Ko&apos;rinish</span>
              <h2>
                Yangi kassir <em>birinchi kuni</em> ishlaydi.
              </h2>
              <p>Tizimni o&apos;zingiz aylanib chiqing: nuqtani bosing — ekran o&apos;sha joyga yaqinlashadi va nima qilishini aytadi.</p>
            </Reveal>
            <Reveal>
              <Tour />
            </Reveal>
          </div>
        </section>

        {/* ---------- Pricing ---------- */}
        <section className="section" id="tariflar">
          <div className="wrap">
            <Reveal className="head">
              <span className="eyebrow">Tariflar</span>
              <h2>
                Faqat <em>kerakli</em> narsa uchun to&apos;laysiz.
              </h2>
              <p>Tayyor tarifni tanlang yoki chekni o&apos;zingiz yig&apos;ing — narx shu zahoti hisoblanadi.</p>
            </Reveal>
            <Reveal>
              <Pricing />
            </Reveal>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="section" id="savollar">
          <div className="wrap">
            <Reveal className="head">
              <span className="eyebrow">Savollar</span>
              <h2>
                So&apos;rang — <em>darhol</em> javob beramiz.
              </h2>
              <p>Savolni tanlang yoki o&apos;zingiz yozing.</p>
            </Reveal>
            <Reveal>
              <Faq />
            </Reveal>
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="cta" id="boshlash">
          <div className="wrap">
            <FinalCta />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-in">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Zell" />
          <nav>
            <a href="#imkoniyatlar">Imkoniyatlar</a>
            <a href="#tariflar">Tariflar</a>
            <a href="#savollar">Savollar</a>
          </nav>
          <span>© {new Date().getFullYear()} Zell</span>
        </div>
      </footer>
    </>
  )
}
