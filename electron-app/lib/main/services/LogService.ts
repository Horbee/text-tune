export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export class LogService {
  constructor(private prefix = 'TextTune') {}

  private fmt(level: LogLevel, msg: string) {
    const ts = new Date().toISOString()
    return `[${ts}] [${this.prefix}] [${level.toUpperCase()}] ${msg}`
  }

  debug(msg: string) {
    console.debug(this.fmt('debug', msg))
  }
  info(msg: string) {
    console.info(this.fmt('info', msg))
  }
  warn(msg: string) {
    console.warn(this.fmt('warn', msg))
  }
  error(msg: string, err?: unknown) {
    console.error(this.fmt('error', msg), err)
  }
}
