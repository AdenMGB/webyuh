<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import ArcadePage from './components/ArcadePage.vue'

type Project = {
  name: string
  line: string
  href: string
}

type Page = 'home' | 'arcade'

const navItems = [
  { label: 'AdenMGB', href: '#intro' },
  { label: 'Work', href: '#work' },
  { label: 'Arcade', href: '/arcade' },
  { label: 'Contact', href: '#contact' },
]

const projects: Project[] = [
  {
    name: 'BetterSEQTA',
    line: 'A cleaner school interface ecosystem built around speed and usability.',
    href: 'https://github.com/BetterSEQTA',
  },
  {
    name: 'DesQTA',
    line: 'A native desktop direction for the BetterSEQTA experience.',
    href: 'https://github.com/BetterSEQTA/DesQTA',
  },
  {
    name: 'BetterSEQTA Cloud',
    line: 'Cloud features for syncing, accounts, and connected BetterSEQTA tools.',
    href: 'https://adenmgb.com',
  },
]

const shaderCanvasRef = ref<HTMLCanvasElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const heroTitleRef = ref<HTMLElement | null>(null)
const currentPage = ref<Page>('home')
const activeSection = ref('AdenMGB')

let cleanupShader: (() => void) | undefined
let cleanupCanvas: (() => void) | undefined
let cleanupObservers: (() => void) | undefined
let cleanupHeroTitle: (() => void) | undefined
let cleanupRouting: (() => void) | undefined

onMounted(() => {
  cleanupRouting = setupRouting()
  cleanupObservers = setupObservers()
  cleanupHeroTitle = setupHeroTitleShader()

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  if (!prefersReducedMotion && import.meta.env.MODE !== 'test') {
    if (shaderCanvasRef.value) {
      cleanupShader = setupShaderBackdrop(shaderCanvasRef.value)
    }

    if (canvasRef.value) {
      cleanupCanvas = setupProductCanvas(canvasRef.value)
    }
  }
})

onBeforeUnmount(() => {
  cleanupShader?.()
  cleanupCanvas?.()
  cleanupObservers?.()
  cleanupHeroTitle?.()
  cleanupRouting?.()
})

function setupRouting() {
  const syncPage = () => {
    currentPage.value = window.location.pathname === '/arcade' ? 'arcade' : 'home'
    if (currentPage.value === 'arcade') {
      activeSection.value = 'Arcade'
      cleanupHomeEffects()
    } else {
      void refreshHomeEffects()
    }
  }

  syncPage()
  window.addEventListener('popstate', syncPage)

  return () => window.removeEventListener('popstate', syncPage)
}

async function navigate(event: MouseEvent, href: string) {
  event.preventDefault()

  if (href === '/arcade') {
    history.pushState({}, '', '/arcade')
    cleanupHomeEffects()
    currentPage.value = 'arcade'
    activeSection.value = 'Arcade'
    window.scrollTo({ top: 0, behavior: 'smooth' })

    return
  }

  if (currentPage.value === 'arcade') {
    history.pushState({}, '', '/')
    currentPage.value = 'home'
    await refreshHomeEffects()
  }

  const target = document.querySelector<HTMLElement>(href)
  target?.scrollIntoView({ behavior: 'smooth' })
}

function isNavActive(label: string) {
  return currentPage.value === 'arcade' ? label === 'Arcade' : activeSection.value === label
}

function cleanupHomeEffects() {
  cleanupObservers?.()
  cleanupObservers = undefined
  cleanupHeroTitle?.()
  cleanupHeroTitle = undefined
}

async function refreshHomeEffects() {
  await nextTick()
  cleanupHomeEffects()
  cleanupObservers = setupObservers()
  cleanupHeroTitle = setupHeroTitleShader()
}

