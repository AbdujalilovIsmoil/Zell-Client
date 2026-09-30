'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * A receipt printer that never stops. The paper is a bent plane whose texture
 * scrolls upward, so new lines appear to come out of the slot and hang down,
 * curling toward the viewer at the end. Scrolling the page feeds paper faster.
 * Every finished receipt fires `zell:receipt` so the hero ticker can count it.
 */

type Line = [string, string?] | 'rule' | 'gap' | { big: [string, string] } | { center: string; size?: number; bold?: boolean; color?: string } | 'barcode'

const RECEIPTS: { total: number; newCustomer: boolean; lines: Line[] }[] = [
  {
    total: 6_660_000,
    newCustomer: true,
    lines: [
      { center: 'ZELL', size: 76, bold: true, color: '#02b856' },
      { center: 'Baraka Market · Chilonzor' },
      { center: 'Kassa 2 · Kassir: Dilnoza' },
      'rule',
      ['Chek № 10483', '29.09.2026 14:32'],
      'rule',
      ['Samsung Galaxy A55'],
      ['  1 x 4 290 000', '4 290 000'],
      ['Anker powerbank 20000'],
      ['  2 x 399 000', '798 000'],
      ['JBL Flip 6'],
      ['  1 x 1 650 000', '1 650 000'],
      ['Coca-Cola 1,5 L'],
      ['  3 x 14 000', '42 000'],
      'rule',
      ['Oraliq summa', '6 780 000'],
      ['Chegirma (VIP 2%)', '-120 000'],
      { big: ['JAMI', "6 660 000 so'm"] },
      ['To‘lov', 'Karta · Humo'],
      ['Mijoz', 'Aziza R. · +66 ball'],
      'rule',
      'barcode',
      { center: 'Xaridingiz uchun rahmat!' },
    ],
  },
  {
    total: 125_000,
    newCustomer: false,
    lines: [
      { center: 'ZELL', size: 76, bold: true, color: '#02b856' },
      { center: 'Baraka Market · Yunusobod' },
      { center: 'Kassa 1 · Kassir: Jasur' },
      'rule',
      ['Chek № 10484', '29.09.2026 14:33'],
      'rule',
      ['Non (tandir)'],
      ['  4 x 5 000', '20 000'],
      ['Sut 1 L'],
      ['  2 x 13 500', '27 000'],
      ['Olma, 1,5 kg'],
      ['  1,5 x 18 000', '27 000'],
      ['Choy Ahmad 100 g'],
      ['  1 x 32 000', '32 000'],
      ['Tuxum, 10 dona'],
      ['  1 x 19 000', '19 000'],
      'rule',
      { big: ['JAMI', "125 000 so'm"] },
      ['To‘lov', 'Naqd'],
      ['Mijoz', 'Bekzod T. · +1 ball'],
      'rule',
      'barcode',
      { center: 'Xaridingiz uchun rahmat!' },
    ],
  },
]

const TEX_W = 640
const BLOCK_H = 1280 // one receipt
const PAPER = '#f6f5ef'
const INK = '#1d201e'
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'

function drawReceipts() {
  const c = document.createElement('canvas')
  c.width = TEX_W
  c.height = BLOCK_H * RECEIPTS.length
  const g = c.getContext('2d')!
  g.fillStyle = PAPER
  g.fillRect(0, 0, c.width, c.height)

  RECEIPTS.forEach((r, i) => {
    const top = i * BLOCK_H
    let y = top + 90
    const L = 48
    const R = TEX_W - 48
    g.textBaseline = 'alphabetic'
    for (const line of r.lines) {
      if (line === 'rule') {
        g.strokeStyle = 'rgba(29,32,30,.55)'
        g.setLineDash([8, 7])
        g.lineWidth = 2
        g.beginPath()
        g.moveTo(L, y - 10)
        g.lineTo(R, y - 10)
        g.stroke()
        g.setLineDash([])
        y += 30
      } else if (line === 'gap') {
        y += 20
      } else if (line === 'barcode') {
        let x = L + 40
        let seed = 7 + i * 13
        while (x < R - 40) {
          seed = (seed * 9301 + 49297) % 233280
          const w = 2 + (seed % 5)
          g.fillStyle = INK
          g.fillRect(x, y, w, 86)
          x += w + 2 + (seed % 4)
        }
        y += 130
      } else if (Array.isArray(line)) {
        g.fillStyle = INK
        g.font = `500 27px ${MONO}`
        g.textAlign = 'left'
        g.fillText(line[0], L, y)
        if (line[1]) {
          g.textAlign = 'right'
          g.fillText(line[1], R, y)
        }
        y += 40
      } else if ('big' in line) {
        y += 18
        g.fillStyle = INK
        g.font = `800 40px ${MONO}`
        g.textAlign = 'left'
        g.fillText(line.big[0], L, y)
        g.textAlign = 'right'
        g.fillText(line.big[1], R, y)
        y += 58
      } else {
        g.fillStyle = line.color ?? INK
        g.font = `${line.bold ? 900 : 500} ${line.size ?? 26}px ${line.bold ? 'system-ui, sans-serif' : MONO}`
        g.textAlign = 'center'
        g.fillText(line.center, TEX_W / 2, y + (line.size ? line.size * 0.3 : 0))
        y += (line.size ?? 26) + 16
      }
    }
    // tear line between receipts
    g.strokeStyle = 'rgba(29,32,30,.25)'
    g.setLineDash([4, 10])
    g.beginPath()
    g.moveTo(0, top + BLOCK_H - 2)
    g.lineTo(TEX_W, top + BLOCK_H - 2)
    g.stroke()
    g.setLineDash([])
  })
  return c
}

