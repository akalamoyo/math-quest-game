export type Level = {
  number: number;
  title: string;
  theme: string;
  prompt: string;
  answer: number;
};

const levelPrompts = [
  { title: 'Sunny Start', theme: 'Addition', prompt: '2 + 3 = ?', answer: 5 },
  { title: 'River Hop', theme: 'Subtraction', prompt: '9 - 4 = ?', answer: 5 },
  { title: 'Treasure Count', theme: 'Addition', prompt: '6 + 2 = ?', answer: 8 },
  { title: 'Space Zoom', theme: 'Multiplication', prompt: '3 × 2 = ?', answer: 6 },
  { title: 'Garden Picnic', theme: 'Subtraction', prompt: '10 - 3 = ?', answer: 7 },
  { title: 'Castle Steps', theme: 'Addition', prompt: '4 + 5 = ?', answer: 9 },
  { title: 'Star Quest', theme: 'Multiplication', prompt: '4 × 2 = ?', answer: 8 },
  { title: 'Magic Mix', theme: 'Addition', prompt: '7 + 3 = ?', answer: 10 },
  { title: 'Moon Walk', theme: 'Subtraction', prompt: '12 - 6 = ?', answer: 6 },
  { title: 'Final Crown', theme: 'Multiplication', prompt: '5 × 3 = ?', answer: 15 },
];

export const levels: Level[] = levelPrompts.map((level, index) => ({
  number: index + 1,
  ...level,
}));

export function getLevelProgressLabel(levelNumber: number) {
  if (levelNumber <= 3) return 'Warm-up';
  if (levelNumber <= 6) return 'Growing';
  if (levelNumber <= 8) return 'Brave';
  return 'Champion';
}
