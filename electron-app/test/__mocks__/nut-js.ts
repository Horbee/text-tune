export const keyboard = {
  pressKey: vi.fn().mockResolvedValue(undefined),
  releaseKey: vi.fn().mockResolvedValue(undefined),
}

export const Key = {
  LeftCmd: 'LeftCmd',
  LeftControl: 'LeftControl',
  LeftShift: 'LeftShift',
  C: 'C',
  V: 'V',
  Home: 'Home',
  Left: 'Left',
}

vi.mock('@nut-tree-fork/nut-js', () => ({
  keyboard,
  Key,
}))
