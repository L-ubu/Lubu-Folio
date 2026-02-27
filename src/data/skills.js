export const skillNodes = [
  // Frontend
  { id: 'react', label: 'React', category: 'frontend', level: 5 },
  { id: 'javascript', label: 'JavaScript', category: 'frontend', level: 5 },
  { id: 'typescript', label: 'TypeScript', category: 'frontend', level: 3 },
  { id: 'css', label: 'CSS', category: 'frontend', level: 5 },
  { id: 'tailwind', label: 'Tailwind', category: 'frontend', level: 4 },
  { id: 'threejs', label: 'Three.js', category: 'frontend', level: 3 },
  { id: 'gsap', label: 'GSAP', category: 'frontend', level: 3 },
  { id: 'nextjs', label: 'Next.js', category: 'frontend', level: 4 },
  { id: 'astro', label: 'Astro', category: 'frontend', level: 3 },
  { id: 'storybook', label: 'Storybook', category: 'frontend', level: 4 },
  { id: 'html', label: 'HTML', category: 'frontend', level: 5 },

  // Backend
  { id: 'nodejs', label: 'Node.js', category: 'backend', level: 3 },
  { id: 'php', label: 'PHP', category: 'backend', level: 3 },
  { id: 'drupal', label: 'Drupal', category: 'backend', level: 3 },
  { id: 'python', label: 'Python', category: 'backend', level: 3 },
  { id: 'sql', label: 'SQL', category: 'backend', level: 3 },

  // Tools
  { id: 'git', label: 'Git', category: 'tools', level: 5 },
  { id: 'docker', label: 'Docker', category: 'tools', level: 3 },
  { id: 'ddev', label: 'DDEV', category: 'tools', level: 4 },
  { id: 'figma', label: 'Figma', category: 'tools', level: 4 },
  { id: 'vscode', label: 'VS Code / Cursor', category: 'tools', level: 5 },
  { id: 'zsh', label: 'Zsh / Shell', category: 'tools', level: 5 },
  { id: 'npm', label: 'npm / pnpm', category: 'tools', level: 4 },

  // Creative
  { id: 'animation', label: 'Animation', category: 'creative', level: 4 },
  { id: 'ux', label: 'UX Design', category: 'creative', level: 3 },
  { id: 'ascii', label: 'ASCII Art', category: 'creative', level: 5 },
  { id: 'worldbuilding', label: 'Worldbuilding', category: 'creative', level: 4 },

  // Security
  { id: 'pentesting', label: 'Pentesting', category: 'security', level: 3 },
  { id: 'ctf', label: 'CTF', category: 'security', level: 3 },
  { id: 'networking', label: 'Networking', category: 'security', level: 3 },

  // Hardware
  { id: 'microcontrollers', label: 'Microcontrollers', category: 'hardware', level: 2 },
  { id: 'flipper', label: 'Flipper Zero', category: 'hardware', level: 3 },
  { id: 'electronics', label: 'Electronics', category: 'hardware', level: 2 },
];

export const skillEdges = [
  ['react', 'javascript'], ['react', 'typescript'], ['react', 'nextjs'], ['react', 'astro'],
  ['react', 'storybook'], ['react', 'css'], ['react', 'threejs'], ['react', 'gsap'],
  ['javascript', 'nodejs'], ['javascript', 'typescript'], ['javascript', 'html'],
  ['css', 'tailwind'], ['css', 'animation'], ['css', 'html'],
  ['threejs', 'gsap'], ['threejs', 'animation'],
  ['nodejs', 'npm'], ['nodejs', 'docker'],
  ['php', 'drupal'], ['php', 'sql'],
  ['python', 'pentesting'], ['python', 'ctf'],
  ['docker', 'ddev'], ['git', 'zsh'], ['zsh', 'npm'],
  ['figma', 'ux'], ['figma', 'css'],
  ['animation', 'ux'], ['animation', 'worldbuilding'], ['animation', 'ascii'],
  ['pentesting', 'ctf'], ['pentesting', 'networking'], ['pentesting', 'flipper'],
  ['microcontrollers', 'electronics'], ['microcontrollers', 'flipper'],
];

export const categoryColors = {
  frontend: '#3b82f6',
  backend: '#22c55e',
  tools: '#f59e0b',
  creative: '#a855f7',
  security: '#f43f5e',
  hardware: '#06b6d4',
};
