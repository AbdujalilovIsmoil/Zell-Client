'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * A checkout counter: products ride the belt through a barcode scanner, each
 * scan flashes the laser green, floats a price tag and adds to the POS screen.
 * Items drop into the bag; when the basket is done the screen shows "To'landi"
 * and `zell:receipt` fires so the hero flow and ticker update.
 */

type Kind = 'phone' | 'powerbank' | 'speaker' | 'can' | 'bread' | 'milk' | 'apples' | 'tea' | 'eggs'
type Item = { name: string; price: number; qty: string; kind: Kind }

const BASKETS: { total: number; newCustomer: boolean; items: Item[] }[] = [
  {
    total: 6_660_000,
    newCustomer: true,
    items: [
      { name: 'Samsung Galaxy A55', price: 4_290_000, qty: '1', kind: 'phone' },
      { name: 'Anker powerbank', price: 798_000, qty: '2', kind: 'powerbank' },
      { name: 'JBL Flip 6', price: 1_650_000, qty: '1', kind: 'speaker' },
      { name: 'Coca-Cola 1,5 L', price: 42_000, qty: '3', kind: 'can' },
    ],
  },
  {
    total: 125_000,
    newCustomer: false,
    items: [
      { name: 'Non (tandir)', price: 20_000, qty: '4', kind: 'bread' },
      { name: 'Sut 1 L', price: 27_000, qty: '2', kind: 'milk' },
      { name: 'Olma, 1,5 kg', price: 27_000, qty: '1,5', kind: 'apples' },
      { name: 'Choy Ahmad', price: 32_000, qty: '1', kind: 'tea' },
      { name: 'Tuxum, 10 dona', price: 19_000, qty: '1', kind: 'eggs' },
    ],
  },
]

const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/ |,/g, ' ')
const SANS = 'system-ui, -apple-system, "Segoe UI", sans-serif'

