export interface TokenTier {
  label: string
  color: string       // Tailwind text color
  filter: string      // CSS filter to recolor the Ghana G mark
  min: number
  max: number | null
}

export const TOKEN_TIERS: TokenTier[] = [
  {
    label: "Bronze",
    color: "text-amber-700",
    // Warm brownish-bronze
    filter: "brightness(0) saturate(100%) invert(55%) sepia(60%) saturate(600%) hue-rotate(355deg) brightness(0.9)",
    min: 0,
    max: 99,
  },
  {
    label: "Silver",
    color: "text-slate-500",
    // Cool silver/grey
    filter: "brightness(0) saturate(0%) invert(75%) brightness(1.3)",
    min: 100,
    max: 499,
  },
  {
    label: "Gold",
    color: "text-gold-600",
    // Full brand gold (#FFC500)
    filter: "brightness(0) saturate(100%) invert(85%) sepia(100%) saturate(900%) hue-rotate(5deg) brightness(1.05)",
    min: 500,
    max: 999,
  },
  {
    label: "Diamond",
    color: "text-cyan-500",
    // Iridescent cyan-diamond
    filter: "brightness(0) saturate(100%) invert(80%) sepia(60%) saturate(500%) hue-rotate(175deg) brightness(1.15)",
    min: 1000,
    max: null,
  },
]

export function getTokenTier(tokens: number): TokenTier {
  return (
    TOKEN_TIERS.slice().reverse().find((t) => tokens >= t.min) ?? TOKEN_TIERS[0]
  )
}

// Points awarded for various activities
export const TOKEN_REWARDS = {
  ACCOUNT_APPROVED:   5,
  COMPLETE_PROFILE:  10,
  POST_STORY:         5,
  RECEIVE_REACTION:   2,
  GENIUS_CIRCLE:     20,
} as const