function setupHeroTitleShader() {
  const title = heroTitleRef.value
  if (!title || import.meta.env.MODE === 'test') {
    return () => {}
  }

  let animationFrame = 0
  let targetX = 0.5
  let targetY = 0.5
  let currentX = 0.5
  let currentY = 0.5
  let targetHeat = 0
  let currentHeat = 0

  const updatePointer = (event: PointerEvent) => {
    const rect = title.getBoundingClientRect()
    targetX = Math.min(Math.max((event.clientX - rect.left) / Math.max(rect.width, 1), 0), 1)
    targetY = Math.min(Math.max((event.clientY - rect.top) / Math.max(rect.height, 1), 0), 1)
    targetHeat = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom ? 1 : 0.42
  }

  const coolDown = () => {
    targetHeat = 0
  }

  const render = () => {
    currentX += (targetX - currentX) * 0.12
    currentY += (targetY - currentY) * 0.12
    currentHeat += (targetHeat - currentHeat) * 0.08

    title.style.setProperty('--title-x', `${(currentX * 100).toFixed(2)}%`)
    title.style.setProperty('--title-y', `${(currentY * 100).toFixed(2)}%`)
    title.style.setProperty('--title-heat', currentHeat.toFixed(3))

    animationFrame = requestAnimationFrame(render)
  }

  render()
  window.addEventListener('pointermove', updatePointer, { passive: true })
  window.addEventListener('pointerleave', coolDown)
  window.addEventListener('blur', coolDown)

  return () => {
    cancelAnimationFrame(animationFrame)
    window.removeEventListener('pointermove', updatePointer)
    window.removeEventListener('pointerleave', coolDown)
    window.removeEventListener('blur', coolDown)
  }
}

