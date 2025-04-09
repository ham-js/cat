export const Bands = ["10km", "160m", "80m", "40m", "30m", "20m", "17m", "15m", "13m", "10m", "6m", "General"] as const
export type Band = typeof Bands[number]
