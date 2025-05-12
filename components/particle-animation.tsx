"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

interface ParticleAnimationProps {
  containerId: string
}

export default function ParticleAnimation({ containerId }: ParticleAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const isMobile = window.innerWidth < 768

    // Set canvas size
    const resizeCanvas = () => {
      const container = document.getElementById(containerId)
      if (container) {
        canvas.width = container.offsetWidth
        canvas.height = container.offsetHeight
      } else {
        canvas.width = window.innerWidth
        canvas.height = 300
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      baseX: number
      baseY: number
      density: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.baseX = this.x
        this.baseY = this.y
        this.size = Math.random() * 3 + 1
        this.density = Math.random() * 30 + 1
        this.color = Math.random() > 0.5 ? "#0A9396" : "#ffffff"
      }

      update(mouseX: number, mouseY: number, deviceOrientation?: DeviceOrientationEvent) {
        // Si estamos en móvil y tenemos datos de orientación, usamos eso para mover las partículas
        if (isMobile && deviceOrientation && deviceOrientation.beta && deviceOrientation.gamma) {
          const tiltX = deviceOrientation.gamma / 10 // Inclinación izquierda/derecha
          const tiltY = deviceOrientation.beta / 10 // Inclinación adelante/atrás

          // Aplicar fuerza basada en la inclinación del dispositivo
          this.x += tiltX * 0.2
          this.y += tiltY * 0.2

          // Mantener las partículas dentro del canvas
          if (this.x < 0 || this.x > canvas.width) {
            this.x = this.baseX
          }
          if (this.y < 0 || this.y > canvas.height) {
            this.y = this.baseY
          }

          // Volver lentamente a la posición original cuando no hay mucha inclinación
          if (Math.abs(tiltX) < 1 && Math.abs(tiltY) < 1) {
            if (this.x !== this.baseX) {
              const dx = this.x - this.baseX
              this.x -= dx / 20
            }
            if (this.y !== this.baseY) {
              const dy = this.y - this.baseY
              this.y -= dy / 20
            }
          }
        } else {
          // Comportamiento normal para escritorio
          // Distance between mouse and particle
          const dx = mouseX - this.x
          const dy = mouseY - this.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const forceDirectionX = dx / distance
          const forceDirectionY = dy / distance

          // Max distance, past that the force will be 0
          const maxDistance = 80 // Reduced from 100 to make mouse area smaller
          let force = (maxDistance - distance) / maxDistance

          // If we're too far away, no force is applied
          if (force < 0) force = 0

          // Movement based on repelling force
          const directionX = forceDirectionX * force * this.density * -1.5 // Increased repulsion force
          const directionY = forceDirectionY * force * this.density * -1.5 // Increased repulsion force

          if (distance < maxDistance) {
            this.x += directionX
            this.y += directionY
          } else {
            // Return to original position when not affected by mouse
            if (this.x !== this.baseX) {
              const dx = this.x - this.baseX
              this.x -= dx / 10
            }
            if (this.y !== this.baseY) {
              const dy = this.y - this.baseY
              this.y -= dy / 10
            }
          }
        }
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Create particles
    const particleCount = isMobile ? 50 : 100 // Increased particle count
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Mouse position
    let mouseX = 0
    let mouseY = 0

    // Track mouse position
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    })

    // Track device orientation for mobile
    let deviceOrientation: DeviceOrientationEvent | undefined

    if (isMobile && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (event) => {
        deviceOrientation = event
      })
    }

    // Animation loop
    const animate = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const particle of particles) {
        particle.update(mouseX, mouseY, deviceOrientation)
        particle.draw()
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (isMobile && window.DeviceOrientationEvent) {
        window.removeEventListener("deviceorientation", () => {})
      }
    }
  }, [containerId, theme])

  return (
    <div id={containerId} className="absolute inset-0 z-0">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
