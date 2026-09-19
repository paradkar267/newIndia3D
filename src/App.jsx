import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

const BASE_URL = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
const assetUrl = (path) => `${BASE_URL}${path.replace(/^\//, '')}`

// SVG viewBox for Crane/Side-View Stage: 0 -320 3950 1380 (Ground baseline at Y = 900)
const TRUCK_WAIT_X   = 5800   // Far off-screen to right, rolls in only when user scrolls
const TRUCK_LOAD_X   = 1866   // Precise loading spot underneath hoisted container
const TRUCK_CENTER_X = 1054   // Exact horizontal center: (3950 - 1842) / 2

// Open Service Columns (Scene 1)
const SERVICES = [
  {
    id: 'road',
    title: 'ROAD FREIGHT',
    desc: 'Scheduled full-truckload (FTL) and express less-than-truckload (LTL) operations backed by live telemetry and automated dispatch routing.',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: 'ocean',
    title: 'OCEAN FREIGHT',
    desc: 'FCL, LCL, and specialised cargo movements, with structured carrier selection and routing for cost and schedule reliability.',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M2 18c2 1 4 1 6 0 2-1 4-1 6 0 2 1 4 1 6 0" />
        <path d="M4 14l2-8h12l2 8z" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="9" y1="4" x2="15" y2="4" />
      </svg>
    ),
  },
  {
    id: 'customs',
    title: 'CUSTOMS BROKERAGE',
    desc: 'In-house licensed brokerage covering classification, compliance, bonded warehousing, and automated customs release.',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10M7 12h6M7 16h4" />
        <circle cx="16" cy="15" r="2.5" />
        <path d="M18 17l2 2" />
      </svg>
    ),
  },
  {
    id: 'warehousing',
    title: 'WAREHOUSING & 3PL',
    desc: 'Scalable storage, pick and pack, and distribution hubs fully integrated with multimodal freight transport operations.',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 21V9l9-6 9 6v12H3z" />
        <path d="M9 21v-8h6v8" />
        <path d="M9 9h6" />
      </svg>
    ),
  },
  {
    id: 'project',
    title: 'PROJECT CARGO',
    desc: 'Engineered heavy-lift transit and specialized handling for complex, out-of-gauge industrial equipment worldwide.',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    id: 'air',
    title: 'AIR FREIGHT',
    desc: 'Priority and charter air cargo across international flight lanes engineered for high-value and temperature-sensitive freight.',
    icon: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 20.5 3s-3 .5-4.5 1L12.5 7.5 4.3 5.7 3 7l6.5 4.5L6 15l-3-1-1.5 1.5L4 18l2.5 2.5L8 19l-1-3 3.5-3.5 4.5 6.5 1.3-1.3z" />
      </svg>
    ),
  },
]

