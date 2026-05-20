const store = new Map<string, string | Buffer>()

export function resetFs(): void {
  store.clear()
}

export function setFs(path: string, data: string | Buffer): void {
  store.set(path, data)
}

export function getFs(path: string): string | Buffer | undefined {
  return store.get(path)
}

export function getStore() {
  return store
}