function setupShaderBackdrop(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
    stencil: false,
  })

  if (!gl) {
    return () => {}
  }

  const vertexSource = `
    attribute vec2 aPosition;
    varying vec2 vUv;

    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `

  const fragmentSource = `
    precision highp float;

    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uScroll;
    uniform vec2 uPointer;

    varying vec2 vUv;

    float saturate(float value) {
      return clamp(value, 0.0, 1.0);
    }

    mat2 rotate2d(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat2(c, -s, s, c);
    }

    float sdRoundBox(vec2 p, vec2 b, float r) {
      vec2 q = abs(p) - b + r;
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }

    float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
      vec2 pa = p - a;
      vec2 ba = b - a;
      float h = saturate(dot(pa, ba) / dot(ba, ba));
      return length(pa - ba * h) - r;
    }

    float softFill(float distance, float blur) {
      return smoothstep(blur, -blur, distance);
    }

    float softStroke(float distance, float width, float blur) {
      return smoothstep(width + blur, width - blur, abs(distance));
    }

    float blob(vec2 p, vec2 center, float radius, float blur) {
      return smoothstep(radius + blur, radius - blur, length(p - center));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution.xy;
      vec2 p = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
      vec2 pointer = (uPointer * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
      float t = uTime * 0.13;
      float wave = sin(p.y * 1.9 + t * 1.7) * 0.045 + sin((p.x - p.y) * 1.18 - t * 1.1) * 0.028;
      vec2 warped = p + vec2(wave, -wave * 0.36) + pointer * 0.025;

      float diagonal = dot(warped, normalize(vec2(0.82, 0.48))) + uScroll * 0.42;
      float sweep = smoothstep(-0.92, 0.92, diagonal);
      float satin = smoothstep(0.82, 0.04, abs(fract(diagonal * 0.64 - t * 0.16) - 0.5));
      float redBlobA = blob(warped, vec2(-0.72 + sin(t * 1.4) * 0.08, 0.2 + cos(t) * 0.05), 0.58, 0.58);
      float redBlobB = blob(warped, vec2(0.55 + cos(t * 1.1) * 0.08, -0.46 + sin(t * 1.5) * 0.06), 0.44, 0.52);
      float emberBlob = blob(warped, vec2(0.18 + pointer.x * 0.08, 0.42 + pointer.y * 0.04), 0.34, 0.48);

      vec3 baseA = vec3(0.002, 0.002, 0.004);
      vec3 baseB = vec3(0.026, 0.009, 0.008);
      vec3 red = vec3(0.95, 0.045, 0.035);
      vec3 crimson = vec3(0.58, 0.0, 0.018);
      vec3 ember = vec3(1.0, 0.26, 0.07);
      vec3 cream = vec3(1.0, 0.82, 0.66);

      vec3 color = mix(baseA, baseB, uv.y * 0.76 + 0.1);
      color += crimson * redBlobA * 0.38;
      color += red * redBlobB * 0.28;
      color += ember * emberBlob * 0.14;
      color += cream * satin * 0.028;
      color = mix(color, color + red * 0.08, sweep * 0.22);

      vec2 cardA = rotate2d(-0.2 - uScroll * 0.12) * (warped - vec2(-0.42 + pointer.x * 0.055, 0.08));
      float cardDistance = sdRoundBox(cardA, vec2(0.58, 0.29), 0.17 + sin(t * 1.8) * 0.018);
      float card = softFill(cardDistance, 0.085);
      float cardEdge = softStroke(cardDistance, 0.008, 0.03);
      float cardHighlight = smoothstep(0.8, -0.25, cardA.x + cardA.y * 0.85);

      vec2 prismA = rotate2d(0.56 + uScroll * 0.2) * (warped - vec2(0.46 - pointer.x * 0.04, -0.24 + pointer.y * 0.05));
      float prismDistance = sdRoundBox(prismA, vec2(0.36, 0.2), 0.11 + cos(t * 2.0) * 0.012);
      float prism = softFill(prismDistance, 0.075);
      float prismEdge = softStroke(prismDistance, 0.007, 0.026);

      float streamDistance = sdCapsule(warped, vec2(-1.05, -0.43 + sin(t) * 0.05), vec2(0.95, 0.33 + cos(t * 0.8) * 0.05), 0.09);
      float stream = softFill(streamDistance, 0.11);
      float streamEdge = softStroke(streamDistance, 0.006, 0.035);

      vec3 glassTint = mix(vec3(1.0, 0.24, 0.16), vec3(1.0, 0.48, 0.24), sweep);
      color = mix(color, color + glassTint * (0.18 + cardHighlight * 0.12), card * 0.34);
      color += glassTint * cardEdge * 0.28;
      color = mix(color, color + vec3(1.0, 0.19, 0.09) * 0.18, prism * 0.3);
      color += vec3(1.0, 0.38, 0.18) * prismEdge * 0.22;
      color += vec3(0.86, 0.02, 0.02) * stream * 0.09;
      color += vec3(1.0, 0.45, 0.22) * streamEdge * 0.15;

      float pointerGlow = smoothstep(0.78, 0.0, length(warped - pointer * 0.18));
      color += vec3(1.0, 0.12, 0.05) * pointerGlow * 0.04;

      float vignette = smoothstep(1.38, 0.18, length((uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0)));
      color *= 0.72 + vignette * 0.38;
      color = pow(color, vec3(0.94));

      gl_FragColor = vec4(color, 1.0);
    }
  `

  const compileShader = (type: number, source: string) => {
    const shader = gl.createShader(type)
    if (!shader) {
      return null
    }

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader)

      return null
    }

    return shader
  }

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()

  if (!vertexShader || !fragmentShader || !program) {
    if (vertexShader) gl.deleteShader(vertexShader)
    if (fragmentShader) gl.deleteShader(fragmentShader)

    return () => {}
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)

    return () => {}
  }

  const buffer = gl.createBuffer()
  if (!buffer) {
    gl.deleteProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)

    return () => {}
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  )

  const positionLocation = gl.getAttribLocation(program, 'aPosition')
  const timeLocation = gl.getUniformLocation(program, 'uTime')
  const resolutionLocation = gl.getUniformLocation(program, 'uResolution')
  const scrollLocation = gl.getUniformLocation(program, 'uScroll')
  const pointerLocation = gl.getUniformLocation(program, 'uPointer')

  let animationFrame = 0
  let width = 0
  let height = 0
  let scrollTarget = 0
  let scrollCurrent = 0
  const pointerTarget = { x: 0.5, y: 0.48 }
  const pointerCurrent = { x: 0.5, y: 0.48 }

  const resize = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75)
    width = Math.max(window.innerWidth, 320)
    height = Math.max(window.innerHeight, 520)
    canvas.width = Math.floor(width * pixelRatio)
    canvas.height = Math.floor(height * pixelRatio)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  const updateScroll = () => {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
    scrollTarget = Math.min(Math.max(window.scrollY / maxScroll, 0), 1)
  }

  const updatePointer = (event: PointerEvent) => {
    pointerTarget.x = event.clientX / Math.max(width, 1)
    pointerTarget.y = 1 - event.clientY / Math.max(height, 1)
  }

  const render = (now: number) => {
    scrollCurrent += (scrollTarget - scrollCurrent) * 0.055
    pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.05
    pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.05

    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
    gl.uniform1f(timeLocation, now * 0.001)
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
    gl.uniform1f(scrollLocation, scrollCurrent)
    gl.uniform2f(pointerLocation, pointerCurrent.x, pointerCurrent.y)
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    animationFrame = requestAnimationFrame(render)
  }

  resize()
  updateScroll()
  render(performance.now())

  window.addEventListener('resize', resize)
  window.addEventListener('scroll', updateScroll, { passive: true })
  window.addEventListener('pointermove', updatePointer, { passive: true })

  return () => {
    cancelAnimationFrame(animationFrame)
    window.removeEventListener('resize', resize)
    window.removeEventListener('scroll', updateScroll)
    window.removeEventListener('pointermove', updatePointer)
    gl.deleteBuffer(buffer)
    gl.deleteProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
  }
}