export default function ReceiptScene() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(4, 6, 8)
    scene.add(key)

    const rig = new THREE.Group()
    scene.add(rig)

    // --- paper
    const PAPER_W = 2.6
    const PAPER_L = 10
    const RECEIPT_LEN = PAPER_W * (BLOCK_H / TEX_W) // keep the texture's aspect
    const tex = new THREE.CanvasTexture(drawReceipts())
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapT = THREE.RepeatWrapping
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
    tex.repeat.set(1, PAPER_L / (RECEIPT_LEN * RECEIPTS.length))

    const geo = new THREE.PlaneGeometry(PAPER_W, PAPER_L, 1, 240)
    geo.translate(0, -PAPER_L / 2, 0)

    const uniforms = {
      uMap: { value: tex },
      uTime: { value: 0 },
      uOffset: { value: 0 },
      uRepeat: { value: tex.repeat.y },
      uDim: { value: 1 },
      uLen: { value: PAPER_L },
    }
    const paperMat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uLen;
        varying vec2 vUv;
        varying float vShade;
        varying float vS;
        void main() {
          vec3 p = position;
          float s = -p.y;                       // distance from the slot
          float curl = max(s - 5.2, 0.0);
          p.z += curl * curl * 0.12;            // the free end rolls toward us
          p.y += curl * curl * 0.045;
          float w = s / uLen;
          p.x += sin(uTime * 0.8 + s * 0.42) * 0.06 * w;
          p.z += sin(uTime * 1.25 + s * 0.65 + p.x) * 0.08 * w;
          float slope = 0.24 * curl;
          vShade = 1.0 - clamp(slope * 0.16, 0.0, 0.32) + p.x * 0.025;
          vS = s;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        uniform float uOffset;
        uniform float uRepeat;
        uniform float uDim;
        uniform float uLen;
        varying vec2 vUv;
        varying float vShade;
        varying float vS;
        void main() {
          vec3 c = texture2D(uMap, vec2(vUv.x, vUv.y * uRepeat + uOffset)).rgb;
          float shade = vShade * uDim;
          shade *= mix(0.45, 1.0, smoothstep(0.0, 0.7, vS));   // shadow right under the slot
          float a = 1.0 - smoothstep(uLen - 0.9, uLen, vS);
          gl_FragColor = vec4(c * shade, a);
          #include <colorspace_fragment>
        }`,
    })
    const paper = new THREE.Mesh(geo, paperMat)
    rig.add(paper)

    // --- printer body
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#16211b', roughness: 0.45, metalness: 0.2 })
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.95, 1.5), bodyMat)
    body.position.set(0, 0.47, 0)
    rig.add(body)
    const lidMat = new THREE.MeshStandardMaterial({ color: '#1f2d25', roughness: 0.35, metalness: 0.25 })
    const lid = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.12, 1.3), lidMat)
    lid.position.set(0, 1.0, 0)
    rig.add(lid)
    const slot = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.06, 0.2), new THREE.MeshBasicMaterial({ color: '#050806' }))
    slot.position.set(0, 0.0, 0)
    rig.add(slot)
    const ledMat = new THREE.MeshBasicMaterial({ color: '#02b856' })
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), ledMat)
    led.position.set(1.45, 0.62, 0.76)
    rig.add(led)

    const applyTheme = () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark'
      uniforms.uDim.value = dark ? 0.9 : 1
      bodyMat.color.set(dark ? '#1c2b23' : '#16211b')
      lidMat.color.set(dark ? '#26382e' : '#1f2d25')
    }
    applyTheme()
    window.addEventListener('themechange', applyTheme)

    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      const narrow = w < 560
      // frame from the printer lid down to where the paper curls away
      camera.position.set(narrow ? 0.4 : 0.8, narrow ? -2.6 : -2.9, narrow ? 19 : 17)
      camera.lookAt(0, narrow ? -3.1 : -3.3, 0)
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const mouse = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / innerWidth - 0.5) * 2
      mouse.y = (e.clientY / innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)

    // scrolling feeds paper
    let lastY = scrollY
    let boost = 0
    const onScroll = () => {
      boost = Math.min(boost + Math.abs(scrollY - lastY) * 0.0009, 0.35)
      lastY = scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const perReceipt = 1 / RECEIPTS.length // texture offset per receipt
    let printed = 0
    let blink = 0
    let raf = 0
    let running = true
    const clock = new THREE.Clock()
    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05)
      uniforms.uTime.value += dt
      boost *= 0.94
      uniforms.uOffset.value += dt * (0.028 + boost)

      const n = Math.floor(uniforms.uOffset.value / perReceipt)
      if (n > printed) {
        printed = n
        blink = 1
        const r = RECEIPTS[(n - 1) % RECEIPTS.length]
        window.dispatchEvent(new CustomEvent('zell:receipt', { detail: { total: r.total, newCustomer: r.newCustomer } }))
      }
      blink *= 0.93
      ledMat.color.setRGB(0.01 + blink * 0.7, 0.72 + blink * 0.28, 0.34 + blink * 0.5)

      rig.rotation.y += (-0.42 + mouse.x * 0.22 - rig.rotation.y) * 0.05
      rig.rotation.x += (0.06 + mouse.y * 0.06 - rig.rotation.x) * 0.05
      renderer.render(scene, camera)
      if (running && !reduce) raf = requestAnimationFrame(frame)
    }
    frame()

    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting
      cancelAnimationFrame(raf)
      if (running && !reduce) {
        clock.getDelta()
        raf = requestAnimationFrame(frame)
      }
    })
    io.observe(el)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('themechange', applyTheme)
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        ;(m.material as THREE.Material | undefined)?.dispose()
      })
      tex.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={host} className="receipt-scene" aria-hidden="true" />
}
