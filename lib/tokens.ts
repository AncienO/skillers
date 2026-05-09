// inGeniusly Token System — matches official Game Banker spec
// Score = (t1 × 1) + (t2 × 2) + (t3 × 3) + (t4 × 5)
// Tier is determined by highest token type the skiller currently holds.
// All values are admin-set; scores are always computed on the fly.

export const TOKEN_DEFS = {
  t1: { name: "Bronze",  val: 1, color: "text-amber-700",  bg: "bg-amber-100",  border: "border-amber-300" },
  t2: { name: "Silver",  val: 2, color: "text-slate-500",  bg: "bg-slate-100",  border: "border-slate-300" },
  t3: { name: "Gold",    val: 3, color: "text-gold-600",   bg: "bg-gold-100",   border: "border-gold-300"  },
  t4: { name: "Diamond", val: 5, color: "text-cyan-500",   bg: "bg-cyan-100",   border: "border-cyan-300"  },
} as const

export type TokenKey = keyof typeof TOKEN_DEFS

export interface PlayerTokens {
  t1: number
  t2: number
  t3: number
  t4: number
}

// CSS filter to recolour the Ghana G mark image for each tier
export const TOKEN_FILTERS: Record<TokenKey, string> = {
  t1: "brightness(0) saturate(100%) invert(55%) sepia(60%) saturate(600%) hue-rotate(355deg) brightness(0.9)",
  t2: "brightness(0) saturate(0%) invert(75%) brightness(1.3)",
  t3: "brightness(0) saturate(100%) invert(85%) sepia(100%) saturate(900%) hue-rotate(5deg) brightness(1.05)",
  t4: "brightness(0) saturate(100%) invert(80%) sepia(60%) saturate(500%) hue-rotate(175deg) brightness(1.15)",
}

// Total score from token holdings
export function playerScore(p: PlayerTokens): number {
  return (p.t1 * TOKEN_DEFS.t1.val)
       + (p.t2 * TOKEN_DEFS.t2.val)
       + (p.t3 * TOKEN_DEFS.t3.val)
       + ((p.t4 || 0) * TOKEN_DEFS.t4.val)
}

// Tier = highest token type the skiller holds (Diamond > Gold > Silver > Bronze)
export function getTokenTier(p: PlayerTokens): TokenKey {
  if ((p.t4 || 0) > 0) return "t4"
  if ((p.t3 || 0) > 0) return "t3"
  if ((p.t2 || 0) > 0) return "t2"
  return "t1"
}

export const TOKEN_KEYS: TokenKey[] = ["t1", "t2", "t3", "t4"]

// How many tokens of each type earned per activity (admin awards these)
export const TOKEN_REWARDS = {
  POST_STORY:       { type: "t1" as TokenKey, qty: 1, reason: "Posted a story"         },
  RECEIVE_REACTION: { type: "t1" as TokenKey, qty: 1, reason: "Received a reaction"    },
} as const