function setupObservers() {
  const sections = [...document.querySelectorAll<HTMLElement>('[data-section]')]
  const revealItems = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'))

    return () => {}
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (visible) {
        activeSection.value = visible.target.getAttribute('data-section') ?? 'AdenMGB'
      }
    },
    { rootMargin: '-42% 0px -48% 0px', threshold: [0.1, 0.35, 0.65] },
  )

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        }
      })
    },
    { rootMargin: '0px 0px -16% 0px', threshold: 0.15 },
  )

  sections.forEach((section) => sectionObserver.observe(section))
  revealItems.forEach((item) => revealObserver.observe(item))

  return () => {
    sectionObserver.disconnect()
    revealObserver.disconnect()
  }
}

function setupProductCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d', { alpha: true })
  if (!context) {
    return () => {}
  }

  let animationFrame = 0
  let currentProgress = 0
  let targetProgress = 0
  let width = 0
  let height = 0
  let pixelRatio = 1

  const resize = () => {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    width = Math.max(window.innerWidth, 320)
    height = Math.max(window.innerHeight, 520)
    canvas.width = Math.floor(width * pixelRatio)
    canvas.height = Math.floor(height * pixelRatio)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  }

  const updateTarget = () => {
    const story = document.querySelector<HTMLElement>('.story')
    if (!story) {
      targetProgress = 0

      return
    }

    const rect = story.getBoundingClientRect()
    const distance = rect.height - window.innerHeight
    targetProgress = Math.min(Math.max(-rect.top / Math.max(distance, 1), 0), 1)
  }

  const roundedRect = (x: number, y: number, rectWidth: number, rectHeight: number, radius: number) => {
    const round = Math.min(radius, rectWidth / 2, rectHeight / 2)
    context.beginPath()
    context.moveTo(x + round, y)
    context.arcTo(x + rectWidth, y, x + rectWidth, y + rectHeight, round)
    context.arcTo(x + rectWidth, y + rectHeight, x, y + rectHeight, round)
    context.arcTo(x, y + rectHeight, x, y, round)
    context.arcTo(x, y, x + rectWidth, y, round)
    context.closePath()
  }

  const drawMorphBlob = (
    centerX: number,
    centerY: number,
    radius: number,
    progress: number,
    colorA: string,
    colorB: string,
  ) => {
    const points = 96
    const phase = performance.now() * 0.00055 + progress * Math.PI * 2

    context.beginPath()
    for (let index = 0; index <= points; index += 1) {
      const angle = (index / points) * Math.PI * 2
      const pulse = Math.sin(angle * 3 + phase) * 0.12 + Math.cos(angle * 5 - phase * 1.4) * 0.07
      const localRadius = radius * (1 + pulse + progress * 0.1)
      const pointX = centerX + Math.cos(angle) * localRadius
      const pointY = centerY + Math.sin(angle) * localRadius * (0.78 + progress * 0.16)

      if (index === 0) {
        context.moveTo(pointX, pointY)
      } else {
        context.lineTo(pointX, pointY)
      }
    }
    context.closePath()

    const fill = context.createRadialGradient(centerX - radius * 0.28, centerY - radius * 0.34, 0, centerX, centerY, radius * 1.35)
    fill.addColorStop(0, colorA)
    fill.addColorStop(0.58, colorB)
    fill.addColorStop(1, 'rgba(0, 0, 0, 0)')
    context.fillStyle = fill
    context.fill()
  }

  const draw = () => {
    currentProgress += (targetProgress - currentProgress) * 0.085

    context.clearRect(0, 0, width, height)

    const centerX = width / 2
    const centerY = height / 2
    const introScale = 1 - currentProgress * 0.09
    const rotate = -4 + currentProgress * 8
    const lift = -currentProgress * height * 0.08
    const deviceWidth = Math.min(width * 0.68, 760) * introScale
    const deviceHeight = deviceWidth * 0.6
    const x = centerX - deviceWidth / 2
    const y = centerY - deviceHeight / 2 + lift

    const glow = context.createRadialGradient(centerX, centerY, 20, centerX, centerY, Math.max(width, height) * 0.45)
    glow.addColorStop(0, `rgba(255, 255, 255, ${0.1 + currentProgress * 0.06})`)
    glow.addColorStop(0.55, 'rgba(190, 195, 205, 0.055)')
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    context.fillStyle = glow
    context.fillRect(0, 0, width, height)

    context.save()
    context.globalCompositeOperation = 'lighter'
    context.filter = `blur(${Math.max(18, Math.min(width, height) * 0.034)}px)`
    drawMorphBlob(
      centerX - deviceWidth * (0.42 - currentProgress * 0.26),
      centerY - deviceHeight * (0.46 - currentProgress * 0.18) + lift,
      Math.min(width, height) * (0.16 + currentProgress * 0.03),
      currentProgress,
      'rgba(255, 37, 24, 0.44)',
      'rgba(255, 117, 57, 0.16)',
    )
    drawMorphBlob(
      centerX + deviceWidth * (0.48 - currentProgress * 0.22),
      centerY + deviceHeight * (0.34 - currentProgress * 0.12) + lift,
      Math.min(width, height) * (0.13 + currentProgress * 0.045),
      1 - currentProgress,
      'rgba(184, 0, 12, 0.34)',
      'rgba(255, 92, 39, 0.14)',
    )
    context.filter = 'none'
    context.restore()

    context.save()
    context.translate(centerX, centerY + lift)
    context.rotate((rotate * Math.PI) / 180)
    context.translate(-centerX, -(centerY + lift))

    context.shadowColor = 'rgba(0, 0, 0, 0.65)'
    context.shadowBlur = 70
    context.shadowOffsetY = 42
    roundedRect(x, y, deviceWidth, deviceHeight, 34)
    context.fillStyle = '#0a0c10'
    context.fill()

    context.shadowBlur = 0
    roundedRect(x + 8, y + 8, deviceWidth - 16, deviceHeight - 16, 26)
    const screen = context.createLinearGradient(x, y, x + deviceWidth, y + deviceHeight)
    screen.addColorStop(0, '#fbfbfd')
    screen.addColorStop(0.48, '#c6c8cf')
    screen.addColorStop(1, '#4a4d55')
    context.fillStyle = screen
    context.fill()

    context.globalAlpha = 0.82
    context.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    context.lineWidth = 1
    for (let index = 0; index < 5; index += 1) {
      const lineY = y + deviceHeight * (0.31 + index * 0.085)
      const lineWidth = deviceWidth * (0.56 - index * 0.045 + currentProgress * 0.05)
      roundedRect(x + deviceWidth * 0.19, lineY, lineWidth, 6, 3)
      context.stroke()
    }

    context.globalAlpha = 1
    context.fillStyle = 'rgba(255, 255, 255, 0.85)'
    roundedRect(x + deviceWidth * 0.19, y + deviceHeight * 0.19, deviceWidth * 0.24, 11, 5)
    context.fill()

    context.restore()

    const ringRadius = Math.min(width, height) * (0.2 + currentProgress * 0.08)
    context.beginPath()
    context.arc(centerX, centerY + lift, ringRadius, 0, Math.PI * 2)
    context.strokeStyle = `rgba(255, 255, 255, ${0.1 - currentProgress * 0.04})`
    context.lineWidth = 1
    context.stroke()

    context.save()
    context.translate(centerX, centerY + lift)
    context.rotate(currentProgress * Math.PI * 0.16)
    context.globalAlpha = 0.32 - currentProgress * 0.08
    context.strokeStyle = 'rgba(255, 102, 67, 0.46)'
    context.lineWidth = 1.2
    for (let index = 0; index < 3; index += 1) {
      context.beginPath()
      context.ellipse(0, 0, ringRadius * (1.2 + index * 0.32), ringRadius * (0.42 + index * 0.12), 0, 0, Math.PI * 2)
      context.stroke()
      context.rotate(Math.PI / 3.4)
    }
    context.restore()

    animationFrame = requestAnimationFrame(draw)
  }

  resize()
  updateTarget()
  draw()

  window.addEventListener('resize', resize)
  window.addEventListener('scroll', updateTarget, { passive: true })

  return () => {
    cancelAnimationFrame(animationFrame)
    window.removeEventListener('resize', resize)
    window.removeEventListener('scroll', updateTarget)
  }
}

