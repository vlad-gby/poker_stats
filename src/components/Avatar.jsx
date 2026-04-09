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

const PLACEHOLDER = 'photos/placeholder.jpg'

export default function Avatar({ name, photo, size = 'md', className = '' }) {
  // 'photo' → 'placeholder' → 'initials'
  const [stage, setStage] = useState(photo ? 'photo' : 'placeholder')

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  }

  const base = `rounded-full shrink-0 overflow-hidden ring-2 ring-warm-700 ${sizes[size]} ${className}`

  if (stage === 'initials') {
    return (
      <div className={`${base} flex items-center justify-center font-bold ${colorFor(name)} text-white`}>
        {initials(name)}
      </div>
    )
  }

  const src = stage === 'photo'
    ? `${import.meta.env.BASE_URL}${photo}`
    : `${import.meta.env.BASE_URL}${PLACEHOLDER}`

  return (
    <div className={base}>
      <img
        src={src}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setStage(stage === 'photo' ? 'placeholder' : 'initials')}
      />
    </div>
  )
}
