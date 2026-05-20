vi.mock('deepl-node', () => ({
  Translator: vi.fn(function (this: any, _key: string) {
    this.translateText = vi.fn().mockResolvedValue({ text: 'translated text' })
  }),
}))