</script>

<template>
  <div class="site-shell">
    <canvas ref="shaderCanvasRef" class="shader-backdrop" aria-hidden="true"></canvas>
    <nav class="top-nav" aria-label="Primary navigation">
      <a
        v-for="item in navItems"
        :key="item.href"
        :href="item.href"
        :class="{ 'is-active': isNavActive(item.label) }"
        @click="navigate($event, item.href)"
      >
        {{ item.label }}
      </a>
    </nav>

    <Transition name="page-shift" mode="out-in" @after-enter="currentPage === 'home' && refreshHomeEffects()">
      <main v-if="currentPage === 'home'" key="home">
        <section id="intro" class="hero" data-section="AdenMGB">
          <div class="hero-inner">
            <p class="eyebrow" data-reveal>Developer. Creative technologist.</p>
            <h1 ref="heroTitleRef" class="hero-title" data-text="AdenMGB" data-reveal>AdenMGB</h1>
            <p class="lead" data-reveal>Open-source interfaces and BetterSEQTA tools built for speed and polish.</p>
          </div>
        </section>

        <section class="story" aria-label="AdenMGB product story">
          <div class="sticky-stage">
            <canvas ref="canvasRef" aria-hidden="true"></canvas>
            <div class="story-copy">
              <p class="eyebrow" data-reveal>Built with intent</p>
              <h2 data-reveal>Less noise. More signal.</h2>
              <p data-reveal>Focused interfaces, smooth motion, and tools that stay out of the way.</p>
            </div>
          </div>
        </section>

        <section id="work" class="panel" data-section="Work">
          <div class="section-heading" data-reveal>
            <p class="eyebrow">Selected work</p>
            <h2>BetterSEQTA, refined.</h2>
          </div>

          <div class="work-list">
            <a v-for="project in projects" :key="project.name" :href="project.href" target="_blank" rel="noreferrer" data-reveal>
              <span>{{ project.name }}</span>
              <p>{{ project.line }}</p>
            </a>
          </div>
        </section>

        <section id="contact" class="contact" data-section="Contact">
          <div class="contact-inner" data-reveal>
            <p class="eyebrow">Contact</p>
            <h2>Build something clean.</h2>
            <div class="contact-links">
              <a href="https://github.com/AdenMGB" target="_blank" rel="noreferrer">GitHub</a>
              <a href="mailto:aden@adenmgb.com">aden@adenmgb.com</a>
              <a href="https://discord.com/" target="_blank" rel="noreferrer">Discord: AdenMGB</a>
            </div>
          </div>
        </section>
      </main>

      <ArcadePage v-else key="arcade" />
    </Transition>
  </div>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(html) {
  scroll-behavior: smooth;
  background: #000;
}

