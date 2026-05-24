// Pixel-Art Charakter — SVG-basiert, 64×96px intern, skalierbar via `size` prop.
// Portiert 1:1 aus PixelCharacter.jsx

type Variant  = 'boy' | 'girl' | 'kid'
type Emotion  = 'happy' | 'sad' | 'angry' | 'scared' | 'surprised' | 'proud' | 'love' | 'bored' | 'confused' | 'excited'

interface PixelCharacterProps { variant?: Variant; emotion?: Emotion; size?: number; animated?: boolean }

const SKIN='#F4C07A', SKIN_D='#D4924A', SHOES='#4E342E', PANTS='#1565C0', WHITE='#FFFFFF', BLACK='#1A1A1A', PINK='#FFAABB'
const HAIR: Record<Variant, string> = { boy:'#5D4037', girl:'#8B4513', kid:'#F5C842' }
const SHIRT: Record<Emotion, string> = { happy:'#FBBF24', sad:'#3B82F6', angry:'#EF4444', scared:'#A78BFA', surprised:'#F97316', proud:'#10B981', bored:'#94A3B8', love:'#EC4899', confused:'#8B5CF6', excited:'#F59E0B' }

interface Pixel { x: number; y: number; w: number; h: number; fill: string }

function getFacePixels(emotion: Emotion): Pixel[] {
  const eyeL: Pixel = { x:21, y:13, w:3, h:3, fill:BLACK }
  const eyeR: Pixel = { x:29, y:13, w:3, h:3, fill:BLACK }
  switch (emotion) {
    case 'happy':    return [eyeL,eyeR,{x:22,y:19,w:2,h:2,fill:BLACK},{x:24,y:20,w:5,h:2,fill:BLACK},{x:29,y:19,w:2,h:2,fill:BLACK},{x:20,y:17,w:2,h:2,fill:PINK},{x:31,y:17,w:2,h:2,fill:PINK}]
    case 'excited':  return [{...eyeL,h:4},{...eyeR,h:4},{x:21,y:19,w:2,h:2,fill:BLACK},{x:23,y:20,w:7,h:2,fill:BLACK},{x:30,y:19,w:2,h:2,fill:BLACK},{x:21,y:17,w:2,h:2,fill:PINK},{x:30,y:17,w:2,h:2,fill:PINK}]
    case 'sad':      return [{x:21,y:12,w:3,h:2,fill:BLACK},{x:29,y:12,w:3,h:2,fill:BLACK},eyeL,eyeR,{x:22,y:18,w:2,h:2,fill:BLACK},{x:24,y:19,w:5,h:2,fill:BLACK},{x:29,y:18,w:2,h:2,fill:BLACK},{x:22,y:16,w:2,h:3,fill:'#60A5FA'}]
    case 'angry':    return [{x:19,y:11,w:5,h:2,fill:BLACK},{x:29,y:11,w:5,h:2,fill:BLACK},{x:20,y:13,w:4,h:3,fill:BLACK},{x:29,y:13,w:4,h:3,fill:BLACK},{x:22,y:19,w:9,h:2,fill:BLACK},{x:19,y:17,w:3,h:2,fill:'#FCA5A5'},{x:31,y:17,w:3,h:2,fill:'#FCA5A5'}]
    case 'scared':   return [{x:20,y:12,w:5,h:5,fill:BLACK},{x:28,y:12,w:5,h:5,fill:BLACK},{x:21,y:13,w:3,h:3,fill:WHITE},{x:29,y:13,w:3,h:3,fill:WHITE},{x:22,y:12,w:2,h:2,fill:BLACK},{x:30,y:12,w:2,h:2,fill:BLACK},{x:22,y:19,w:9,h:3,fill:BLACK}]
    case 'surprised':return [{x:20,y:11,w:5,h:5,fill:BLACK},{x:28,y:11,w:5,h:5,fill:BLACK},{x:21,y:12,w:3,h:3,fill:WHITE},{x:29,y:12,w:3,h:3,fill:WHITE},{x:22,y:12,w:2,h:2,fill:BLACK},{x:30,y:12,w:2,h:2,fill:BLACK},{x:23,y:18,w:7,h:5,fill:BLACK},{x:24,y:19,w:5,h:3,fill:WHITE}]
    case 'proud':    return [eyeL,eyeR,{x:21,y:19,w:2,h:2,fill:BLACK},{x:23,y:20,w:7,h:2,fill:BLACK},{x:30,y:19,w:2,h:2,fill:BLACK},{x:20,y:11,w:3,h:2,fill:BLACK},{x:30,y:11,w:3,h:2,fill:BLACK}]
    case 'bored':    return [{x:21,y:13,w:4,h:2,fill:BLACK},{x:28,y:13,w:4,h:2,fill:BLACK},{x:23,y:19,w:7,h:2,fill:BLACK}]
    case 'love':     return [{x:20,y:11,w:5,h:5,fill:'#EF4444'},{x:28,y:11,w:5,h:5,fill:'#EF4444'},{x:19,y:14,w:7,h:3,fill:'#EF4444'},{x:27,y:14,w:7,h:3,fill:'#EF4444'},eyeL,eyeR,{x:22,y:19,w:2,h:2,fill:BLACK},{x:24,y:20,w:5,h:2,fill:BLACK},{x:29,y:19,w:2,h:2,fill:BLACK}]
    case 'confused': return [{x:19,y:11,w:5,h:2,fill:BLACK},{x:29,y:11,w:3,h:2,fill:BLACK},eyeL,eyeR,{x:22,y:19,w:5,h:2,fill:BLACK},{x:27,y:18,w:3,h:2,fill:BLACK},{x:30,y:17,w:2,h:2,fill:BLACK}]
    default:         return [eyeL, eyeR]
  }
}

export default function PixelCharacter({ variant = 'kid', emotion = 'happy', size = 96, animated = true }: PixelCharacterProps) {
  const scale = size / 96
  const face  = getFacePixels(emotion)
  const shirt = SHIRT[emotion]
  const hair  = HAIR[variant]
  const anim  = animated ? (emotion === 'angry' ? 'animate-pulse' : emotion === 'scared' ? 'animate-bounce' : 'animate-none') : ''

  return (
    <svg width={64 * scale} height={96 * scale} viewBox="0 0 64 96" className={anim} style={{ imageRendering:'pixelated' }}>
      {/* Haare */}
      <rect x="14" y="2" width="36" height="10" fill={hair} rx="2"/>
      {/* Kopf */}
      <rect x="16" y="8" width="32" height="22" fill={SKIN} rx="2"/>
      <rect x="16" y="8" width="32" height="4" fill={SKIN_D}/>
      {/* Gesicht */}
      {face.map((p,i) => <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.fill}/>)}
      {/* Körper */}
      <rect x="18" y="30" width="28" height="24" fill={shirt} rx="1"/>
      {/* Arme */}
      <rect x="8"  y="30" width="10" height="18" fill={shirt} rx="2"/>
      <rect x="46" y="30" width="10" height="18" fill={shirt} rx="2"/>
      <rect x="8"  y="44" width="10" height="8"  fill={SKIN} rx="1"/>
      <rect x="46" y="44" width="10" height="8"  fill={SKIN} rx="1"/>
      {/* Beine */}
      <rect x="18" y="54" width="12" height="28" fill={PANTS} rx="1"/>
      <rect x="34" y="54" width="12" height="28" fill={PANTS} rx="1"/>
      {/* Schuhe */}
      <rect x="16" y="80" width="14" height="8" fill={SHOES} rx="2"/>
      <rect x="34" y="80" width="14" height="8" fill={SHOES} rx="2"/>
    </svg>
  )
}