export default function App() {
  const containerRef = useRef(null)
  const sceneRef     = useRef(null)

  // Header & Telemetry Refs
  const terminalCopyRef = useRef(null)
  const speedometerRef  = useRef(null)
  const speedValRef     = useRef(null)
  const speedLabelRef   = useRef(null)
  const watermarkRef    = useRef(null)

  // Crane Stage Refs (Phase 1)
  const craneBaseRef             = useRef(null)
  const craneShadowRef           = useRef(null)
  const groundContainerShadowRef = useRef(null)
  const boomAnchorRef            = useRef(null)
  const boomGroupRef             = useRef(null)
  const spreaderGroupRef         = useRef(null)
  const groundContainerRef       = useRef(null)
  const craneContainerRef        = useRef(null)

  // Bottom Step Navigation Tracker Refs
  const bottomTrackerRef = useRef(null)
  const step0Ref         = useRef(null)
  const step1Ref         = useRef(null)
  const step2Ref         = useRef(null)

  // Scene 1: Side-View Truck Stage Refs
  const scene1ContainerRef = useRef(null)
  const sideStageRef       = useRef(null)
  const truckGroupRef      = useRef(null)
  const truckBodyRef       = useRef(null)
  const truckContainerRef  = useRef(null)
  const truckShadowRef     = useRef(null)
  // Rotating Wheel & Road Speed Refs (5 axles)
  const w0Ref = useRef(null)
  const w1Ref = useRef(null)
  const w2Ref = useRef(null)
  const w3Ref = useRef(null)
  const w4Ref = useRef(null)
  const roadSpeedLineRef = useRef(null)


  // Scene 1 Services Overlay Refs
  const servicesBandRef       = useRef(null)
  const servicesTrackRef      = useRef(null)
  const servicesPillRef       = useRef(null)

  // Shared Persistent Black Surface & Highway Road Refs
  const sharedRoadWrapRef     = useRef(null)
  const roadWorldGroupRef     = useRef(null)
  const curvedRoadLayerRef    = useRef(null)
  const roadShoulderRef       = useRef(null)
  const servicesBlackFillRef  = useRef(null)
  const overheadCenterlineRef = useRef(null)
  const topTruckGroupRef      = useRef(null)

  // Scene 3 Content Refs
  const editorialLeftRef          = useRef(null)
  const milestonesRightRef        = useRef(null)
  const milestone1Ref             = useRef(null)
  const milestone2Ref             = useRef(null)

  // Scene 4 & 5 Ocean & Air Stage Refs
  const oceanLayerRef         = useRef(null)
  const oceanBgRef            = useRef(null)
  const oceanVideoRef         = useRef(null)
  const shipGroupRef          = useRef(null)
  const oceanHeadlineRef      = useRef(null)
  const storyBlocksRef        = useRef(null)
  const storyLeftRef          = useRef(null)
  const storyCenterRef        = useRef(null)
  const storyRightRef         = useRef(null)
  const cloudsDistantRef      = useRef(null)
  const cloudFar1Ref          = useRef(null)
  const cloudFar2Ref          = useRef(null)
  const cloudFar3Ref          = useRef(null)
  const cloudsNearRef         = useRef(null)
  const cloudNear1Ref         = useRef(null)
  const cloudNear2Ref         = useRef(null)
  const cloudNear3Ref         = useRef(null)
  const airplaneGroupRef      = useRef(null)
  const airplaneMistRef       = useRef(null)
  const aircraftRevealRef     = useRef(null)

  // GPS Coordinates ref
  const gpsCoordRef = useRef(null)

  // Asset preloader for ocean, clouds, ship and aircraft assets
  useEffect(() => {
    const assets = [
      assetUrl('assets/logistics/ocean-background.png'),
      assetUrl('assets/logistics/ship-top.png'),
      assetUrl('assets/logistics/plane-top.png'),
      assetUrl('assets/logistics/cloud-far.png'),
      assetUrl('assets/logistics/cloud-near.png'),
    ]
    assets.forEach((src) => {
      const img = new Image()
      img.src = src
      if (img.decode) {
        img.decode().catch(() => {})
      }
    })

    // Ensure ocean video is fully configured for browser autoplay policies & deployment resilience
    const playVideoSafe = () => {
      if (oceanVideoRef.current) {
        oceanVideoRef.current.muted = true
        oceanVideoRef.current.defaultMuted = true
        oceanVideoRef.current.playsInline = true
        oceanVideoRef.current.setAttribute('playsinline', '')
        oceanVideoRef.current.setAttribute('webkit-playsinline', '')
        const p = oceanVideoRef.current.play()
        if (p !== undefined) {
          p.catch(() => {})
        }
      }
    }
    playVideoSafe()

    // Unlock video playback on any touch/click/scroll interaction
    const handleUserInteract = () => {
      playVideoSafe()
      window.removeEventListener('pointerdown', handleUserInteract)
      window.removeEventListener('touchstart', handleUserInteract)
      window.removeEventListener('scroll', handleUserInteract)
    }
    window.addEventListener('pointerdown', handleUserInteract, { passive: true })
    window.addEventListener('touchstart', handleUserInteract, { passive: true })
    window.addEventListener('scroll', handleUserInteract, { passive: true })

    // Handle hash landing like #ocean, #services, etc.
    if (window.location.hash) {
      const targetMap = {
        '#services': 0.24,
        '#journey': 0.48,
        '#ocean': 0.72,
        '#network': 1.00,
      }
      const targetProgress = targetMap[window.location.hash]
      if (targetProgress !== undefined) {
        setTimeout(() => {
          const st = ScrollTrigger.getById('masterSceneTrigger') || ScrollTrigger.getAll()[0]
          if (st) {
            window.scrollTo({ top: st.start + (st.end - st.start) * targetProgress, behavior: 'smooth' })
          }
        }, 400)
      }
    }

    return () => {
      window.removeEventListener('pointerdown', handleUserInteract)
      window.removeEventListener('touchstart', handleUserInteract)
      window.removeEventListener('scroll', handleUserInteract)
    }
  }, [])

  // Helper: updates boom rotation and keeps spreader strictly horizontal
  const setBoomRotation = (rot) => {
    if (boomGroupRef.current) {
      boomGroupRef.current.setAttribute('transform', `rotate(${rot})`)
    }
    if (spreaderGroupRef.current) {
      spreaderGroupRef.current.setAttribute('transform', `rotate(${-rot})`)
    }
  }

  useGSAP(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion || isMobile) {
      setBoomRotation(-17.5)
      gsap.set([craneBaseRef.current, craneShadowRef.current, groundContainerShadowRef.current, boomAnchorRef.current, groundContainerRef.current], { opacity: 0, display: 'none' })
      gsap.set(terminalCopyRef.current, { opacity: 0, display: 'none' })
      gsap.set(truckGroupRef.current, { x: TRUCK_CENTER_X, y: 377, opacity: 1, scaleY: 1 })
      gsap.set(truckContainerRef.current, { opacity: 1 })

      gsap.set(speedometerRef.current, { opacity: 0 })
      gsap.set(watermarkRef.current, { opacity: 1 })
      gsap.set(sharedRoadWrapRef.current, { y: '0%', opacity: 1 })
      gsap.set(servicesBandRef.current, { opacity: 1 })
      gsap.set(editorialLeftRef.current, { opacity: 1, x: 0 })
      gsap.set(milestonesRightRef.current, { opacity: 1, x: 0 })
      gsap.set(oceanLayerRef.current, { y: '0%', opacity: 1 })
      gsap.set(shipGroupRef.current, { scale: 0.65, x: 0, y: 0 })
      gsap.set(oceanHeadlineRef.current, { opacity: 0, display: 'none' })
      gsap.set(storyBlocksRef.current, { opacity: 1 })
      gsap.set([storyLeftRef.current, storyRightRef.current, storyCenterRef.current], { opacity: 1, x: 0, y: 0 })
      gsap.set(airplaneGroupRef.current, { display: 'none' })
      gsap.set([cloudsDistantRef.current, cloudsNearRef.current], { display: 'none' })
      if (aircraftRevealRef.current) {
        aircraftRevealRef.current.style.maskImage = 'none'
        aircraftRevealRef.current.style.webkitMaskImage = 'none'
        aircraftRevealRef.current.style.clipPath = 'none'
        aircraftRevealRef.current.style.webkitClipPath = 'none'
        gsap.set(aircraftRevealRef.current, { opacity: 1, display: 'flex' })
      }
      return
    }

    // ── INITIAL STATES (Exact Hero Terminal State) ──────────────────
    setBoomRotation(-2.96)
    gsap.set(sideStageRef.current, { height: '100%', opacity: 1, display: 'flex' })
    gsap.set(terminalCopyRef.current, { opacity: 1, y: 0, display: 'block' })
    gsap.set([craneBaseRef.current, craneShadowRef.current, boomAnchorRef.current, groundContainerShadowRef.current], { opacity: 1, display: 'inline' })
    gsap.set(craneContainerRef.current, { opacity: 1 })
    gsap.set(groundContainerRef.current, { opacity: 0, display: 'none' })

    // 2D Truck starts parked off-screen to the right with empty trailer
    gsap.set(truckGroupRef.current, { x: TRUCK_WAIT_X, y: 377, opacity: 0, scaleY: 1 })
    gsap.set(truckContainerRef.current, { opacity: 0 })
    gsap.set(truckBodyRef.current, { y: 0, rotation: 0 })
    gsap.set(truckShadowRef.current, { scaleX: 1, scaleY: 1 })



    // Rotating wheels & speed line initial states
    const wheels = [w0Ref.current, w1Ref.current, w2Ref.current, w3Ref.current, w4Ref.current]
    gsap.set(wheels, { transformOrigin: '50% 50%', rotation: 0 })
    gsap.set(roadSpeedLineRef.current, { opacity: 0 })

    // Telemetry & Watermark
    gsap.set(speedometerRef.current, { opacity: 0 })
    gsap.set(watermarkRef.current, { opacity: 0, x: 0 })

    // Services Content Overlay
    gsap.set(servicesBandRef.current, { opacity: 0, y: 50, display: 'flex' })
    gsap.set(servicesTrackRef.current, { x: 0, y: 0 })
    gsap.set(servicesPillRef.current, { opacity: 0, y: 20 })
    gsap.set(sideStageRef.current, { opacity: 1, display: 'flex' })

    // Shared Black Surface & Road Layers (Hidden during Phase 1 Terminal Yard)
    gsap.set(sharedRoadWrapRef.current, { y: '100%', opacity: 0, display: 'block' })
    gsap.set(roadWorldGroupRef.current, { transformOrigin: '700px 240px', scale: 1.45, y: 0 })
    gsap.set(curvedRoadLayerRef.current, { y: 0 })
    if (servicesBlackFillRef.current) {
      servicesBlackFillRef.current.setAttribute('d', 'M -400 95 L 2400 95 L 2400 1200 L -400 1200 Z')
    }
    gsap.set(servicesBlackFillRef.current, { opacity: 1, display: 'block' })
    gsap.set(roadShoulderRef.current, { opacity: 0 })
    gsap.set(overheadCenterlineRef.current, { opacity: 0 })
    gsap.set(topTruckGroupRef.current, { opacity: 0, transformOrigin: '50% 50%', x: 450, y: 240, rotation: 90 })

    // Scene 3 Content
    gsap.set(editorialLeftRef.current, { opacity: 0, x: -60, y: 0, display: 'block' })
    gsap.set(milestonesRightRef.current, { opacity: 0, x: 0, y: 0, display: 'block' })
    gsap.set(milestone1Ref.current, { opacity: 0, y: 25 })
    gsap.set(milestone2Ref.current, { opacity: 0, y: 25 })

    // Ocean & Air Initial States (Hidden during Crane, Services, Road)
    gsap.set(oceanLayerRef.current, { y: '100%', opacity: 1, display: 'block' })
    if (oceanLayerRef.current) {
      oceanLayerRef.current.style.webkitMaskImage = ''
      oceanLayerRef.current.style.maskImage = ''
    }
    gsap.set(oceanBgRef.current, { scale: 1.15, y: -20 })
    gsap.set(shipGroupRef.current, {
      x: 0,
      y: 0,
      scale: 2.85,
      transformOrigin: '50% 50%',
    })
    gsap.set(oceanHeadlineRef.current, { opacity: 0, y: 40, scale: 0.96 })
    gsap.set(storyBlocksRef.current, { opacity: 0 })
    gsap.set(storyLeftRef.current, { opacity: 0, x: -40 })
    gsap.set(storyCenterRef.current, { opacity: 0, y: 40 })
    gsap.set(storyRightRef.current, { opacity: 0, x: 40 })
    gsap.set([cloudFar1Ref.current, cloudFar2Ref.current, cloudFar3Ref.current], { opacity: 0, scale: 0.9 })
    gsap.set([cloudNear1Ref.current, cloudNear2Ref.current, cloudNear3Ref.current], { opacity: 0, scale: 0.85, x: -40 })
    gsap.set(airplaneGroupRef.current, {
      x: '-120vw',
      y: '-2vh',
      rotation: 2,
      scale: 1,
      transformOrigin: '50% 50%',
    })
    gsap.set(airplaneMistRef.current, { opacity: 0, x: '-20%' })
    if (aircraftRevealRef.current) {
      aircraftRevealRef.current.style.maskImage = 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 0%)'
      aircraftRevealRef.current.style.webkitMaskImage = 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 0%)'
      aircraftRevealRef.current.style.clipPath = 'none'
      aircraftRevealRef.current.style.webkitClipPath = 'none'
      gsap.set(aircraftRevealRef.current, { opacity: 1, display: 'flex' })
    }

    const animState = { boomRot: -2.96 }

    const blackSurfaceState = { bottomY: 1200 }

    // ── Unified Road Pose & Camera Calculator (Horizontal -> Curved Junction -> Vertical Pan) ──
    const getRoadPose = (t) => {
      // 1. Horizontal straight entry & Camera Zoom Out: t in [0, 0.20]
      if (t <= 0.20) {
        const u = t / 0.20
        const x = 450 + u * (800 - 450)
        const y = 240
        const cameraScale = 1.45 - u * 0.45 // 1.45 down to 1.0
        return { x, y, rot: 90, cameraScale, cameraY: 0 }
      }
      // 2. Smooth 90-degree Circular Arc Turn: t in (0.20, 0.48]
      if (t <= 0.48) {
        const u = (t - 0.20) / 0.28
        const theta = -Math.PI / 2 + u * (Math.PI / 2) // -90 deg to 0 deg
        const x = 800 + 256 * Math.cos(theta)
        const y = 496 + 256 * Math.sin(theta)
        const rot = 90 + u * 90 // 90 deg -> 180 deg
        return { x, y, rot, cameraScale: 1.0, cameraY: 0 }
      }
      // 3. Vertical highway travel with camera pan down: t in (0.48, 1.0]
      const u = (t - 0.48) / 0.52
      const x = 1056
      const y = 496 + u * 1050
      const cameraY = u * 540
      return { x, y, rot: 180, cameraScale: 1.0, cameraY }
    }

    const roadTravel = { progress: 0 }

    // ── MASTER UNIFIED COORDINATED TIMELINE ─────────────────────────
    const tl = gsap.timeline({
      scrollTrigger: {
        id: 'masterSceneTrigger',
        trigger: sceneRef.current,
        start: 'top top',
        end: '+=13000',
        pin: true,
        scrub: 0.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress

          // Bottom Step Tracker updates with state caching
          const stepIndex = p < 0.18 ? 0 : p < 0.65 ? 1 : 2
          if (step0Ref.current && step1Ref.current && step2Ref.current) {
            if (stepIndex === 0 && !step0Ref.current.classList.contains('active')) {
              step0Ref.current.classList.add('active')
              step1Ref.current.classList.remove('active')
              step2Ref.current.classList.remove('active')
            } else if (stepIndex === 1 && !step1Ref.current.classList.contains('active')) {
              step0Ref.current.classList.remove('active')
              step1Ref.current.classList.add('active')
              step2Ref.current.classList.remove('active')
            } else if (stepIndex === 2 && !step2Ref.current.classList.contains('active')) {
              step0Ref.current.classList.remove('active')
              step1Ref.current.classList.remove('active')
              step2Ref.current.classList.add('active')
            }
          }

          if (bottomTrackerRef.current) {
            const shouldHide = p >= 0.90
            const currentOp = bottomTrackerRef.current.style.opacity
            if (shouldHide && currentOp !== '0') bottomTrackerRef.current.style.opacity = '0'
            else if (!shouldHide && currentOp !== '1') bottomTrackerRef.current.style.opacity = '1'
          }

          if (oceanVideoRef.current) {
            if (p >= 0.55 && p <= 0.96) {
              if (oceanVideoRef.current.paused) oceanVideoRef.current.play().catch(() => {})
            }
          }

          let speedVal = '00'
          let speedLbl = 'TERMINAL YARD'
          let gpsText = '18.9482° N | 72.8354° E • BERTH 07'

          if (p < 0.03) {
            speedVal = '00'
            speedLbl = 'TERMINAL YARD'
            gpsText = '18.9482° N | 72.8354° E • BERTH 07'
          } else if (p >= 0.03 && p < 0.12) {
            speedVal = '08'
            speedLbl = 'BAY POSITIONING'
            gpsText = '18.9482° N | 72.8354° E • HOIST ACTIVE'
          } else if (p >= 0.12 && p < 0.16) {
            speedVal = '16'
            speedLbl = 'CONTAINER LATCHED'
            gpsText = '18.9485° N | 72.8359° E • LOCKED'
          } else if (p >= 0.16 && p < 0.20) {
            const v = Math.round(18 + ((p - 0.16) / 0.04) * 14)
            speedVal = `${v}`
            speedLbl = 'SERVICES DISPATCH'
            gpsText = '18.9520° N | 72.8410° E • DEPARTURE'
          } else if (p >= 0.20 && p < 0.33) {
            const v = Math.round(32 + ((p - 0.20) / 0.13) * 23)
            speedVal = `${v}`
            speedLbl = 'ROAD FREIGHT'
            gpsText = '19.0760° N | 72.8777° E • NH-48 EXPRESS'
          } else if (p >= 0.33 && p < 0.46) {
            speedVal = '55'
            speedLbl = 'CAMERA ELEVATION'
            gpsText = '19.2183° N | 73.0805° E • CORRIDOR'
          } else if (p >= 0.46 && p < 0.64) {
            const v = Math.round(60 + ((p - 0.46) / 0.18) * 32)
            speedVal = `${v}`
            speedLbl = 'HIGHWAY CORRIDOR'
            gpsText = '19.8520° N | 73.4100° E • ARTERIAL'
          } else if (p >= 0.64 && p < 0.84) {
            const v = Math.round(18 + ((p - 0.64) / 0.20) * 6)
            speedVal = `${v}`
            speedLbl = 'OCEAN TRANSIT (KTS)'
            gpsText = '12.9716° N | 80.2520° E • PACIFIC LANE'
          } else if (p >= 0.84 && p < 0.90) {
            speedVal = '24'
            speedLbl = 'DEEP SEA CORRIDOR'
            gpsText = '01.3521° N | 103.8198° E • STRAITS'
          } else if (p >= 0.90 && p < 0.97) {
            const v = Math.round(480 + ((p - 0.90) / 0.07) * 60)
            speedVal = `${v}`
            speedLbl = 'AIR FREIGHT (KTS)'
            gpsText = 'FL380 • 40.7128° N | 74.0060° W • NYC'
          }

          if (speedValRef.current && speedValRef.current.innerText !== speedVal) {
            speedValRef.current.innerText = speedVal
          }
          if (speedLabelRef.current && speedLabelRef.current.innerText !== speedLbl) {
            speedLabelRef.current.innerText = speedLbl
          }
          if (gpsCoordRef.current && gpsCoordRef.current.innerText !== gpsText) {
            gpsCoordRef.current.innerText = gpsText
          }
          if (p >= 0.97 && speedometerRef.current && speedometerRef.current.style.opacity !== '0') {
            speedometerRef.current.style.opacity = '0'
          }
        },
      },
    })

    // ── Phase 1: Terminal Crane Loading [0.00 - 0.13] ──────────────
    // Spreader starts clamped directly on the ground container at scroll 0 (exact hero state)
    // 1. Hoist container high up into air
    tl.to(animState, {
      boomRot: -14.0,
      ease: 'power1.inOut',
      duration: 0.040,
      onUpdate: () => setBoomRotation(animState.boomRot),
    }, 0)

    // Container ground shadow softly fades as it lifts into air
    tl.to(groundContainerShadowRef.current, {
      opacity: 0,
      ease: 'power1.in',
      duration: 0.035,
    }, 0)

    // 2. Truck appears and rolls into loading spot while container is high
    tl.to(truckGroupRef.current, {
      opacity: 1,
      duration: 0.012,
      ease: 'power1.in',
    }, 0.035)
    tl.to(truckGroupRef.current, {
      x: TRUCK_LOAD_X,
      ease: 'power2.inOut',
      duration: 0.040,
    }, 0.035)
    tl.to(wheels, {
      rotation: -4420,
      ease: 'power2.inOut',
      duration: 0.040,
    }, 0.035)

    // 3. Crane lowers container onto truck trailer
    tl.to(animState, {
      boomRot: -7.46,
      ease: 'power1.inOut',
      duration: 0.035,
      onUpdate: () => setBoomRotation(animState.boomRot),
    }, 0.075)

    // 4. Latch container to trailer deck
    tl.set(craneContainerRef.current, { opacity: 0 }, 0.11)
    tl.set(truckContainerRef.current, { opacity: 1 }, 0.11)

    // 5. Spreader unlatches and booms clear
    tl.to(animState, {
      boomRot: -17.5,
      ease: 'power2.inOut',
      duration: 0.02,
      onUpdate: () => setBoomRotation(animState.boomRot),
    }, 0.11)

    // ── Phase 2A: Crane Complete Fadeout [0.13 - 0.16] ────────────
    tl.to([craneBaseRef.current, craneShadowRef.current, boomAnchorRef.current, groundContainerShadowRef.current], {
      opacity: 0,
      duration: 0.03,
      ease: 'power2.out',
    }, 0.13)
    tl.to(terminalCopyRef.current, {
      opacity: 0,
      y: -25,
      duration: 0.025,
      ease: 'power2.out',
    }, 0.13)
    tl.set([craneBaseRef.current, craneShadowRef.current, boomAnchorRef.current, groundContainerShadowRef.current, terminalCopyRef.current], {
      display: 'none',
    }, 0.16)

    // ── Phase 2B: Loaded Truck Advances & Services Dock [0.16 - 0.20] ──
    // Stage height smoothly shifts from 100% down to 46vh as the black services panel docks
    tl.to(sideStageRef.current, {
      height: '46vh',
      duration: 0.04,
      ease: 'power2.inOut',
    }, 0.16)
    // Speedometer fades in for road freight
    tl.to(speedometerRef.current, {
      opacity: 1,
      duration: 0.03,
      ease: 'power2.out',
    }, 0.16)

    // Loaded 2D truck rolls smoothly from loading spot (1866) to visual center (1054)
    tl.to(truckGroupRef.current, {
      x: TRUCK_CENTER_X,
      ease: 'power2.inOut',
      duration: 0.04,
    }, 0.16)
    tl.to(wheels, {
      rotation: '-=850',
      ease: 'power2.inOut',
      duration: 0.04,
    }, 0.16)

    // Persistent black services / road surface slides up smoothly to dock under the truck
    tl.to(sharedRoadWrapRef.current, {
      y: '0%',
      opacity: 1,
      duration: 0.04,
      ease: 'power2.out',
    }, 0.16)
    tl.to(roadSpeedLineRef.current, {
      opacity: 1,
      duration: 0.03,
    }, 0.17)

    // Watermark & Telemetry fade in
    tl.to(speedometerRef.current, { opacity: 1, duration: 0.03 }, 0.17)
    tl.to(watermarkRef.current, { opacity: 1, duration: 0.035 }, 0.17)

    // Services content slides up over the solid black surface
    tl.to(servicesBandRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.035,
      ease: 'power2.out',
    }, 0.17)
    tl.to(servicesPillRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.03,
      ease: 'power2.out',
    }, 0.18)

    // 2D truck stays visible through services scrolling

    // ── Phase 3: Horizontal Services Scrolling [0.20 - 0.33] ──────
    const getOverflow = () => {
      if (!servicesTrackRef.current) return 1200
      const trackWidth = servicesTrackRef.current.scrollWidth
      const viewWidth = window.innerWidth
      return Math.max(trackWidth - viewWidth + 140, 1000)
    }

    tl.to(servicesTrackRef.current, {
      x: () => -getOverflow(),
      ease: 'none',
      duration: 0.13,
    }, 0.20)

    // 2D Wheels spin continuously in sync with horizontal freight travel
    tl.to(wheels, {
      rotation: '-=7200',
      ease: 'none',
      duration: 0.13,
    }, 0.20)

    // Road speed line streams rapidly underneath wheels
    tl.to(roadSpeedLineRef.current, {
      strokeDashoffset: -9000,
      ease: 'none',
      duration: 0.13,
    }, 0.20)

    // Background watermark text drifts in parallax
    tl.to(watermarkRef.current, {
      x: -400,
      ease: 'none',
      duration: 0.13,
    }, 0.20)

    // ── Phase 4: SERVICES-TO-ROAD TRANSITION [0.33 - 0.46] ──
    // 1. Services cards and pill exit smoothly
    tl.to([servicesTrackRef.current, servicesPillRef.current], {
      opacity: 0,
      y: 30,
      duration: 0.035,
      ease: 'power2.out',
    }, 0.33)
    tl.to(watermarkRef.current, { opacity: 0, duration: 0.03 }, 0.33)
    tl.to(roadSpeedLineRef.current, { opacity: 0, duration: 0.03 }, 0.33)
    tl.set(servicesBandRef.current, { display: 'none' }, 0.37)

    // 2. Seamless Truck & Stage Crossfade (no gaps, continuous visibility)
    tl.to(truckGroupRef.current, {
      opacity: 0,
      duration: 0.05,
      ease: 'power1.inOut',
    }, 0.335)
    tl.to(sideStageRef.current, {
      opacity: 0,
      duration: 0.05,
      ease: 'power1.inOut',
    }, 0.335)
    tl.set(sideStageRef.current, { display: 'none' }, 0.39)

    tl.to(topTruckGroupRef.current, {
      opacity: 1,
      duration: 0.05,
      ease: 'power1.inOut',
    }, 0.335)

    // 3. Road shoulders and dashed centerline emerge smoothly
    tl.to([roadShoulderRef.current, overheadCenterlineRef.current], {
      opacity: 1,
      duration: 0.08,
      ease: 'power1.inOut',
    }, 0.335)

    // 4. Black surface smoothly contracts into the horizontal road bed
    tl.to(blackSurfaceState, {
      bottomY: 385,
      ease: 'power2.inOut',
      duration: 0.09,
      onUpdate: () => {
        if (servicesBlackFillRef.current) {
          servicesBlackFillRef.current.setAttribute(
            'd',
            `M -400 95 L 2400 95 L 2400 ${blackSurfaceState.bottomY} L -400 ${blackSurfaceState.bottomY} Z`
          )
        }
      },
    }, 0.335)

    // 5. As bottom reaches 385, seamlessly hand off to permanent curved road bed
    tl.to(servicesBlackFillRef.current, {
      opacity: 0,
      duration: 0.03,
      ease: 'power1.out',
    }, 0.425)
    tl.set(servicesBlackFillRef.current, { display: 'none' }, 0.46)

    // ── Phase 5: Overhead Highway Travel & Road Scene [0.47 - 0.64] ───
    tl.to(roadTravel, {
      progress: 1,
      ease: 'none',
      duration: 0.17,
      onUpdate: () => {
        const pt = getRoadPose(roadTravel.progress)
        if (topTruckGroupRef.current) {
          gsap.set(topTruckGroupRef.current, {
            x: pt.x,
            y: pt.y,
            rotation: pt.rot,
          })
        }
        if (roadWorldGroupRef.current) {
          gsap.set(roadWorldGroupRef.current, {
            transformOrigin: '700px 240px',
            scale: pt.cameraScale,
            y: -pt.cameraY,
          })
        }
      },
    }, 0.47)

    // Editorial text on left fades in as truck enters corridor
    tl.to(editorialLeftRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.045,
      ease: 'power2.out',
    }, 0.48)

    // Milestones right container fades in
    tl.to(milestonesRightRef.current, {
      opacity: 1,
      duration: 0.03,
      ease: 'power2.out',
    }, 0.48)

    // Milestone 1 (REAL-TIME FREIGHT TRACKING) enters at upper position
    tl.to(milestone1Ref.current, {
      opacity: 1,
      y: 0,
      duration: 0.045,
      ease: 'power2.out',
    }, 0.48)

    // As truck travels down corridor: Milestone 1 dims and Milestone 2 enters at its lower position
    tl.to(milestone1Ref.current, {
      opacity: 0.35,
      duration: 0.035,
      ease: 'power1.inOut',
    }, 0.55)
    tl.to(milestone2Ref.current, {
      opacity: 1,
      y: 0,
      duration: 0.045,
      ease: 'power2.out',
    }, 0.55)

    // Centerline dashes stream downward
    tl.to(overheadCenterlineRef.current, {
      strokeDashoffset: -14000,
      ease: 'none',
      duration: 0.15,
    }, 0.54)

    // ── Phase 6: Road-to-Ocean Handoff [0.64 - 0.70] ───
    // Outgoing Road content slides up and fades as Ocean rises smoothly from below
    tl.to([editorialLeftRef.current, milestonesRightRef.current], {
      opacity: 0,
      y: -60,
      duration: 0.05,
      ease: 'power2.in',
    }, 0.64)

    tl.to(sharedRoadWrapRef.current, {
      y: '-80%',
      opacity: 0,
      duration: 0.06,
      ease: 'power2.in',
    }, 0.64)

    tl.set([editorialLeftRef.current, milestonesRightRef.current, sharedRoadWrapRef.current], {
      display: 'none',
    }, 0.70)

    // Ocean layer rises smoothly up from the bottom directly underneath the road
    tl.to(oceanLayerRef.current, {
      y: '0%',
      duration: 0.06,
      ease: 'power2.out',
    }, 0.64)

    // ── Phase 7: Step 1 & 2 - Deck Close-Up Pullback to Full Ship & Heading Reveal [0.70 - 0.78] ───
    // Start close to the container deck: ship length extends above and below viewport, pointing DOWN on centerline
    // Pull back gradually towards 1 viewport height
    tl.to(shipGroupRef.current, {
      scale: 1.0,
      x: 0,
      y: 0,
      duration: 0.08,
      ease: 'power1.inOut',
    }, 0.70)

    tl.to(oceanBgRef.current, {
      scale: 1.10,
      y: 10,
      duration: 0.08,
      ease: 'none',
    }, 0.70)

    // Reveal heading as whole ship becomes visible (near end of this phase)
    tl.to(oceanHeadlineRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.035,
      ease: 'power2.out',
    }, 0.74)

    // ── Phase 8: Step 3 - Wide Ocean Pullback & Feature Copy [0.78 - 0.85] ───
    // Pull back from ~1 viewport height to 38-42% viewport height
    tl.to(shipGroupRef.current, {
      scale: 0.40,
      duration: 0.07,
      ease: 'power1.inOut',
    }, 0.78)

    tl.to(oceanBgRef.current, {
      scale: 1.05,
      y: 25,
      duration: 0.07,
      ease: 'none',
    }, 0.78)

    // Headline leaves after readable interval
    tl.to(oceanHeadlineRef.current, {
      opacity: 0,
      y: -30,
      duration: 0.03,
      ease: 'power2.in',
    }, 0.795)

    // Feature copy reveals around ship in open ocean
    tl.set(storyBlocksRef.current, { opacity: 1 }, 0.80)
    tl.to([storyLeftRef.current, storyRightRef.current], {
      opacity: 1,
      x: 0,
      duration: 0.035,
      ease: 'power2.out',
    }, 0.805)
    tl.to(storyCenterRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.035,
      ease: 'power2.out',
    }, 0.805)

    // Introduce distant clouds near edges at low opacity (doesn't cover copy prematurely)
    tl.to([cloudFar1Ref.current, cloudFar2Ref.current, cloudFar3Ref.current], {
      opacity: 0.35,
      scale: 1.0,
      duration: 0.06,
      ease: 'power1.out',
    }, 0.80)

    // ── Phase 9: Step 4 - Rise into Clouds & Receding Ship [0.85 - 0.90] ───
    // Feature copy leaves
    tl.to([storyLeftRef.current, storyRightRef.current, storyCenterRef.current], {
      opacity: 0,
      y: -25,
      duration: 0.025,
      ease: 'power2.in',
    }, 0.85)

    // Ship reduces towards 14-16% viewport height (scale: 0.15)
    tl.to(shipGroupRef.current, {
      scale: 0.15,
      duration: 0.05,
      ease: 'power1.inOut',
    }, 0.85)

    tl.to(oceanBgRef.current, {
      scale: 1.02,
      y: 40,
      duration: 0.05,
      ease: 'none',
    }, 0.85)

    // Distant cloud coverage increases
    tl.to([cloudFar1Ref.current, cloudFar2Ref.current, cloudFar3Ref.current], {
      opacity: 0.85,
      scale: 1.15,
      duration: 0.05,
      ease: 'power1.inOut',
    }, 0.85)

    // Foreground clouds cross the view with higher travel (~2x travel)
    tl.to(cloudNear1Ref.current, {
      opacity: 0.95,
      x: '45vw',
      y: '-15vh',
      scale: 1.18,
      duration: 0.06,
      ease: 'power1.inOut',
    }, 0.85)

    tl.to(cloudNear2Ref.current, {
      opacity: 0.90,
      x: '35vw',
      y: '10vh',
      scale: 1.12,
      duration: 0.06,
      ease: 'power1.inOut',
    }, 0.855)

    // ── Phase 10: Step 5 - Aircraft Pass & Left-to-Right Reveal of Import & Export / APAC Network [0.90 - 0.97] ───
    // Large overhead aircraft enters from outside left edge (x: -120vw), nose pointing right, and flies COMPLETELY off the right edge (x: 220vw)
    tl.to(airplaneGroupRef.current, {
      x: '220vw',
      y: '2vh',
      rotation: -0.5,
      duration: 0.075,
      ease: 'power1.inOut',
    }, 0.90)

    // Near cloud bank accompanying plane pass
    tl.to(cloudNear3Ref.current, {
      opacity: 0.95,
      x: '150vw',
      scale: 1.25,
      duration: 0.075,
      ease: 'power1.inOut',
    }, 0.90)

    // Dynamic Left-to-Right Feathered Reveal of Import & Export Section following the airplane
    const wipeObj = { pct: 0 }
    tl.to(wipeObj, {
      pct: 100,
      duration: 0.065,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (aircraftRevealRef.current) {
          const p = wipeObj.pct
          if (p <= 0) {
            aircraftRevealRef.current.style.maskImage = 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 0%)'
            aircraftRevealRef.current.style.webkitMaskImage = 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 0%)'
          } else if (p >= 100) {
            aircraftRevealRef.current.style.maskImage = 'none'
            aircraftRevealRef.current.style.webkitMaskImage = 'none'
          } else {
            const feather = 18
            const solidEnd = Math.max(0, p - feather)
            const fadeEnd = Math.min(100, p + feather)
            const mask = `linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${solidEnd}%, rgba(0,0,0,0) ${fadeEnd}%)`
            aircraftRevealRef.current.style.maskImage = mask
            aircraftRevealRef.current.style.webkitMaskImage = mask
          }
        }
      },
    }, 0.90)

    // Ensure airplane and clouds completely fade out and hide after flying past
    tl.to([airplaneGroupRef.current, cloudNear3Ref.current], {
      opacity: 0,
      duration: 0.012,
      ease: 'power1.out',
    }, 0.97)
    tl.set([airplaneGroupRef.current, cloudNear3Ref.current], {
      display: 'none',
    }, 0.985)

    tl.to(speedometerRef.current, {
      opacity: 0,
      duration: 0.015,
      ease: 'power1.out',
    }, 0.96)

  }, { scope: containerRef })

  const handleNavClick = (e, targetHash) => {
    e.preventDefault()
    const targetMap = {
      '#services': 0.24,
      '#journey': 0.48,
      '#ocean': 0.72,
      '#network': 1.00,
    }
    const targetProgress = targetMap[targetHash] ?? 0
    const st = ScrollTrigger.getById('masterSceneTrigger') || ScrollTrigger.getAll()[0]
    if (st) {
      const scrollPos = st.start + (st.end - st.start) * targetProgress
      window.scrollTo({ top: scrollPos, behavior: 'smooth' })
      window.history.pushState(null, '', targetHash)
    }
  }

  return (
    <div className="main-wrapper" ref={containerRef}>
      {/* Top Fixed Brand Navigation */}
      <header className="site-header">
        <a href="#" className="brand-badge" aria-label="United Logistics">
          <span className="brand-dot" />
          <span className="brand-name">UNITED LOGISTICS</span>
        </a>
        <nav aria-label="Primary">
          <ul className="nav-links">
            <li><a href="#services" onClick={(e) => handleNavClick(e, '#services')}>SERVICES</a></li>
            <li><a href="#journey" onClick={(e) => handleNavClick(e, '#journey')}>JOURNEY</a></li>
            <li><a href="#ocean" onClick={(e) => handleNavClick(e, '#ocean')}>OCEAN</a></li>
            <li><a href="#network" onClick={(e) => handleNavClick(e, '#network')}>NETWORK</a></li>
          </ul>
        </nav>
      </header>

      {/* Main Interactive Unified Scene Container */}
      <section className="scene-container" ref={sceneRef} aria-label="Interactive container loading, services, road, and ocean voyage">
        {/* Speedometer Telemetry (Persistent Top-Left) */}
        <div className="uc-speedometer" ref={speedometerRef}>
          <div className="speed-hud-box">
            <div className="speed-row">
              <span className="speed-live-dot" />
              <span className="speed-number" ref={speedValRef}>30</span>
              <span className="speed-unit">KM/H</span>
            </div>
            <span className="speed-label" ref={speedLabelRef}>ROAD TRANSIT</span>
            <div className="speed-hud-sub">
              <span className="hud-metric" ref={gpsCoordRef}>18.9482° N | 72.8354° E • BERTH 07</span>
              <span className="hud-badge">5G SATELLITE LOCK</span>
            </div>
          </div>
        </div>

        {/* ── UNIFIED SHARED SCENE STAGE (Scenes 1 - 3: Crane, Services, Road) ── */}
        <div className="unified-scene-stage">
          {/* 1. Upper Stage Copy & Reachstacker Crane / Side-Truck SVG */}
          <div className="stage-top" ref={sideStageRef}>
            {/* Giant Faint Watermark Typography (Placed in deep background behind truck) */}
            <div className="uc-watermark-text" ref={watermarkRef}>
              SERVICES
            </div>

            {/* Terminal Copy (Initial Crane Phase) */}
            <div className="terminal-copy" ref={terminalCopyRef}>
              <div className="terminal-eyebrow">
                <span className="terminal-eyebrow-dot" />
                TERMINAL DISPATCH
              </div>
              <h1 className="terminal-title">
                Every journey<br />starts here.
              </h1>
              <p className="terminal-sub">
                Seamless connections. From terminal to destination.
              </p>
              <a href="#services" className="terminal-cta-btn" onClick={(e) => handleNavClick(e, '#services')}>
                Explore services <span className="cta-arrow">&rarr;</span>
              </a>
            </div>

            {/* Side-View SVG Viewport */}
            <div className="stage-svg-wrap">
              <svg
                className="logistics-stage-svg"
                viewBox="0 -180 3750 1300"
                preserveAspectRatio="xMidYMax meet"
                aria-hidden="true"
              >
                <defs>
                  {/* Ground Contact Shadows */}
                  <radialGradient id="craneShadow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(18, 17, 15, 0.32)" />
                    <stop offset="65%" stopColor="rgba(18, 17, 15, 0.12)" />
                    <stop offset="100%" stopColor="rgba(18, 17, 15, 0)" />
                  </radialGradient>
                  <radialGradient id="containerGroundShadow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(18, 17, 15, 0.40)" />
                    <stop offset="60%" stopColor="rgba(18, 17, 15, 0.15)" />
                    <stop offset="100%" stopColor="rgba(18, 17, 15, 0)" />
                  </radialGradient>
                  <radialGradient id="truckShadow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(18, 17, 15, 0.28)" />
                    <stop offset="75%" stopColor="rgba(18, 17, 15, 0)" />
                  </radialGradient>
                </defs>

                {/* Studio Ground Horizon Line */}
                <line x1="-500" y1="900" x2="4500" y2="900" stroke="rgba(0, 0, 0, 0.05)" strokeWidth="1.5" />
                <rect x="-500" y="900" width="5000" height="400" fill="rgba(0, 0, 0, 0.012)" />

                {/* Ground Shadow for Crane */}
                <ellipse ref={craneShadowRef} cx="933" cy="900" rx="760" ry="18" fill="url(#craneShadow)" />

                {/* Ground Shadow for Container */}
                <ellipse ref={groundContainerShadowRef} cx="2594" cy="900" rx="710" ry="16" fill="url(#containerGroundShadow)" />

                {/* 1. Static Crane Base Chassis (Wheels at Y = 900) */}
                <g id="crane-base-layer" ref={craneBaseRef} transform="translate(100, 128)">
                  <image
                    href={assetUrl('assets/logistics/crane-base.png')}
                    x="0"
                    y="0"
                    width="1666"
                    height="772"
                    preserveAspectRatio="none"
                  />
                </g>

                {/* 2. Container resting on ground before pickup (fallback hidden) */}
                <g id="ground-container-layer" ref={groundContainerRef} transform="translate(1894, 547.5)" opacity="0">
                  <image
                    href={assetUrl('assets/logistics/container-side.png')}
                    x="0"
                    y="0"
                    width="1400"
                    height="352.5"
                    preserveAspectRatio="none"
                  />
                </g>

                {/* 3. Boom & Spreader Assembly with Rear Hinge Pivot (473, 323) */}
                <g id="boom-pivot-anchor" ref={boomAnchorRef} transform="translate(473, 323)">
                  <g ref={boomGroupRef}>
                    <image
                      href={assetUrl('assets/logistics/crane-boom.png')}
                      x="-103.3"
                      y="-119.6"
                      width="2303"
                      height="304"
                      preserveAspectRatio="none"
                    />

                    {/* Boom Tip Hinge to Spreader (2117.4, 118.7) */}
                    <g transform="translate(2117.4, 118.7)">
                      <g ref={spreaderGroupRef}>
                        <image
                          href={assetUrl('assets/logistics/crane-spreader.png')}
                          x="-712.8"
                          y="-32.8"
                          width="1429"
                          height="269"
                          preserveAspectRatio="none"
                        />

                        {/* Container held by spreader */}
                        <g ref={craneContainerRef} transform="translate(-700, 215.2)">
                          <image
                            href={assetUrl('assets/logistics/container-side.png')}
                            x="0"
                            y="0"
                            width="1400"
                            height="352.5"
                            preserveAspectRatio="none"
                          />
                        </g>
                      </g>

                      {/* Mechanical Joint Pin Cap */}
                      <circle cx="0" cy="0" r="16" fill="#3E4247" stroke="#25272B" strokeWidth="2.5" />
                      <circle cx="0" cy="0" r="8" fill="#C4C6C9" />
                      <circle cx="0" cy="0" r="3" fill="#323438" />
                    </g>
                  </g>
                </g>

                {/* Road Speed Dashes Underneath Wheels */}
                <g opacity="0">
                  <line
                    ref={roadSpeedLineRef}
                    x1="-500"
                    y1="900"
                    x2="4500"
                    y2="900"
                    stroke="rgba(255, 255, 255, 0.42)"
                    strokeWidth="8"
                    strokeDasharray="110 80"
                    strokeLinecap="round"
                  />
                </g>

                {/* 4. Loaded Side-View Truck Group (Starts parked off-screen right) */}
                <g id="side-truck-group" ref={truckGroupRef}>
                  {/* Ground Shadow underneath truck wheels */}
                  <ellipse ref={truckShadowRef} cx="920" cy="522" rx="880" ry="22" fill="url(#truckShadow)" />

                  <g ref={truckBodyRef}>
                    {/* Container secured to trailer deck */}
                    <g ref={truckContainerRef} transform="translate(22, -1.5)">
                      <image
                        href={assetUrl('assets/logistics/container-side.png')}
                        x="0"
                        y="0"
                        width="1400"
                        height="352.5"
                        preserveAspectRatio="none"
                      />
                    </g>

                    {/* Truck & Trailer Chassis */}
                    <image
                      href={assetUrl('assets/logistics/truck-side.png')}
                      x="0"
                      y="0"
                      width="1842"
                      height="523"
                      preserveAspectRatio="none"
                    />

                    {/* Concentric Rotating Wheel Assemblies */}
                    <g id="truck-wheels-layer">
                      <g transform="translate(178, 451.3)">
                        <image ref={w0Ref} href={assetUrl('assets/logistics/wheel_trailer.png')} x="-48" y="-48" width="96" height="96" />
                      </g>
                      <g transform="translate(342.7, 451.3)">
                        <image ref={w1Ref} href={assetUrl('assets/logistics/wheel_trailer.png')} x="-48" y="-48" width="96" height="96" />
                      </g>
                      <g transform="translate(506, 451.3)">
                        <image ref={w2Ref} href={assetUrl('assets/logistics/wheel_trailer.png')} x="-48" y="-48" width="96" height="96" />
                      </g>
                      <g transform="translate(1209.3, 459.2)">
                        <image ref={w3Ref} href={assetUrl('assets/logistics/wheel_drive.png')} x="-48" y="-48" width="96" height="96" />
                      </g>
                      <g transform="translate(1656.8, 446)">
                        <image ref={w4Ref} href={assetUrl('assets/logistics/wheel_steer.png')} x="-48" y="-48" width="96" height="96" />
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
          </div>

          {/* 2. Persistent Shared Black Surface & Highway Road (1920x1080 Viewport) */}
          <div className="shared-road-wrap" ref={sharedRoadWrapRef}>
            <svg
              className="shared-road-svg"
              viewBox="0 0 1920 1080"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              {/* Shared Camera / World Group */}
              <g id="road-world-group" ref={roadWorldGroupRef}>
                <g id="curved-road-layer" ref={curvedRoadLayerRef}>
                  {/* A. Outer Crisp White Edge Shoulders */}
                  <path
                    ref={roadShoulderRef}
                    d="M -400 240 L 2400 240 M 800 240 A 256 256 0 0 1 1056 496 L 1056 3600"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="306"
                    strokeLinecap="square"
                    strokeLinejoin="round"
                  />

                  {/* B. Persistent Opaque Black Road Bed */}
                  <path
                    d="M -400 240 L 2400 240 M 800 240 A 256 256 0 0 1 1056 496 L 1056 3600"
                    fill="none"
                    stroke="#141312"
                    strokeWidth="290"
                    strokeLinecap="square"
                    strokeLinejoin="round"
                  />

                  {/* C. Services Panel Full-Width Black Extension (Morphs into road bed) */}
                  <path
                    ref={servicesBlackFillRef}
                    d="M -400 95 L 2400 95 L 2400 1200 L -400 1200 Z"
                    fill="#141312"
                  />

                  {/* D. Route Dashed Centerline */}
                  <path
                    ref={overheadCenterlineRef}
                    d="M -400 240 L 800 240 A 256 256 0 0 1 1056 496 L 1056 3600"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.75)"
                    strokeWidth="5"
                    strokeDasharray="36 32"
                    strokeLinecap="round"
                  />

                  {/* D2. Through-road continuing centerline to the right */}
                  <path
                    d="M 800 240 L 2400 240"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeWidth="5"
                    strokeDasharray="36 32"
                    strokeLinecap="round"
                  />
                </g>

                {/* E. Top-View Truck (Positioned along exact route tangent) */}
                <g ref={topTruckGroupRef}>
                  <image
                    href={assetUrl('assets/logistics/truck-top.png')}
                    x="-58"
                    y="-87"
                    width="116"
                    height="174"
                    preserveAspectRatio="none"
                  />
                </g>
              </g>
            </svg>
          </div>



          {/* 4. Services Content (Positioned over the black surface in Scene 1) */}
          <div className="services-overlay" ref={servicesBandRef} id="services">
            {/* Horizontally Scrolling Open Service Columns */}
            <div className="services-track" ref={servicesTrackRef}>
              {SERVICES.map((s) => (
                <div className="service-col" key={s.id}>
                  <div className="service-col-icon">{s.icon}</div>
                  <h2 className="service-col-title">{s.title}</h2>
                  <p className="service-col-desc">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Bottom Centered "Our Services" Button */}
            <div className="services-pill-wrap" ref={servicesPillRef}>
              <a href="#services" className="services-pill">
                OUR SERVICES <span className="pill-arrow">→</span>
              </a>
            </div>
          </div>

          {/* 5. Scene 3 Editorial Left Heading */}
          <div className="scene3-editorial-left" ref={editorialLeftRef}>
            <div className="scene3-eyebrow">
              <span className="terminal-eyebrow-dot" />
              Corridor Milestone
            </div>
            <h2 className="scene3-hero-heading">
              <span className="hero-word-muted">RELIABILITY</span>
              <span className="hero-word-bold">AT EVERY</span>
              <span className="hero-word-bold">MILESTONE</span>
            </h2>
            <p className="scene3-hero-sub">
              With every service under one roof and one accountable team, your supply chain moves the business demands: predictably.
            </p>
          </div>

          {/* 6. Scene 3 Feature Details Right - Two Distinct Milestone Checkpoints */}
          <div className="scene3-milestones-right" ref={milestonesRightRef} id="milestones">
            {/* Milestone 1 (Upper Position) */}
            <div className="milestone-block milestone-1" ref={milestone1Ref}>
              <div className="milestone-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
              </div>
              <h3 className="milestone-title">REAL-TIME FREIGHT TRACKING</h3>
              <p className="milestone-desc">
                Know exactly where your cargo is at every milestone. Live telemetry means faster decisions and zero guesswork.
              </p>
            </div>

            {/* Milestone 2 (Lower Distinct Position) */}
            <div className="milestone-block milestone-2" ref={milestone2Ref}>
              <div className="milestone-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3 className="milestone-title">GLOBAL NETWORK COVERAGE</h3>
              <p className="milestone-desc">
                Scheduled road corridors seamlessly linked to major deep-sea terminals and regional logistics hubs.
              </p>
            </div>
          </div>
        </div>

        {/* ── SCENE 4 & 5: Ocean & Air Transition Stage (Layers 1 - 7) ── */}
        <div className="ocean-scene-layer" ref={oceanLayerRef} id="ocean" aria-label="Ocean freight cargo vessel voyage">
          {/* Layer 1: Parallax Ocean Video Background */}
          <div className="ocean-bg" ref={oceanBgRef}>
            <video
              ref={oceanVideoRef}
              className="ocean-bg-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={assetUrl('assets/logistics/ocean-background.png')}
              onLoadedData={() => {
                if (oceanVideoRef.current) {
                  oceanVideoRef.current.muted = true
                  oceanVideoRef.current.play().catch(() => {})
                }
              }}
              onCanPlay={() => {
                if (oceanVideoRef.current) {
                  oceanVideoRef.current.muted = true
                  oceanVideoRef.current.play().catch(() => {})
                }
              }}
            >
              <source src={assetUrl('assets/logistics/oceanbg.mp4')} type="video/mp4" />
            </video>
          </div>

          {/* Layer 2 & 3: Container Ship Camera Group */}
          <div className="ocean-ship-group" ref={shipGroupRef}>
            {/* Marine Radar Sonar Rings */}
            <div className="ship-sonar-pulse" aria-hidden="true">
              <span className="sonar-ring sonar-ring-1" />
              <span className="sonar-ring sonar-ring-2" />
            </div>

            {/* Ship Propeller Wake Waves */}
            <div className="ship-wake-trail" aria-hidden="true">
              <div className="wake-line wake-left" />
              <div className="wake-foam wake-center" />
              <div className="wake-line wake-right" />
            </div>

            {/* Overhead Container Ship */}
            <img
              src={assetUrl('assets/logistics/ship-top.png')}
              alt="Container cargo ship from above"
              className="ship-top-img"
            />
          </div>

          {/* Layer 4A: Bold Centered Editorial Headline */}
          <div className="ocean-headline" ref={oceanHeadlineRef}>
            <div className="ocean-eyebrow">
              <span className="ocean-eyebrow-dot" />
              Deep Sea Maritime
            </div>
            <h2 className="ocean-headline-title">
              <span>LOGISTICS</span>
              <span>THAT WORKS</span>
              <span>AS HARD AS</span>
              <span>YOU DO.</span>
            </h2>
          </div>

          {/* Layer 4B: Side Narrative Story Blocks in Open Ocean */}
          <div className="ocean-story-blocks" ref={storyBlocksRef}>
            <div className="ocean-story-col story-left" ref={storyLeftRef}>
              <span className="story-eyebrow">GLOBAL COMPLIANCE</span>
              <h3 className="story-title">COMPLIANCE YOU CAN TRUST</h3>
              <p className="story-desc">
                Our rigorous maritime compliance protocols ensure your cargo meets every international standard without port delays.
              </p>
            </div>

            <div className="ocean-story-col story-center" ref={storyCenterRef}>
              <span className="story-eyebrow">24/7 DISPATCH</span>
              <h3 className="story-title">FAST ISSUE RESOLUTION</h3>
              <p className="story-desc">
                Dedicated voyage control specialists resolving customs exceptions in real time.
              </p>
            </div>

            <div className="ocean-story-col story-right" ref={storyRightRef}>
              <span className="story-eyebrow">DIRECT CARRIER RATES</span>
              <h3 className="story-title">COMPETITIVE TRANSPARENT PRICING</h3>
              <p className="story-desc">
                Direct ocean volume allocations with transparent voyage milestones and zero hidden bunker surcharges.
              </p>
            </div>
          </div>

          {/* Layer 5: Distant Cloud Atmosphere */}
          <div className="ocean-clouds-distant" ref={cloudsDistantRef}>
            <img src={assetUrl('assets/logistics/cloud-far.png')} alt="" className="cloud-far-img cloud-far-1" ref={cloudFar1Ref} />
            <img src={assetUrl('assets/logistics/cloud-far.png')} alt="" className="cloud-far-img cloud-far-2" ref={cloudFar2Ref} />
            <img src={assetUrl('assets/logistics/cloud-far.png')} alt="" className="cloud-far-img cloud-far-3" ref={cloudFar3Ref} />
          </div>

          {/* Layer 6: Foreground Cloud Banks */}
          <div className="ocean-clouds-foreground" ref={cloudsNearRef}>
            <img src={assetUrl('assets/logistics/cloud-near.png')} alt="" className="cloud-near-img cloud-near-1" ref={cloudNear1Ref} />
            <img src={assetUrl('assets/logistics/cloud-near.png')} alt="" className="cloud-near-img cloud-near-2" ref={cloudNear2Ref} />
            <img src={assetUrl('assets/logistics/cloud-near.png')} alt="" className="cloud-near-img cloud-near-3" ref={cloudNear3Ref} />
          </div>

          {/* Layer 6.5: Dynamic Left-to-Right Wipe Reveal of Import & Export / APAC Network */}
          <div className="aircraft-wipe-reveal" ref={aircraftRevealRef}>
            <div className="wipe-reveal-inner">
              <div className="wipe-left-col">
                <div className="wipe-eyebrow">
                  <span className="wipe-dot" />
                  GLOBAL IMPORT &amp; EXPORT • AIR FREIGHT CORRIDORS
                </div>
                <h2 className="wipe-title">
                  <span>TRUSTED BY BUSINESSES</span>
                  <span>ACROSS APAC</span>
                </h2>
                <p className="wipe-desc">
                  Integrated terminal dispatch, trans-oceanic cargo vessels, and scheduled international air freight corridors for seamless import and export operations worldwide.
                </p>
                <div className="wipe-tags-row">
                  <span className="wipe-tag">✈ AIR CARGO PRIORITY</span>
                  <span className="wipe-tag">CUSTOMS CLEARANCE</span>
                  <span className="wipe-tag">140+ PORTS</span>
                </div>
                <div className="wipe-stats-inline">
                  <div className="wipe-stat-item">
                    <span className="wipe-stat-num">140+</span>
                    <span className="wipe-stat-lbl">TRADE CORRIDORS</span>
                  </div>
                  <div className="wipe-stat-sep" />
                  <div className="wipe-stat-item">
                    <span className="wipe-stat-num">99.8%</span>
                    <span className="wipe-stat-lbl">ON-TIME CLEARANCE</span>
                  </div>
                  <div className="wipe-stat-sep" />
                  <div className="wipe-stat-item">
                    <span className="wipe-stat-num">520<small>KTS</small></span>
                    <span className="wipe-stat-lbl">AIR FREIGHT</span>
                  </div>
                </div>
              </div>

              <div className="wipe-right-col">
                <div className="wipe-testimonial-card">
                  <div className="testimonial-profile">
                    <div className="avatar-img-wrap">
                      <svg viewBox="0 0 80 80" className="avatar-svg" aria-label="Thomas Munro">
                        <circle cx="40" cy="40" r="40" fill="#E2DDD5" />
                        <circle cx="40" cy="32" r="16" fill="#A8A29E" />
                        <path d="M 16 70 Q 40 50 64 70 Z" fill="#78716C" />
                      </svg>
                    </div>
                    <div className="profile-info">
                      <span className="profile-name">THOMAS MUNRO</span>
                      <span className="profile-role">Director of Supply Chain &amp; Global Trade, APAC</span>
                    </div>
                  </div>
                  <p className="testimonial-text">
                    “My business wouldn't function without this team. Dedicated account managers that know our business, responsive, and providing personalized service with zero import delays which we never had with bigger carriers.”
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Layer 7: Overhead Aircraft Flyover (Nose pointing right) */}
          <div className="ocean-airplane-group" ref={airplaneGroupRef}>
            {/* Wingtip Contrails & Engine Heat Streams */}
            <div className="airplane-contrails" aria-hidden="true">
              <div className="contrail contrail-top" />
              <div className="contrail contrail-bottom" />
              <div className="jet-engine-glow engine-top" />
              <div className="jet-engine-glow engine-bottom" />
            </div>

            <img
              src={assetUrl('assets/logistics/plane-top.png')}
              alt="Cargo transport aircraft"
              className="airplane-img"
            />
          </div>
        </div>

        {/* Bottom Journey Step Tracker (Terminal / Road / Ocean) */}
        <div className="terminal-step-tracker" ref={bottomTrackerRef}>
          <div className="step-track-list">
            <button
              type="button"
              className="step-track-item active"
              ref={step0Ref}
              onClick={() => {
                const st = ScrollTrigger.getById('masterSceneTrigger') || ScrollTrigger.getAll()[0]
                if (st) window.scrollTo({ top: st.start, behavior: 'smooth' })
              }}
            >
              <div className="step-track-label">
                <span className="step-num">01</span>
                <span className="step-name">Terminal</span>
              </div>
              <div className="step-bar"><div className="step-bar-fill" /></div>
            </button>
            <button
              type="button"
              className="step-track-item"
              ref={step1Ref}
              onClick={() => {
                const st = ScrollTrigger.getById('masterSceneTrigger') || ScrollTrigger.getAll()[0]
                if (st) window.scrollTo({ top: st.start + (st.end - st.start) * 0.25, behavior: 'smooth' })
              }}
            >
              <div className="step-track-label">
                <span className="step-num">02</span>
                <span className="step-name">Road</span>
              </div>
              <div className="step-bar"><div className="step-bar-fill" /></div>
            </button>
            <button
              type="button"
              className="step-track-item"
              ref={step2Ref}
              onClick={() => {
                const st = ScrollTrigger.getById('masterSceneTrigger') || ScrollTrigger.getAll()[0]
                if (st) window.scrollTo({ top: st.start + (st.end - st.start) * 0.70, behavior: 'smooth' })
              }}
            >
              <div className="step-track-label">
                <span className="step-num">03</span>
                <span className="step-name">Ocean</span>
              </div>
              <div className="step-bar"><div className="step-bar-fill" /></div>
            </button>
          </div>
          <div className="scroll-hint">
            <span className="scroll-text">SCROLL</span>
            <span className="scroll-arrow">&darr;</span>
          </div>
        </div>
      </section>

      {/* ── SCENE 6: Light Trust & Network Section ── */}
      <TrustNetworkSection />

      {/* Site Footer */}
      <footer className="site-footer">
        <p>© 2026 United Logistics. All rights reserved.</p>
        <p>Global Integrated Freight Systems</p>
      </footer>
    </div>
  )
}

