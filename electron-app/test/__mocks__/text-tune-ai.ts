vi.mock('@/lib/main/providers/tt-ai/LocalInferenceEngine', () => ({
  LocalInferenceEngine: vi.fn(function (this: any) {
    this.isReady = vi.fn()
    this.ensureReady = vi.fn().mockResolvedValue(undefined)
    this.fix = vi.fn().mockResolvedValue('local fix')
  }),
}))
vi.mock('@/lib/main/providers/tt-ai/RemoteInferenceClient', () => ({
  RemoteInferenceClient: vi.fn(function (this: any) {
    this.fix = vi.fn().mockResolvedValue('remote fix')
  }),
}))
