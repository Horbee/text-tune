vi.mock('openai', () => ({
  default: vi.fn(function (this: any) {
    this.responses = { parse: vi.fn() }
  }),
}))
