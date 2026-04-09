import { useState } from 'react'

const COLORS = [
  'bg-amber-700', 'bg-orange-700', 'bg-rose-700', 'bg-teal-700',
  'bg-violet-700', 'bg-lime-700', 'bg-sky-700', 'bg-pink-700', 'bg-emerald-700',
]

function colorFor(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}

function initials(name) {
  return name.slice(0, 2).toUpperCase()
}

export default function Avatar({ name, photo, size = 'md', className = '' }) {
  const [imgError, setImgError] = useState(false)

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  }

  const base = `rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden ring-2 ring-warm-700 ${sizes[size]} ${className}`

  const PLACEHOLDER = `${import.meta.env.BASE_URL}photos/placeholder.jpg`

  // Use player photo → placeholder → initials fallback
  const src = photo && !imgError
    ? `${import.meta.env.BASE_URL}${photo}`
    : PLACEHOLDER

  return (
    <div className={base}>
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover"
        onError={e => {
          // If placeholder also fails, swap to initials div
          e.target.style.display = 'none'
          e.target.parentElement.classList.add(colorFor(name), 'text-white')
          e.target.parentElement.textContent = initials(name)
        }}
      />
    </div>
  )
}
