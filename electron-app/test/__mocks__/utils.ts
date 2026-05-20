vi.mock('@/lib/main/utils', () => ({
  sleep: vi.fn().mockResolvedValue(undefined),
}))
