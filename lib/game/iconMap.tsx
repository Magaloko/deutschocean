// AUTO-PORTIERT — iconMap.tsx
// Zentrale Abbildung: Emoji → lucide-react Icon-Komponente
// Emojis, die NICHT hier stehen, werden als Emoji gerendert (Spiel-Content wie
// 🍎🐶🚗 in Frucht-Zähler, Memory, Fahrzeug-Lenker bleiben absichtlich Emoji).

import {
  // Stats / Gamification
  Zap, Star, Sparkles, Flame, Medal, Trophy, Crown, Award, Waves,
  // Mission-Icons (Deutsch)
  Search, Eye, Headphones, Puzzle, Type, Bug, TreePine, Target,
  Construction, Palette, PawPrint, Car, Apple, Smile, Drama,
  BookOpen, Library, Pencil, Grid3x3,
  // Mathe
  Hash, Scale, Dices, Rocket, Link, ShoppingCart, X, Plus,
  // Fächer
  Bot, Code2, Briefcase, Flower2, Lightbulb, ClipboardList, Wind,
  // Level-Meta / Alter
  Baby, GraduationCap, Hand,
  // UI-Chrome
  Lock, LockOpen, Play, Hourglass, BarChart3, MessageCircle,
  AlertTriangle, Gamepad2, PartyPopper, Repeat, FileText, Sunrise,
  Bell, Timer, Clock, Gift, Calendar, Settings, Check, CheckCircle2,
  XCircle, Map, Globe, Mic, Music, Volume2, Home, User, LogOut,
  Menu, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Trash2,
  Edit3, Save, Upload, Download, Share2, Filter, MoreHorizontal,
  Plus as PlusIcon, Minus, HelpCircle, Info, Mail, ExternalLink,
} from 'lucide-react'

export const EMOJI_ICON_MAP = {
  // ── Stats / Gamification ───────────────────────────────
  '⚡':  Zap,
  '⭐':  Star,
  '🌟': Sparkles,
  '🔥': Flame,
  '🏅': Medal,
  '🏆': Trophy,
  '👑': Crown,
  '🎖️': Award,
  '🌊': Waves,

  // ── Mission-Icons (Deutsch) ────────────────────────────
  '🔍': Search,
  '👁️': Eye,
  '🎧': Headphones,
  '🧩': Puzzle,
  '🔤': Type,
  '🐛': Bug,
  '🌳': TreePine,
  '🏹': Target,
  '🏗️': Construction,
  '🏗':  Construction,
  '🎨': Palette,
  '🐾': PawPrint,
  '🦁': PawPrint,
  '🚗': Car,
  '🍎': Apple,
  '🎯': Target,
  '😊': Smile,
  '🎭': Drama,
  '📖': BookOpen,
  '📚': Library,
  '✏️': Pencil,
  '🃏': Grid3x3,

  // ── Mathe ──────────────────────────────────────────────
  '🔢': Hash,
  '⚖️': Scale,
  '🎲': Dices,
  '🚀': Rocket,
  '🔗': Link,
  '🛒': ShoppingCart,
  '✖️': X,
  '➕': Plus,

  // ── Fächer (Roboter/Coden/MiniBoss/Cool) ───────────────
  '🤖': Bot,
  '💻': Code2,
  '💼': Briefcase,
  '🧘': Flower2,
  '💡': Lightbulb,
  '📋': ClipboardList,
  '💨': Wind,

  // ── Level-Meta / Alter ─────────────────────────────────
  '🧒': Baby,
  '🎓': GraduationCap,
  '👋': Hand,

  // ── UI-Chrome ──────────────────────────────────────────
  '🔒': Lock,
  '🔓': LockOpen,
  '▶':  Play,
  '⏳': Hourglass,
  '📊': BarChart3,
  '💬': MessageCircle,
  '⚠️': AlertTriangle,
  '🎮': Gamepad2,
  '🎉': PartyPopper,
  '🔁': Repeat,
  '📝': FileText,
  '🌅': Sunrise,
  '🔔': Bell,
  '⏱':  Timer,
  '🕐': Clock,
  '🎁': Gift,
  '📅': Calendar,
  '⚙️': Settings,
  '✓':  Check,
  '✅': CheckCircle2,
  '❌': XCircle,
  '🗺️': Map,
  '🌍': Globe,
  '🎤': Mic,
  '🎵': Music,
  '🔊': Volume2,
  '🏠': Home,
  '👤': User,
  '🚪': LogOut,
  '☰':  Menu,
  '◀':  ChevronLeft,
  '▶︎': ChevronRight,
  '→':  ArrowRight,
  '←':  ArrowLeft,
  '🗑️': Trash2,
  '✎':  Edit3,
  '💾': Save,
  '⬆':  Upload,
  '⬇':  Download,
  '📤': Share2,
  '⋯':  MoreHorizontal,
  '➖': Minus,
  '❓': HelpCircle,
  'ℹ️': Info,
  '✉️': Mail,
  '🔗→': ExternalLink,
}

// Optional: Stroke-Farb-Presets für häufige Emoji-Rollen.
// Benutzt Icon so: <Icon emoji="🔥" /> — Farbe kommt automatisch.
export const EMOJI_COLOR_HINT = {
  '⚡':  '#eab308',
  '⭐':  '#f59e0b',
  '🌟': '#f59e0b',
  '🔥': '#ef4444',
  '🏅': '#f59e0b',
  '🏆': '#ca8a04',
  '👑': '#ca8a04',
  '🔒': '#6b7280',
  '⚠️': '#ef4444',
  '✓':  '#10b981',
  '✅': '#10b981',
  '❌': '#ef4444',
  '🎉': '#ec4899',
}
