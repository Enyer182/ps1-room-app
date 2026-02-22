import * as THREE from 'three'

export function createPosterTexture(title: string, subtitle: string, c1: string, c2: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 768
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new THREE.CanvasTexture(canvas)
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, c1)
  gradient.addColorStop(1, c2)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.globalAlpha = 0.2
  for (let i = 0; i < 24; i += 1) {
    const y = (i / 24) * canvas.height
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#000000'
    ctx.fillRect(0, y, canvas.width, 8)
  }

  ctx.globalAlpha = 1
  ctx.fillStyle = '#f7f2d9'
  ctx.font = '700 52px "Trebuchet MS", sans-serif'
  ctx.fillText(title, 28, 90)

  ctx.fillStyle = '#ffe47b'
  ctx.font = '600 34px "Trebuchet MS", sans-serif'
  ctx.fillText(subtitle, 28, 140)

  ctx.strokeStyle = '#111'
  ctx.lineWidth = 14
  ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createCarpetTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new THREE.CanvasTexture(canvas)
  }

  ctx.fillStyle = '#3a2e28'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 2200; i += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const shade = 30 + Math.floor(Math.random() * 60)
    ctx.fillStyle = `rgb(${shade + 25}, ${shade + 15}, ${shade})`
    ctx.fillRect(x, y, 2, 2)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(7, 5)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createWoodTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new THREE.CanvasTexture(canvas)
  }

  ctx.fillStyle = '#6b4d33'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 40; i += 1) {
    const y = (i / 40) * canvas.height
    ctx.fillStyle = i % 2 === 0 ? '#5a3f2a' : '#7a5839'
    ctx.fillRect(0, y, canvas.width, 10 + Math.random() * 10)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 1)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createCanTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new THREE.CanvasTexture(canvas)
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#0a0f0d')
  gradient.addColorStop(1, '#1b1f1d')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#7bff5c'
  ctx.font = '900 58px "Arial Black", sans-serif'
  ctx.fillText('M0NSTER', 16, 214)
  ctx.font = '700 32px "Arial Black", sans-serif'
  ctx.fillText('ENERGY', 58, 262)

  ctx.strokeStyle = '#7bff5c'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(118, 78)
  ctx.lineTo(98, 168)
  ctx.lineTo(128, 136)
  ctx.lineTo(120, 240)
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createWallpaperTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new THREE.CanvasTexture(canvas)
  }

  const baseGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  baseGradient.addColorStop(0, '#5a4f67')
  baseGradient.addColorStop(0.52, '#4b4057')
  baseGradient.addColorStop(1, '#43384f')
  ctx.fillStyle = baseGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Fine plaster grain.
  for (let i = 0; i < 42000; i += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const a = 0.02 + Math.random() * 0.06
    const tone = 120 + Math.floor(Math.random() * 80)
    ctx.fillStyle = `rgba(${tone}, ${tone - 8}, ${tone + 4}, ${a})`
    ctx.fillRect(x, y, 1.6, 1.6)
  }

  // Subtle vertical wallpaper seams.
  for (let x = 0; x <= canvas.width; x += 128) {
    ctx.fillStyle = 'rgba(255, 235, 215, 0.04)'
    ctx.fillRect(x, 0, 2, canvas.height)
    ctx.fillStyle = 'rgba(20, 16, 28, 0.06)'
    ctx.fillRect(x + 2, 0, 2, canvas.height)
  }

  // Soft horizontal aging bands.
  for (let y = 88; y < canvas.height; y += 176) {
    ctx.fillStyle = 'rgba(255, 220, 190, 0.03)'
    ctx.fillRect(0, y, canvas.width, 10)
    ctx.fillStyle = 'rgba(28, 20, 34, 0.04)'
    ctx.fillRect(0, y + 10, canvas.width, 8)
  }

  // Light vignette to avoid flat look.
  const vignette = ctx.createRadialGradient(
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.width * 0.16,
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.width * 0.72,
  )
  vignette.addColorStop(0, 'rgba(255, 255, 255, 0)')
  vignette.addColorStop(1, 'rgba(18, 12, 24, 0.2)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2.2, 1.8)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createFabricTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return new THREE.CanvasTexture(canvas)
  }

  ctx.fillStyle = '#5a302f'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'rgba(255, 215, 170, 0.08)'
  for (let i = -canvas.height; i < canvas.width; i += 10) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i + canvas.height, canvas.height)
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(40, 22, 22, 0.12)'
  for (let i = 0; i < canvas.width + canvas.height; i += 12) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i - canvas.height, canvas.height)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
