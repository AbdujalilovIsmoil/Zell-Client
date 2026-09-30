'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Ambient Three.js backdrop: a glowing emerald wire-crystal, orbiting rings and a
 * particle field. Reads the current theme so it looks right in light and dark.
 */
export default function HeroScene() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 9)

    const group = new THREE.Group()
    scene.add(group)

    const brand = new THREE.Color('#02b856')
    const light = new THREE.Color('#2fd580')

    const crystalMat = new THREE.MeshBasicMaterial({ color: brand, wireframe: true, transparent: true, opacity: 0.5 })
    const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(1.9, 1), crystalMat)
    group.add(crystal)

    const coreMat = new THREE.MeshBasicMaterial({ color: light, transparent: true, opacity: 0.14 })
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), coreMat)
    group.add(core)

    const ringMat = new THREE.MeshBasicMaterial({ color: brand, transparent: true, opacity: 0.35 })
    const rings = [2.9, 3.6].map((r, i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 160), ringMat)
      ring.rotation.x = Math.PI / 2.4 + i * 0.5
      ring.rotation.y = i * 0.7
      group.add(ring)
      return ring
    })

    const COUNT = 700
    const pos = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      const r = 4 + Math.random() * 9
      const a = Math.random() * Math.PI * 2
      const b = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(b) * Math.cos(a)
      pos[i * 3 + 1] = r * Math.sin(b) * Math.sin(a) * 0.6
      pos[i * 3 + 2] = r * Math.cos(b) - 2
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const pMat = new THREE.PointsMaterial({ color: light, size: 0.045, transparent: true, opacity: 0.8, depthWrite: false })
    const points = new THREE.Points(pGeo, pMat)
    scene.add(points)

    const applyTheme = () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark'
      const wide = window.innerWidth > 1100
      crystalMat.opacity = (dark ? 0.55 : 0.4) * (wide ? 1 : 0.5)
      coreMat.opacity = dark ? 0.16 : 0.12
      ringMat.opacity = (dark ? 0.4 : 0.3) * (wide ? 1 : 0.5)
      pMat.opacity = dark ? 0.85 : 0.55
      pMat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending
      pMat.needsUpdate = true
    }
    applyTheme()
    window.addEventListener('themechange', applyTheme)
    window.addEventListener('resize', applyTheme)

    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      // crystal sits beside the copy on wide screens, faint and centred behind it on small ones
      const wide = w > 1100
      group.position.set(wide ? 4.9 : 0, wide ? 0.6 : 1.9, wide ? -1 : -3)
      group.scale.setScalar(wide ? 1 : 0.75)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const mouse = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)

    let raf = 0
    const clock = new THREE.Clock()
    const frame = () => {
      const t = clock.getElapsedTime()
      crystal.rotation.y = t * 0.15
      crystal.rotation.x = t * 0.08
      core.rotation.y = -t * 0.2
      rings[0].rotation.z = t * 0.12
      rings[1].rotation.z = -t * 0.09
      points.rotation.y = t * 0.02
      group.rotation.y += (mouse.x * 0.35 - group.rotation.y) * 0.04
      group.rotation.x += (mouse.y * 0.2 - group.rotation.x) * 0.04
      renderer.render(scene, camera)
      if (!reduce) raf = requestAnimationFrame(frame)
    }
    frame()

    // pause when tab hidden
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduce) raf = requestAnimationFrame(frame)
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('themechange', applyTheme)
      window.removeEventListener('resize', applyTheme)
      document.removeEventListener('visibilitychange', onVis)
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
      })
      ;[crystalMat, coreMat, ringMat, pMat].forEach((m) => m.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={host} className="hero-scene" aria-hidden="true" />
}
