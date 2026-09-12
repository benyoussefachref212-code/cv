'use client'

import { cn } from '@/lib/utils'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Check, X, RotateCcw } from 'lucide-react'

interface ColorWheelProps {
  value: string
  onChange: (color: string) => void
  className?: string
  label?: string
  showReset?: boolean
}

// Convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  l /= 100
  const a = s * Math.min(l, 1 - l) / 100
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Convert Hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { h: 0, s: 100, l: 50 }
  
  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 }
}

// Validate hex color
function isValidHex(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}

export function ColorWheel({ 
  value, 
  onChange, 
  className,
  label = 'Couleur',
  showReset = true
}: ColorWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null)
  const satBrightRef = useRef<HTMLDivElement>(null)
  const [isDraggingWheel, setIsDraggingWheel] = useState(false)
  const [isDraggingSatBright, setIsDraggingSatBright] = useState(false)
  const [hexInput, setHexInput] = useState(value)
  
  // Get current HSL from value
  const hsl = hexToHsl(value)
  const [hue, setHue] = useState(hsl.h)
  const [saturation, setSaturation] = useState(hsl.s)
  const [lightness, setLightness] = useState(hsl.l)

  // Update internal state when value changes externally
  useEffect(() => {
    const newHsl = hexToHsl(value)
    setHue(newHsl.h)
    setSaturation(newHsl.s)
    setLightness(newHsl.l)
    setHexInput(value)
  }, [value])

  // Get position on wheel from hue
  const getWheelPosition = (hueDeg: number) => {
    const radius = 120
    const center = 140
    const rad = (hueDeg - 90) * Math.PI / 180
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad)
    }
  }

  // Get hue from position on wheel
  const getHueFromPosition = (x: number, y: number, center: number): number => {
    const dx = x - center
    const dy = y - center
    let angle = Math.atan2(dy, dx) * 180 / Math.PI
    angle = (angle + 90 + 360) % 360
    return angle
  }

  // Handle wheel click/move
  const handleWheelInteraction = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!wheelRef.current) return
    
    const rect = wheelRef.current.getBoundingClientRect()
    const center = rect.width / 2
    const radius = center - 20
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const dx = x - center
    const dy = y - center
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance <= radius) {
      const newHue = getHueFromPosition(x, y, center)
      setHue(newHue)
      const newColor = hslToHex(newHue, saturation, lightness)
      onChange(newColor)
      setHexInput(newColor)
    }
  }, [saturation, lightness, onChange])

  // Handle saturation/brightness click/move
  const handleSatBrightInteraction = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!satBrightRef.current) return
    
    const rect = satBrightRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    
    const newSaturation = x * 100
    const newLightness = (1 - y) * 100
    
    setSaturation(newSaturation)
    setLightness(newLightness)
    const newColor = hslToHex(hue, newSaturation, newLightness)
    onChange(newColor)
    setHexInput(newColor)
  }, [hue, onChange])

  // Mouse event handlers for wheel
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingWheel) {
        handleWheelInteraction(e)
      }
      if (isDraggingSatBright) {
        handleSatBrightInteraction(e)
      }
    }
    
    const handleMouseUp = () => {
      setIsDraggingWheel(false)
      setIsDraggingSatBright(false)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingWheel, isDraggingSatBright, handleWheelInteraction, handleSatBrightInteraction])

  // Handle hex input change
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setHexInput(val)
    if (isValidHex(val)) {
      const newHsl = hexToHsl(val)
      setHue(newHsl.h)
      setSaturation(newHsl.s)
      setLightness(newHsl.l)
      onChange(val)
    }
  }

  // Handle hex blur - fix format if valid
  const handleHexBlur = () => {
    if (isValidHex(hexInput)) {
      const formatted = hexInput.length === 4 ? 
        `#${hexInput[1]}${hexInput[1]}${hexInput[2]}${hexInput[2]}${hexInput[3]}${hexInput[3]}` :
        hexInput
      setHexInput(formatted.toUpperCase())
      onChange(formatted.toUpperCase())
    } else {
      setHexInput(value)
    }
  }

  // Reset to default (black)
  const handleReset = () => {
    const defaultColor = '#0F172A'
    setHue(220)
    setSaturation(60)
    setLightness(15)
    setHexInput(defaultColor)
    onChange(defaultColor)
  }

  const wheelPos = getWheelPosition(hue)
  const currentColor = hslToHex(hue, saturation, lightness)

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600">{label}</span>
          {showReset && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:bg-slate-50"
            >
              <RotateCcw className="h-3 w-3" />
              Réinitialiser
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Color Wheel */}
        <div className="relative shrink-0">
          <div
            ref={wheelRef}
            className="h-[280px] w-[280px] cursor-crosshair rounded-full shadow-lg"
            style={{
              background: `
                conic-gradient(
                  from 0deg,
                  hsl(0, 100%, 50%),
                  hsl(60, 100%, 50%),
                  hsl(120, 100%, 50%),
                  hsl(180, 100%, 50%),
                  hsl(240, 100%, 50%),
                  hsl(300, 100%, 50%),
                  hsl(360, 100%, 50%)
                )
              `,
            }}
            onMouseDown={(e) => {
              setIsDraggingWheel(true)
              handleWheelInteraction(e)
            }}
            onMouseMove={(e) => {
              if (isDraggingWheel) {
                handleWheelInteraction(e)
              }
            }}
          >
            {/* Center circle with current color */}
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/60 shadow-lg"
              style={{
                width: '40px',
                height: '40px',
                background: currentColor,
                pointerEvents: 'none',
              }}
            />
            
            {/* Selection indicator on wheel */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: wheelPos.x - 10,
                top: wheelPos.y - 10,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 0 12px rgba(0,0,0,0.2)',
                transition: 'left 0.05s, top 0.05s',
              }}
            />
          </div>
        </div>

        {/* Saturation & Brightness + Preview */}
        <div className="flex flex-1 flex-col gap-4">
          {/* Saturation / Brightness square */}
          <div
            ref={satBrightRef}
            className="relative h-[160px] w-full cursor-crosshair rounded-lg border border-slate-200/60 shadow-sm sm:h-[180px]"
            style={{
              background: `
                linear-gradient(to right, 
                  hsl(${hue}, 0%, 50%),
                  hsl(${hue}, 100%, 50%)
                )
              `,
            }}
            onMouseDown={(e) => {
              setIsDraggingSatBright(true)
              handleSatBrightInteraction(e)
            }}
            onMouseMove={(e) => {
              if (isDraggingSatBright) {
                handleSatBrightInteraction(e)
              }
            }}
          >
            {/* Overlay for brightness */}
            <div 
              className="absolute inset-0 rounded-lg"
              style={{
                background: `
                  linear-gradient(to bottom, 
                    rgba(255, 255, 255, 1) 0%,
                    rgba(255, 255, 255, 0) 50%,
                    rgba(0, 0, 0, 0) 50%,
                    rgba(0, 0, 0, 1) 100%
                  )
                `,
              }}
            />
            
            {/* Selection indicator on sat/bright square */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${saturation}%`,
                top: `${100 - lightness}%`,
                transform: 'translate(-50%, -50%)',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 0 8px rgba(0,0,0,0.15)',
              }}
            />
          </div>

          {/* Color preview and hex input */}
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 shadow-sm"
              style={{ background: currentColor }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">HEX</span>
                <input
                  type="text"
                  value={hexInput}
                  onChange={handleHexChange}
                  onBlur={handleHexBlur}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-sm text-slate-700 outline-none focus:border-slate-400"
                  placeholder="#RRGGBB"
                  spellCheck={false}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400">
                H {Math.round(hue)}° · S {Math.round(saturation)}% · L {Math.round(lightness)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}