// ─── SCENE 6: Light Trust & Network Section (Mounted as Base Underlay) ───
function TrustNetworkSection() {
  return (
    <section className="trust-network-section" id="network" aria-label="Global freight network and trust">
      <div className="trust-container">
        <div className="trust-header">
          <div className="trust-eyebrow">
            <span className="terminal-eyebrow-dot" />
            Global Logistics Network
          </div>
          <h2 className="trust-title">
            <span>TRUSTED BY BUSINESSES</span>
            <span>ACROSS APAC</span>
          </h2>
          <p className="trust-desc">
            With integrated terminal dispatch, long-haul road freight, and cross-ocean vessel connectivity, our managed supply chain moves predictable, transparent, and accountable cargo worldwide.
          </p>
        </div>

        <div className="trust-content-grid">
          {/* Testimonial Card matching Frame 10 */}
          <div className="trust-testimonial-card">
            <div className="testimonial-profile">
              <div className="avatar-img-wrap">
                <svg viewBox="0 0 80 80" className="avatar-svg" aria-label="Thomas Munro">
                  <circle cx="40" cy="40" r="40" fill="#E2DDD5" />
                  <circle cx="40" cy="32" r="16" fill="#A8A29E" />
                  <path d="M 16 70 Q 40 50 64 70 Z" fill="#78716C" />
                </svg>
              </div>
              <div className="profile-info">
                <span className="profile-name">THOMAS MUNRO</span>
                <span className="profile-role">Director of Supply Chain, APAC</span>
              </div>
            </div>
            <p className="testimonial-text">
              “My business wouldn't function without this team. Extremely talented with immense experience tailoring each consignment based on its merits. We have dedicated account managers that know our business, are responsive and provide personalized service which we never had with bigger carriers. UC for the win.”
            </p>
          </div>

          {/* Stats Column */}
          <div className="trust-stats-column">
            <div className="trust-stat-card">
              <span className="stat-number">140+</span>
              <span className="stat-label">GLOBAL TRADE CORRIDORS</span>
              <p className="stat-sub">Direct scheduled maritime routes and highway freight connections across key Asian and Pacific hubs.</p>
            </div>

            <div className="trust-stat-card">
              <span className="stat-number">99.8%</span>
              <span className="stat-label">ON-TIME DISPATCH</span>
              <p className="stat-sub">Precision terminal crane loading and highway routing monitored 24/7 across all milestones.</p>
            </div>

            <div className="trust-stat-card">
              <span className="stat-number">24/7</span>
              <span className="stat-label">OPERATIONS & TRACKING</span>
              <p className="stat-sub">Real-time container telemetry and dedicated logistics support specialists on standby.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
