const fileStore = new Map<string, string | Buffer>()

export function resetFileSystem(): void {
  fileStore.clear()
}

export function setFile(filePath: string, contents: string | Buffer): void {
  fileStore.set(filePath, contents)
}

export function getFile(filePath: string): string | Buffer | undefined {
  return fileStore.get(filePath)
}

const fileStoreRef = fileStore

export { fileStoreRef as _fileStore }
