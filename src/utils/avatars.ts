export function generateAvatarUrl(seed: string): string {
  const seedNumber = parseInt(seed.replace(/\D/g, '') || '0', 10);
  const avatarIndex = seedNumber % 70;
  return `https://i.pravatar.cc/150?img=${avatarIndex}&u=${seed}`;
}

export function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 15);
}