/* ---------- product meshes ---------- */
function std(color: string, rough = 0.5, metal = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal })
}
function labelTex(draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, w = 256, h = 256) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!, w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function makeProduct(kind: Kind): THREE.Object3D {
  const g = new THREE.Group()
  const add = (m: THREE.Mesh) => {
    m.castShadow = true
    m.receiveShadow = true
    g.add(m)
    return m
  }
  switch (kind) {
    case 'phone': {
      // white retail box with a green band on top
      const top = labelTex((c, w, h) => {
        c.fillStyle = '#f4f4f1'
        c.fillRect(0, 0, w, h)
        c.fillStyle = '#111'
        c.font = `700 34px ${SANS}`
        c.textAlign = 'center'
        c.fillText('Galaxy A55', w / 2, h / 2 + 10)
      })
      const side = std('#f1f1ee', 0.35)
      const mats = [side, side, new THREE.MeshStandardMaterial({ map: top, roughness: 0.35 }), side, side, side]
      add(new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.2, 1.05), mats)).position.y = 0.1
      break
    }
    case 'powerbank':
      add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.7), std('#23262b', 0.4, 0.3))).position.y = 0.09
      add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.7), std('#23262b', 0.4, 0.3))).position.set(0.05, 0.27, 0.04)
      break
    case 'speaker': {
      const m = add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.9, 32), std('#0f7f86', 0.8)))
      m.rotation.x = Math.PI / 2
      m.position.y = 0.2
      const cap = std('#1b1d1f', 0.5)
      ;[-0.46, 0.46].forEach((z) => {
        const c = add(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 32), cap))
        c.rotation.x = Math.PI / 2
        c.position.set(0, 0.2, z)
      })
      break
    }
    case 'can': {
      const lab = labelTex((c, w, h) => {
        c.fillStyle = '#d01f26'
        c.fillRect(0, 0, w, h)
        c.fillStyle = '#fff'
        c.font = `italic 700 54px ${SANS}`
        c.textAlign = 'center'
        c.fillText('Cola', w / 2, h / 2 + 18)
      }, 256, 128)
      const body = new THREE.MeshStandardMaterial({ map: lab, roughness: 0.3, metalness: 0.3 })
      const lid = std('#c9ccd0', 0.25, 0.9)
      ;[-0.22, 0.02, 0.26].forEach((z, i) => {
        const m = add(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.46, 28), [body, lid, lid]))
        m.position.set(i === 1 ? 0.12 : -0.02, 0.23, z)
      })
      break
    }
    case 'bread': {
      const m = add(new THREE.Mesh(new THREE.SphereGeometry(0.38, 32, 16), std('#c98a3d', 0.85)))
      m.scale.set(1, 0.32, 1)
      m.position.y = 0.12
      const r = add(new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.07, 12, 32), std('#a8692a', 0.85)))
      r.rotation.x = Math.PI / 2
      r.position.y = 0.19
      break
    }
    case 'milk': {
      const lab = labelTex((c, w, h) => {
        c.fillStyle = '#f7f7f4'
        c.fillRect(0, 0, w, h)
        c.fillStyle = '#1e5bd8'
        c.fillRect(0, h * 0.55, w, h * 0.45)
        c.fillStyle = '#fff'
        c.font = `700 46px ${SANS}`
        c.textAlign = 'center'
        c.fillText('SUT', w / 2, h * 0.84)
      })
      const m = new THREE.MeshStandardMaterial({ map: lab, roughness: 0.55 })
      add(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.62, 0.34), m)).position.y = 0.31
      const roof = add(new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.25, 0.16, 4, 1), std('#f2f2ef', 0.55)))
      roof.rotation.y = Math.PI / 4
      roof.position.y = 0.7
      break
    }
    case 'apples': {
      const red = std('#c3262e', 0.35)
      ;[
        [-0.14, 0.14, -0.1],
        [0.14, 0.14, 0.05],
        [0, 0.14, 0.22],
        [0.02, 0.36, 0.04],
      ].forEach(([x, y, z]) => add(new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 16), red)).position.set(x, y, z))
      break
    }
    case 'tea': {
      const lab = labelTex((c, w, h) => {
        c.fillStyle = '#6b1d1d'
        c.fillRect(0, 0, w, h)
        c.fillStyle = '#e8c36a'
        c.font = `700 40px ${SANS}`
        c.textAlign = 'center'
        c.fillText('TEA', w / 2, h / 2 + 14)
      })
      add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.32), new THREE.MeshStandardMaterial({ map: lab, roughness: 0.5 }))).position.y = 0.15
      break
    }
    case 'eggs': {
      add(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.95), std('#b9ab94', 0.95))).position.y = 0.07
      const egg = std('#efe3cf', 0.6)
      for (let i = 0; i < 2; i++)
        for (let j = 0; j < 4; j++) {
          const e = add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), egg))
          e.scale.set(1, 1.25, 1)
          e.position.set(-0.12 + i * 0.24, 0.2, -0.34 + j * 0.22)
        }
      break
    }
  }
  return g
}

