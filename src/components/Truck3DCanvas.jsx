import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import * as THREE from 'three'

/**
 * Procedural 3D Truck Canvas for United Logistics
 * Renders a high-fidelity European-style tractor + corrugated container trailer.
 * Supports smooth camera pitching from Side View (pitch = 0 rad) to Overhead View (pitch = PI/2 rad)
 * with zero gimbal lock, zero camera roll, and strictly horizontal longitudinal axis (+X facing right).
 * Precisely interpolates screen-space anchor from services wheel baseline (46vh) to highway centerline (22.2vh).
 */
const Truck3DCanvas = forwardRef(function Truck3DCanvas(
  {
    initialPitch = 0,
    className = '',
    style = {},
  },
  ref
) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const wheelsRef = useRef([])
  const truckGroupRef = useRef(null)
  const animFrameRef = useRef(null)

  // Internal animation state
  const stateRef = useRef({
    pitch: initialPitch,
    wheelRotation: 0,
    opacity: 0,
    yOffset: 0,
    xOffset: 0,
  })

  // Expose imperative GSAP-friendly controls
  useImperativeHandle(ref, () => ({
    setPitch: (p) => {
      stateRef.current.pitch = Math.max(0, Math.min(Math.PI / 2, p))
    },
    setWheelRotation: (r) => {
      stateRef.current.wheelRotation = r
    },
    setOpacity: (o) => {
      stateRef.current.opacity = Math.max(0, Math.min(1, o))
      if (containerRef.current) {
        containerRef.current.style.opacity = o
      }
    },
    setOffsets: (x, y) => {
      stateRef.current.xOffset = x
      stateRef.current.yOffset = y
    },
    getState: () => stateRef.current,
  }))

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    // 1. Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // 2. Orthographic Camera (keeps projected truck length constant during pitch)
    const aspect = width / height
    const viewSize = 15.2 // Frustum height tailored to match 2D truck scale perfectly
    const camera = new THREE.OrthographicCamera(
      (-viewSize * aspect) / 2,
      (viewSize * aspect) / 2,
      viewSize / 2,
      -viewSize / 2,
      0.1,
      120
    )
    cameraRef.current = camera

    // 3. Renderer with transparent background
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = false
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // 4. Studio Lighting tailored for rich metallic cab highlights and corrugated ribs
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfffcf5, 1.6)
    keyLight.position.set(18, 28, 22)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xe8f0fe, 0.85)
    fillLight.position.set(-18, 16, -18)
    scene.add(fillLight)

    const topLight = new THREE.DirectionalLight(0xffffff, 1.15)
    topLight.position.set(0, 35, 0)
    scene.add(topLight)

    // 5. Build Procedural 3D Truck Model
    const truckGroup = new THREE.Group()
    truckGroupRef.current = truckGroup
    scene.add(truckGroup)

    const wheels = []

    // ── Helper: Ultra-Sharp Canvas Corrugated Textures ──
    const createCorrugationTexture = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1024
      canvas.height = 512
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = '#EAE6DB' // Ivory base
      ctx.fillRect(0, 0, 1024, 512)

      // Vertical corrugated ribs with crisp bevel gradients
      const ribWidth = 32
      for (let x = 0; x < 1024; x += ribWidth) {
        ctx.fillStyle = '#F8F5EC'
        ctx.fillRect(x, 0, ribWidth * 0.45, 512)
        const grad = ctx.createLinearGradient(x + ribWidth * 0.45, 0, x + ribWidth, 0)
        grad.addColorStop(0, '#D2CCC0')
        grad.addColorStop(1, '#BEB8A8')
        ctx.fillStyle = grad
        ctx.fillRect(x + ribWidth * 0.45, 0, ribWidth * 0.55, 512)
      }

      // Top and bottom extruded aluminum rail trim
      ctx.fillStyle = '#C8C2B0'
      ctx.fillRect(0, 0, 1024, 16)
      ctx.fillRect(0, 496, 1024, 16)

      const tex = new THREE.CanvasTexture(canvas)
      tex.wrapS = THREE.RepeatWrapping
      tex.wrapT = THREE.RepeatWrapping
      tex.repeat.set(2, 1)
      return tex
    }

    const createRoofCorrugationTexture = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1024
      canvas.height = 256
      const ctx = canvas.getContext('2d')

      ctx.fillStyle = '#DFD9CB'
      ctx.fillRect(0, 0, 1024, 256)

      // Transverse ribs across the roof
      const ribWidth = 24
      for (let x = 0; x < 1024; x += ribWidth) {
        ctx.fillStyle = '#EDE8DC'
        ctx.fillRect(x, 0, ribWidth * 0.5, 256)
        ctx.fillStyle = '#C5BDAE'
        ctx.fillRect(x + ribWidth * 0.5, 0, ribWidth * 0.5, 256)
      }

      const tex = new THREE.CanvasTexture(canvas)
      tex.wrapS = THREE.RepeatWrapping
      tex.wrapT = THREE.RepeatWrapping
      tex.repeat.set(3, 1)
      return tex
    }

    const sideTex = createCorrugationTexture()
    const roofTex = createRoofCorrugationTexture()

    // ── Materials ──
    const containerSideMat = new THREE.MeshStandardMaterial({
      map: sideTex,
      roughness: 0.45,
      metalness: 0.12,
    })
    const containerRoofMat = new THREE.MeshStandardMaterial({
      map: roofTex,
      roughness: 0.55,
      metalness: 0.12,
    })
    const containerEndMat = new THREE.MeshStandardMaterial({
      color: 0xDCD7C8,
      roughness: 0.50,
      metalness: 0.15,
    })

    const containerMats = [
      containerEndMat,  // +X (front facing cab)
      containerEndMat,  // -X (rear doors)
      containerRoofMat, // +Y (roof)
      containerEndMat,  // -Y (bottom)
      containerSideMat, // +Z (right side)
      containerSideMat, // -Z (left side)
    ]

    // A. 40ft Shipping Container (Length: 10.8, Height: 2.7, Width: 2.3)
    const containerGeo = new THREE.BoxGeometry(10.8, 2.7, 2.3)
    const containerMesh = new THREE.Mesh(containerGeo, containerMats)
    containerMesh.position.set(-2.2, 2.45, 0)
    truckGroup.add(containerMesh)

    // Corner castings / corner blocks (8 corners)
    const cornerMat = new THREE.MeshStandardMaterial({ color: 0x24262A, roughness: 0.7 })
    const cornerGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24)
    const cornerPositions = [
      [-7.6, 1.12, -1.15], [-7.6, 1.12, 1.15], [-7.6, 3.78, -1.15], [-7.6, 3.78, 1.15],
      [3.2, 1.12, -1.15],  [3.2, 1.12, 1.15],  [3.2, 3.78, -1.15],  [3.2, 3.78, 1.15],
    ]
    cornerPositions.forEach(([cx, cy, cz]) => {
      const c = new THREE.Mesh(cornerGeo, cornerMat)
      c.position.set(cx, cy, cz)
      truckGroup.add(c)
    })

    // Rear container door lock rods (2 vertical steel rods at rear -X)
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x1A1C1F, metalness: 0.8, roughness: 0.3 })
    const rodGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.5, 12)
    ;[-0.5, 0.5].forEach((rz) => {
      const rod = new THREE.Mesh(rodGeo, rodMat)
      rod.position.set(-7.61, 2.45, rz)
      truckGroup.add(rod)
    })

    // B. Trailer Chassis (Dark Steel Frame)
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x1E2024, roughness: 0.6, metalness: 0.4 })
    const trailerBeamGeo = new THREE.BoxGeometry(11.2, 0.22, 1.8)
    const trailerBeam = new THREE.Mesh(trailerBeamGeo, chassisMat)
    trailerBeam.position.set(-2.1, 1.0, 0)
    truckGroup.add(trailerBeam)

    // Underrun protection side bars (white/silver side rails)
    const guardMat = new THREE.MeshStandardMaterial({ color: 0xE8ECF0, roughness: 0.3, metalness: 0.6 })
    const guardGeo = new THREE.BoxGeometry(3.6, 0.08, 0.04)
    ;[-1, 1].forEach((side) => {
      const g1 = new THREE.Mesh(guardGeo, guardMat)
      g1.position.set(-0.8, 0.65, side * 1.08)
      truckGroup.add(g1)
      const g2 = new THREE.Mesh(guardGeo, guardMat)
      g2.position.set(-0.8, 0.48, side * 1.08)
      truckGroup.add(g2)
    })

    // C. Tractor Unit / Cab (Dark Metallic Charcoal #202226)
    const cabMat = new THREE.MeshStandardMaterial({
      color: 0x202226,
      roughness: 0.28,
      metalness: 0.50,
    })

    // Main Cab Body Box
    const cabBodyGeo = new THREE.BoxGeometry(2.9, 2.7, 2.3)
    const cabBody = new THREE.Mesh(cabBodyGeo, cabMat)
    cabBody.position.set(4.35, 2.25, 0)
    truckGroup.add(cabBody)

    // Aerodynamic Roof Fairing / Deflector
    const roofFairingGeo = new THREE.BoxGeometry(2.5, 0.55, 2.24)
    const roofFairing = new THREE.Mesh(roofFairingGeo, cabMat)
    roofFairing.position.set(4.25, 3.82, 0)
    truckGroup.add(roofFairing)

    // Windshield (Tinted Glossy Glass)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0A0D11,
      roughness: 0.05,
      metalness: 0.90,
    })
    const windshieldGeo = new THREE.BoxGeometry(0.12, 1.05, 2.05)
    const windshield = new THREE.Mesh(windshieldGeo, glassMat)
    windshield.position.set(5.81, 2.65, 0)
    windshield.rotation.z = -0.15
    truckGroup.add(windshield)

    // Side Windows
    const sideWindowGeo = new THREE.BoxGeometry(1.2, 0.72, 0.05)
    ;[-1, 1].forEach((side) => {
      const sw = new THREE.Mesh(sideWindowGeo, glassMat)
      sw.position.set(4.65, 2.72, side * 1.16)
      truckGroup.add(sw)
    })

    // Front Grille with Chrome Bars
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x16181B, roughness: 0.8 })
    const grilleGeo = new THREE.BoxGeometry(0.08, 1.1, 1.85)
    const grille = new THREE.Mesh(grilleGeo, grilleMat)
    grille.position.set(5.82, 1.35, 0)
    truckGroup.add(grille)

    // Chrome Trim slats
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xDFE3E8, metalness: 0.95, roughness: 0.15 })
    for (let i = 0; i < 3; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 1.6), chromeMat)
      slat.position.set(5.83, 1.15 + i * 0.22, 0)
      truckGroup.add(slat)
    }

    // Headlights (Dual Crisp White LED Clusters)
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      emissive: 0xD0E2FF,
      emissiveIntensity: 0.65,
      roughness: 0.1,
    })
    ;[-1, 1].forEach((side) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.35), lightMat)
      hl.position.set(5.82, 0.92, side * 0.82)
      truckGroup.add(hl)
    })

    // Side Mirrors
    const mirrorMat = new THREE.MeshStandardMaterial({ color: 0x181A1D, roughness: 0.5 })
    const mirrorGlassMat = new THREE.MeshStandardMaterial({ color: 0xC0C8D0, metalness: 0.95, roughness: 0.05 })
    ;[-1, 1].forEach((side) => {
      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.32), mirrorMat)
      bracket.position.set(5.45, 2.7, side * 1.28)
      truckGroup.add(bracket)

      const mirrorBody = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.18), mirrorMat)
      mirrorBody.position.set(5.45, 2.65, side * 1.44)
      truckGroup.add(mirrorBody)

      const mirrorFace = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.46), mirrorGlassMat)
      mirrorFace.position.set(5.40, 2.65, side * 1.44)
      mirrorFace.rotation.y = -Math.PI / 2
      truckGroup.add(mirrorFace)
    })

    // D. Wheel Assemblies (Triple Trailer Axle + Tractor Drive & Steer Axles)
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x161719, roughness: 0.85 })
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xC8CCD2, metalness: 0.85, roughness: 0.22 })
    const hubCapMat = new THREE.MeshStandardMaterial({ color: 0x32353A, metalness: 0.5, roughness: 0.5 })

    const tireGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.28, 28)
    const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.29, 24)
    const hubGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.30, 16)

    const createWheel = (x, y, z) => {
      const wheelGroup = new THREE.Group()
      wheelGroup.position.set(x, y, z)

      const tire = new THREE.Mesh(tireGeo, tireMat)
      tire.rotation.x = Math.PI / 2
      wheelGroup.add(tire)

      const rim = new THREE.Mesh(rimGeo, rimMat)
      rim.rotation.x = Math.PI / 2
      wheelGroup.add(rim)

      const hub = new THREE.Mesh(hubGeo, hubCapMat)
      hub.rotation.x = Math.PI / 2
      wheelGroup.add(hub)

      truckGroup.add(wheelGroup)
      wheels.push(wheelGroup)
    }

    // Trailer Triple Rear Axles (X = -6.8, -5.5, -4.2; Y = 0.48)
    const trailerAxleXs = [-6.8, -5.5, -4.2]
    trailerAxleXs.forEach((x) => {
      createWheel(x, 0.48, -1.02)
      createWheel(x, 0.48, 1.02)
    })

    // Tractor Drive Axle (X = 3.3; Y = 0.48)
    createWheel(3.3, 0.48, -1.02)
    createWheel(3.3, 0.48, 1.02)

    // Tractor Front Steer Axle (X = 5.2; Y = 0.48)
    createWheel(5.2, 0.48, -1.02)
    createWheel(5.2, 0.48, 1.02)

    wheelsRef.current = wheels

    // E. Contact Shadow on Road (soft radial shadow under wheels)
    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 512
    shadowCanvas.height = 128
    const sCtx = shadowCanvas.getContext('2d')
    const shadowGrad = sCtx.createRadialGradient(256, 64, 10, 256, 64, 250)
    shadowGrad.addColorStop(0, 'rgba(15, 15, 15, 0.80)')
    shadowGrad.addColorStop(0.6, 'rgba(15, 15, 15, 0.30)')
    shadowGrad.addColorStop(1, 'rgba(15, 15, 15, 0)')
    sCtx.fillStyle = shadowGrad
    sCtx.fillRect(0, 0, 512, 128)

    const shadowTex = new THREE.CanvasTexture(shadowCanvas)
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    })
    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(14.5, 3.8), shadowMat)
    shadowPlane.rotation.x = -Math.PI / 2
    shadowPlane.position.set(-0.6, 0.01, 0)
    truckGroup.add(shadowPlane)

    // Center truck longitudinal center around origin
    truckGroup.position.x = 0.9

    // ── Animation / Render Loop ──
    const D = 28 // Camera orbit distance

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render)

      const { pitch: p, wheelRotation: wRot, xOffset, yOffset } = stateRef.current

      // Rotate wheel meshes
      wheels.forEach((w) => {
        w.rotation.z = wRot
      })

      // Normalized pitch progress u in [0, 1]
      const u = p / (Math.PI / 2)

      // Screen-space anchor interpolation:
      // Side view (u=0): wheels rest on black surface boundary at 46vh -> target lookY = -0.55
      // Top view (u=1): truck center aligns with road centerline at 22.2vh -> target lookZ = 3.83
      const lookY = -0.55 + u * (1.90 - (-0.55))
      const lookZ = u * 3.83

      // Camera position orbiting in Y-Z plane
      const camY = lookY + D * Math.sin(p)
      const camZ = lookZ + D * Math.cos(p)

      camera.position.set(0 + xOffset, camY + yOffset, camZ)
      camera.lookAt(0 + xOffset, lookY + yOffset, lookZ)

      // Stable Up vector transition ensuring zero roll and strictly right-facing cab (+X)
      camera.up.set(0, Math.cos(p), -Math.sin(p))

      renderer.render(scene, camera)
    }

    render()

    // ── Handle Window Resize ──
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return
      const w = containerRef.current.clientWidth || window.innerWidth
      const h = containerRef.current.clientHeight || window.innerHeight
      const asp = w / h
      camera.left = (-viewSize * asp) / 2
      camera.right = (viewSize * asp) / 2
      camera.top = viewSize / 2
      camera.bottom = -viewSize / 2
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`truck-3d-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 12,
        ...style,
      }}
    />
  )
})

export default Truck3DCanvas