:global(body) {
  min-width: 320px;
  margin: 0;
  color: #f5f5f7;
  background: #000;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

:global(a) {
  color: inherit;
}

.site-shell {
  position: relative;
  min-height: 100vh;
  overflow-x: clip;
  background:
    linear-gradient(180deg, rgba(18, 3, 3, 0.18), rgba(0, 0, 0, 0.86) 68rem),
    radial-gradient(circle at 50% 8%, rgba(255, 44, 31, 0.08), transparent 30rem),
    #000;
  isolation: isolate;
}

.shader-backdrop {
  position: fixed;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 27% 20%, rgba(255, 33, 24, 0.24), transparent 28rem),
    radial-gradient(circle at 72% 62%, rgba(255, 93, 38, 0.15), transparent 32rem),
    radial-gradient(circle at 48% 78%, rgba(120, 0, 10, 0.18), transparent 26rem),
    linear-gradient(135deg, #090101, #000 74%);
}

.site-shell::before {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  content: "";
  background:
    radial-gradient(circle at 50% 12%, rgba(255, 55, 38, 0.07), transparent 25rem),
    linear-gradient(90deg, rgba(255, 78, 52, 0.024) 1px, transparent 1px),
    linear-gradient(rgba(255, 78, 52, 0.016) 1px, transparent 1px);
  background-size: auto, 5.5rem 5.5rem, 5.5rem 5.5rem;
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.86), transparent 78%);
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.86), transparent 78%);
  opacity: 0.54;
}

.top-nav {
  position: fixed;
  top: 1rem;
  left: 50%;
  z-index: 20;
  display: flex;
  gap: 0.35rem;
  padding: 0.35rem;
  transform: translateX(-50%);
  border: 1px solid rgba(255, 74, 52, 0.12);
  border-radius: 999px;
  background: rgba(13, 6, 6, 0.58);
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(30px) saturate(1.25);
}

