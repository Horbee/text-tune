import { getStore } from '../helpers/fs-store'

vi.mock('fs', () => {
  const store = getStore()
  const module = {
    existsSync: vi.fn((p: string) => store.has(p)),
    readFileSync: vi.fn((p: string) => {
      const c = store.get(p)
      if (c === undefined) throw Object.assign(new Error(`ENOENT: ${p}`), { code: 'ENOENT' })
      return c
    }),
    writeFileSync: vi.fn((p: string, d: string | Buffer) => { store.set(p, d) }),
    unlinkSync: vi.fn((p: string) => {
      if (!store.has(p)) throw Object.assign(new Error(`ENOENT: ${p}`), { code: 'ENOENT' })
      store.delete(p)
    }),
    renameSync: vi.fn((oldPath: string, newPath: string) => {
      const c = store.get(oldPath)
      if (c === undefined) throw Object.assign(new Error(`ENOENT: ${oldPath}`), { code: 'ENOENT' })
      store.set(newPath, c)
      store.delete(oldPath)
    }),
    rmSync: vi.fn((p: string) => { store.delete(p) }),
  }
  return { ...module, default: module }
})
