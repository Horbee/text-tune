import { clipboard } from 'electron'
import { keyboard, Key } from '@nut-tree-fork/nut-js'
import { sleep } from '@/lib/main/utils'

export class ClipboardService {
  private isMac = process.platform === 'darwin'
  private cmdKey = this.isMac ? Key.LeftCmd : Key.LeftControl

  async captureSelection(): Promise<string> {
    await keyboard.pressKey(this.cmdKey, Key.C)
    await keyboard.releaseKey(this.cmdKey, Key.C)
    await sleep(100)
    return clipboard.readText()
  }

  async replaceSelection(text: string) {
    clipboard.writeText(text)
    await sleep(100)
    await keyboard.pressKey(this.cmdKey, Key.V)
    await keyboard.releaseKey(this.cmdKey, Key.V)
  }

  async selectCurrentLine() {
    if (this.isMac) {
      await keyboard.pressKey(Key.LeftCmd, Key.LeftShift, Key.Left)
      await keyboard.releaseKey(Key.LeftCmd, Key.LeftShift, Key.Left)
    } else {
      await keyboard.pressKey(Key.LeftShift, Key.Home)
      await keyboard.releaseKey(Key.LeftShift, Key.Home)
    }
  }
}
