export function generateAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

export function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 15);
}