export default function CheckoutScene() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTex
    scene.environmentIntensity = 0.45

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x1a2a20, 0.6))
    const sun = new THREE.DirectionalLight(0xffffff, 1.6)
    sun.position.set(-3, 9, 5)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -8
    sun.shadow.camera.right = 8
    sun.shadow.camera.top = 8
    sun.shadow.camera.bottom = -8
    sun.shadow.radius = 6
    sun.shadow.bias = -0.0005
    scene.add(sun)

    const rig = new THREE.Group()
    scene.add(rig)

    // ground that only receives shadow, so the counter sits on the page
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.18 }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -1.6
    ground.receiveShadow = true
    rig.add(ground)

    /* ---------- counter + belt ---------- */
    const LEN = 8
    const counterMat = std('#0f1813', 0.55, 0.15)
    const counter = new THREE.Mesh(new THREE.BoxGeometry(LEN + 0.6, 1.6, 2.4), counterMat)
    counter.position.set(0, -0.8, 0)
    counter.castShadow = counter.receiveShadow = true
    rig.add(counter)
    const trimMat = std('#02b856', 0.45, 0.1)
    const trim = new THREE.Mesh(new THREE.BoxGeometry(LEN + 0.62, 0.08, 2.42), trimMat)
    trim.position.set(0, -0.22, 0)
    rig.add(trim)

    const beltCanvas = document.createElement('canvas')
    beltCanvas.width = 64
    beltCanvas.height = 64
    {
      const g = beltCanvas.getContext('2d')!
      g.fillStyle = '#0f1110'
      g.fillRect(0, 0, 64, 64)
      g.fillStyle = '#1c1f1d'
      g.fillRect(0, 0, 6, 64)
    }
    const beltTex = new THREE.CanvasTexture(beltCanvas)
    beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping
    beltTex.repeat.set(LEN * 3, 1)
    const belt = new THREE.Mesh(new THREE.BoxGeometry(LEN, 0.06, 1.5), new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.9 }))
    belt.position.set(0, 0.03, 0)
    belt.receiveShadow = true
    rig.add(belt)
    // steel rails either side of the belt
    const steel = std('#aab3ae', 0.3, 0.9)
    ;[-0.82, 0.82].forEach((z) => {
      const r = new THREE.Mesh(new THREE.BoxGeometry(LEN, 0.14, 0.1), steel)
      r.position.set(0, 0.07, z)
      r.castShadow = true
      rig.add(r)
    })

    /* ---------- scanner tower + laser ---------- */
    const SCAN_X = 0.4
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.5, 0.35), std('#101713', 0.35, 0.3))
    tower.position.set(SCAN_X, 0.75, -1.05)
    tower.castShadow = true
    rig.add(tower)
    const glassMat = new THREE.MeshStandardMaterial({ color: '#0b0f0d', roughness: 0.05, metalness: 0.2, emissive: new THREE.Color('#ff2a2a'), emissiveIntensity: 0.35 })
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.02), glassMat)
    glass.position.set(SCAN_X, 0.55, -0.87)
    rig.add(glass)
    const laserMat = new THREE.MeshBasicMaterial({ color: '#ff3030', transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    const laser = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.9), laserMat)
    laser.rotation.y = Math.PI / 2
    laser.position.set(SCAN_X, 0.5, -0.02)
    rig.add(laser)
    const lineMat = new THREE.MeshBasicMaterial({ color: '#ff3b3b', transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 1.5), lineMat)
    line.rotation.x = -Math.PI / 2
    line.position.set(SCAN_X, 0.065, 0)
    rig.add(line)

    /* ---------- POS screen ---------- */
    const screenCanvas = document.createElement('canvas')
    screenCanvas.width = 560
    screenCanvas.height = 380
    const screenTex = new THREE.CanvasTexture(screenCanvas)
    screenTex.colorSpace = THREE.SRGBColorSpace
    const drawScreen = (lines: { name: string; price: number }[], total: number, paid: boolean) => {
      const g = screenCanvas.getContext('2d')!
      const W = screenCanvas.width
      const H = screenCanvas.height
      g.fillStyle = '#07100b'
      g.fillRect(0, 0, W, H)
      g.fillStyle = '#02b856'
      g.font = `800 30px ${SANS}`
      g.textAlign = 'left'
      g.fillText('ZELL', 28, 50)
      g.fillStyle = '#6f8277'
      g.font = `500 20px ${SANS}`
      g.textAlign = 'right'
      g.fillText('Kassa 2', W - 28, 48)
      g.fillStyle = 'rgba(255,255,255,.08)'
      g.fillRect(28, 70, W - 56, 2)
      g.font = `500 24px ${SANS}`
      lines.slice(-4).forEach((l, i) => {
        const y = 112 + i * 38
        g.fillStyle = '#dfe9e2'
        g.textAlign = 'left'
        g.fillText(l.name, 28, y)
        g.textAlign = 'right'
        g.fillText(fmt(l.price), W - 28, y)
      })
      g.fillStyle = 'rgba(255,255,255,.08)'
      g.fillRect(28, H - 110, W - 56, 2)
      g.fillStyle = paid ? '#02b856' : '#8fa197'
      g.font = `600 22px ${SANS}`
      g.textAlign = 'left'
      g.fillText(paid ? "✓ To'landi" : 'Jami', 28, H - 44)
      g.fillStyle = '#ffffff'
      g.font = `700 44px ${SANS}`
      g.textAlign = 'right'
      g.fillText(`${fmt(total)} so'm`, W - 28, H - 40)
      screenTex.needsUpdate = true
    }
    const pos = new THREE.Group()
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 16), steel)
    pole.position.y = 0.5
    pos.add(pole)
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(2.25, 1.55, 0.08), std('#0d1310', 0.35, 0.4))
    bezel.position.y = 1.6
    bezel.castShadow = true
    pos.add(bezel)
    const display = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.43), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }))
    display.position.set(0, 1.6, 0.045)
    pos.add(display)
    pos.position.set(LEN / 2 - 1.1, 0, -1.2)
    pos.rotation.y = 0.5 // face the camera
    rig.add(pos)

    /* ---------- bag at the end ---------- */
    const BAG_X = LEN / 2 + 0.9
    const bagMat = std('#d9c39a', 0.95)
    const bag = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.7, 1.1, 4, 1, true), bagMat)
    bag.rotation.y = Math.PI / 4
    bag.position.set(BAG_X, -0.25, 0)
    bag.castShadow = true
    ;(bag.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide
    rig.add(bag)
    const bagPrint = labelTex((c, w, h) => {
      c.clearRect(0, 0, w, h)
      c.fillStyle = '#02b856'
      c.font = `800 64px ${SANS}`
      c.textAlign = 'center'
      c.fillText('ZELL', w / 2, h / 2 + 22)
    }, 256, 128)
    const bagLogo = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), new THREE.MeshBasicMaterial({ map: bagPrint, transparent: true }))
    bagLogo.position.set(BAG_X, -0.2, 0.53)
    bagLogo.rotation.y = 0
    rig.add(bagLogo)

    /* ---------- theme ---------- */
    const applyTheme = () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark'
      counterMat.color.set(dark ? '#122019' : '#0f1813')
      ;(ground.material as THREE.ShadowMaterial).opacity = dark ? 0.35 : 0.14
      renderer.toneMappingExposure = dark ? 1.15 : 1.02
    }
    applyTheme()
    window.addEventListener('themechange', applyTheme)

    /* ---------- camera fit ---------- */
    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      const portrait = w / h < 0.9
      const d = w < 560 ? 17 : portrait ? 25 : 21
      camera.position.set(d * 0.5 + 0.5, d * 0.46, d * 0.74)
      camera.lookAt(1.4, 0, 0)
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

    /* ---------- basket state machine ---------- */
    type Live = { obj: THREE.Object3D; item: Item; x: number; scanned: boolean; bagged: number }
    type Tag = { sprite: THREE.Sprite; tex: THREE.Texture; life: number }
    let live: Live[] = []
    const tags: Tag[] = []
    let basketIdx = 0
    let scannedLines: { name: string; price: number }[] = []
    let total = 0
    let paidTimer = -1
    let flash = 0
    const SPEED = 1.15
    const START_X = -LEN / 2 - 0.6

    const spawnBasket = () => {
      const b = BASKETS[basketIdx % BASKETS.length]
      live = b.items.map((item, i) => {
        const obj = makeProduct(item.kind)
        obj.rotation.y = (Math.random() - 0.5) * 0.5
        const x = START_X - i * 1.45
        obj.position.set(x, 0.06, (Math.random() - 0.5) * 0.3)
        rig.add(obj)
        return { obj, item, x, scanned: false, bagged: 0 }
      })
      scannedLines = []
      total = 0
      drawScreen([], 0, false)
    }

    const addTag = (text: string, x: number, y: number) => {
      const tex = labelTex((c, w, h) => {
        c.clearRect(0, 0, w, h)
        c.fillStyle = '#02b856'
        const r = h / 2
        c.beginPath()
        c.roundRect(4, 4, w - 8, h - 8, r - 4)
        c.fill()
        c.fillStyle = '#03210f'
        c.font = `700 40px ${SANS}`
        c.textAlign = 'center'
        c.textBaseline = 'middle'
        c.fillText(text, w / 2, h / 2 + 2)
      }, 380, 84)
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }))
      sprite.scale.set(1.5, 0.33, 1)
      sprite.position.set(x, y, 0)
      sprite.renderOrder = 10
      rig.add(sprite)
      tags.push({ sprite, tex, life: 0 })
    }

    spawnBasket()

    const beltEdge = LEN / 2 - 0.2
    let raf = 0
    let running = true
    const clock = new THREE.Clock()
    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime

      if (paidTimer < 0) {
        beltTex.offset.x -= dt * SPEED * 3 // 3 stripes per world unit, moving with the items
        for (const p of live) {
          if (p.bagged > 0) {
            // falling into the bag
            p.bagged += dt
            const k = Math.min(p.bagged / 0.55, 1)
            p.obj.position.x += (BAG_X - p.obj.position.x) * 0.2
            p.obj.position.y = 0.06 + 0.5 * Math.sin(k * Math.PI) - k * 0.9
            p.obj.scale.setScalar(1 - k * 0.35)
            p.obj.visible = k < 1
            continue
          }
          p.x += dt * SPEED
          p.obj.position.x = p.x
          if (!p.scanned && p.x >= SCAN_X) {
            p.scanned = true
            flash = 1
            scannedLines.push({ name: p.item.name, price: p.item.price })
            total += p.item.price
            drawScreen(scannedLines, total, false)
            addTag(`+${fmt(p.item.price)}`, SCAN_X, 1.3)
          }
          if (p.x > beltEdge) p.bagged = 0.0001
        }
        if (live.every((p) => p.bagged >= 0.55)) {
          const b = BASKETS[basketIdx % BASKETS.length]
          drawScreen(scannedLines, total, true)
          window.dispatchEvent(new CustomEvent('zell:receipt', { detail: { total: b.total, newCustomer: b.newCustomer } }))
          paidTimer = 0
        }
      } else {
        paidTimer += dt
        bag.scale.y = 1 + Math.sin(Math.min(paidTimer * 6, Math.PI)) * 0.06
        if (paidTimer > 1.6) {
          live.forEach((p) => {
            rig.remove(p.obj)
            p.obj.traverse((o) => (o as THREE.Mesh).geometry?.dispose())
          })
          basketIdx++
          paidTimer = -1
          spawnBasket()
        }
      }

      // laser: idle red shimmer, green flash on scan
      flash *= 0.9
      const idle = 0.16 + Math.sin(t * 12) * 0.03
      laserMat.opacity = idle + flash * 0.35
      laserMat.color.setRGB(1 - flash, 0.19 + flash * 0.53, 0.19 + flash * 0.15)
      lineMat.color.copy(laserMat.color)
      glassMat.emissive.copy(laserMat.color)

      for (let i = tags.length - 1; i >= 0; i--) {
        const tg = tags[i]
        tg.life += dt
        tg.sprite.position.y = 1.3 + tg.life * 0.9
        tg.sprite.material.opacity = 1 - Math.max(0, tg.life - 0.7) / 0.6
        if (tg.life > 1.3) {
          rig.remove(tg.sprite)
          tg.sprite.material.dispose()
          tg.tex.dispose()
          tags.splice(i, 1)
        }
      }

      rig.rotation.y += (mouse.x * 0.12 - rig.rotation.y) * 0.04
      rig.rotation.x += (mouse.y * 0.04 - rig.rotation.x) * 0.04
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
      window.removeEventListener('themechange', applyTheme)
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        ;(Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
          ;(x as THREE.MeshStandardMaterial).map?.dispose()
          x.dispose()
        })
      })
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={host} className="receipt-scene" aria-hidden="true" />
}