.top-nav a {
  padding: 0.62rem 0.95rem;
  border-radius: 999px;
  color: rgba(245, 245, 247, 0.68);
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 260ms cubic-bezier(0.22, 1, 0.36, 1), background 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.top-nav a:hover,
.top-nav a.is-active {
  color: #fff;
  background: rgba(255, 55, 35, 0.14);
}

.hero,
.panel,
.contact {
  width: min(1100px, calc(100% - 2rem));
  margin: 0 auto;
}

.hero {
  display: grid;
  min-height: 100vh;
  place-items: center;
  text-align: center;
}

.hero-inner {
  position: relative;
  max-width: 920px;
  overflow: visible;
}

.hero-inner::before,
.hero-inner::after {
  position: absolute;
  z-index: -1;
  display: block;
  width: clamp(8rem, 18vw, 17rem);
  height: clamp(8rem, 18vw, 17rem);
  border: 1px solid rgba(255, 68, 45, 0.18);
  border-radius: 42% 58% 62% 38% / 43% 38% 62% 57%;
  content: "";
  filter: blur(0.2px);
  opacity: 0.7;
  animation: morph-orbit 16s ease-in-out infinite alternate;
}

.hero-inner::before {
  top: -9vw;
  left: -9vw;
  background: linear-gradient(135deg, rgba(255, 34, 24, 0.2), rgba(255, 117, 57, 0.045));
  box-shadow: inset 0 0 3rem rgba(255, 96, 72, 0.055), 0 0 5rem rgba(255, 35, 24, 0.18);
}

.hero-inner::after {
  right: -8vw;
  bottom: -7vw;
  background: linear-gradient(135deg, rgba(165, 0, 12, 0.18), rgba(255, 92, 39, 0.055));
  box-shadow: inset 0 0 3rem rgba(255, 90, 60, 0.05), 0 0 5rem rgba(255, 45, 25, 0.14);
  animation-delay: -6s;
}

.eyebrow {
  margin: 0 0 1rem;
  color: rgba(245, 245, 247, 0.62);
  font-size: clamp(0.88rem, 1.6vw, 1rem);
  font-weight: 750;
  letter-spacing: 0.05em;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin: -0.08em -0.18em 1.22rem;
  padding: 0.08em 0.18em 0.18em;
  background:
    radial-gradient(circle at var(--title-x, 50%) var(--title-y, 50%), rgba(255, 218, 205, calc(0.52 * var(--title-heat, 0))) 0 5%, rgba(255, 112, 76, calc(0.62 * var(--title-heat, 0))) 12%, transparent 28%),
    linear-gradient(105deg, #f4d6ce 4%, #eaa493 25%, #ff4d31 46%, #97000b 64%, #f0c7bd 88%);
  background-size: 120% 120%, 180% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  font-size: clamp(4.9rem, 16vw, 13.4rem);
  font-weight: 830;
  line-height: 0.94;
  letter-spacing: -0.098em;
  text-shadow: 0 1.2rem 5rem rgba(255, 42, 27, 0.34);
  -webkit-text-fill-color: transparent;
}

.hero-title {
  --title-x: 50%;
  --title-y: 50%;
  --title-heat: 0;

  position: relative;
  display: inline-block;
  max-width: calc(100vw - 1rem);
  overflow: visible;
  animation: title-gradient-drift 9s ease-in-out infinite alternate;
}

h2 {
  margin-bottom: 1.1rem;
  font-size: clamp(2.6rem, 7vw, 6.4rem);
  font-weight: 800;
  line-height: 0.96;
  letter-spacing: -0.07em;
  text-wrap: balance;
}

.lead,
.story-copy p,
.work-list p,
.section-heading > p:not(.eyebrow) {
  color: rgba(245, 245, 247, 0.68);
  font-size: clamp(1.15rem, 2.2vw, 1.6rem);
  line-height: 1.45;
}

.story {
  height: 250vh;
}

.sticky-stage {
  position: sticky;
  top: 0;
  display: grid;
  height: 100vh;
  overflow: hidden;
  place-items: center;
}

.sticky-stage canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.story-copy {
  position: relative;
  z-index: 1;
  width: min(820px, calc(100% - 2rem));
  margin-top: 34vh;
  padding: 2rem;
  border: 1px solid rgba(255, 68, 45, 0.1);
  border-radius: 2.4rem;
  background: linear-gradient(180deg, rgba(15, 4, 4, 0.48), rgba(5, 2, 2, 0.16));
  box-shadow: inset 0 1px 0 rgba(255, 91, 64, 0.055), 0 1.5rem 6rem rgba(0, 0, 0, 0.32);
  text-align: center;
  backdrop-filter: blur(24px) saturate(1.25);
}

.panel {
  padding: 10rem 0 7rem;
}

.section-heading {
  max-width: 820px;
  margin: 0 auto 4rem;
  text-align: center;
}

.work-list {
  display: grid;
  gap: 0.85rem;
  max-width: 920px;
  margin: 0 auto;
}

.work-list a {
  position: relative;
  z-index: 0;
  display: grid;
  grid-template-columns: 0.44fr 1fr;
  gap: 1.4rem;
  align-items: center;
  min-height: 7.4rem;
  padding: 1.45rem 1.7rem;
  border: 1px solid rgba(255, 68, 45, 0.095);
  border-radius: 1.85rem;
  background: linear-gradient(180deg, rgba(255, 65, 43, 0.07), rgba(255, 255, 255, 0.024));
  box-shadow: inset 0 1px 0 rgba(255, 96, 70, 0.055);
  text-decoration: none;
  overflow: hidden;
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1), background 500ms cubic-bezier(0.22, 1, 0.36, 1), border-color 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

.work-list a::before {
  position: absolute;
  inset: -1px;
  z-index: 0;
  content: "";
  background: radial-gradient(circle at var(--glow-x, 18%) 50%, rgba(255, 44, 29, 0.24), transparent 21rem);
  opacity: 0;
  transition: opacity 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

.work-list a > * {
  position: relative;
  z-index: 1;
}

.work-list a:hover {
  border-color: rgba(255, 87, 58, 0.22);
  background: linear-gradient(180deg, rgba(255, 55, 35, 0.105), rgba(255, 255, 255, 0.035));
  transform: scale(1.01) translateY(-2px);
}

.work-list a:hover::before {
  opacity: 1;
}

.work-list span {
  font-size: clamp(1.5rem, 3vw, 2.45rem);
  font-weight: 760;
  letter-spacing: -0.055em;
}

.work-list p {
  margin: 0;
  font-size: clamp(1rem, 2vw, 1.35rem);
}

.contact {
  display: grid;
  min-height: 92vh;
  place-items: center;
  text-align: center;
}

.contact-inner {
  max-width: 900px;
}

.contact-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 2rem;
}

.contact-links a {
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  border: 1px solid rgba(255, 70, 47, 0.13);
  border-radius: 999px;
  background: rgba(255, 52, 35, 0.052);
  color: rgba(245, 245, 247, 0.82);
  font-weight: 720;
  text-decoration: none;
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1), background 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.contact-links a:hover {
  background: rgba(255, 52, 35, 0.13);
  transform: translateY(-2px);
}

.page-shift-enter-active,
.page-shift-leave-active {
  transition: opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1), filter 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.page-shift-enter-from {
  opacity: 0;
  filter: blur(18px);
  transform: translateY(1.6rem) scale(0.985);
}

.page-shift-leave-to {
  opacity: 0;
  filter: blur(14px);
  transform: translateY(-1rem) scale(0.99);
}

[data-reveal] {
  opacity: 0;
  transform: translateY(2.4rem) scale(0.985);
  transition: opacity 950ms cubic-bezier(0.16, 1, 0.3, 1), transform 950ms cubic-bezier(0.16, 1, 0.3, 1);
}

[data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@keyframes morph-orbit {
  0% {
    border-radius: 42% 58% 62% 38% / 43% 38% 62% 57%;
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  }

  50% {
    border-radius: 62% 38% 41% 59% / 54% 63% 37% 46%;
    transform: translate3d(1.4rem, -0.8rem, 0) rotate(12deg) scale(1.08);
  }

  100% {
    border-radius: 37% 63% 58% 42% / 39% 47% 53% 61%;
    transform: translate3d(-0.8rem, 1.1rem, 0) rotate(-9deg) scale(0.96);
  }
}

@keyframes title-gradient-drift {
  0% {
    background-position: 0% 50%, 0% 50%;
  }

  100% {
    background-position: 100% 50%, 68% 50%;
  }
}

.hero [data-reveal]:nth-child(2) {
  transition-delay: 90ms;
}

.hero [data-reveal]:nth-child(3) {
  transition-delay: 180ms;
}

@media (max-width: 700px) {
  .hero,
  .panel,
  .contact {
    width: min(100% - 1.1rem, 1100px);
  }

  .top-nav {
    top: auto;
    bottom: 0.8rem;
  }

  .story {
    height: 230vh;
  }

  .story-copy {
    margin-top: 42vh;
    padding: 1.4rem;
    border-radius: 1.7rem;
  }

  .panel {
    padding: 5.5rem 0;
  }

  .work-list a {
    grid-template-columns: 1fr;
    gap: 0.45rem;
  }

  .hero-inner::before,
  .hero-inner::after {
    opacity: 0.42;
  }

  h1 {
    margin-right: -0.12em;
    margin-left: -0.12em;
    padding-right: 0.12em;
    padding-left: 0.12em;
    letter-spacing: -0.082em;
  }

}

@media (prefers-reduced-motion: reduce) {
  :global(html) {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
