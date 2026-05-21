import { Injectable, Logger } from '@nestjs/common'
import { Resend } from 'resend'

@Injectable()
export class ResendService extends Resend {
  private readonly logger = new Logger(ResendService.name)

  constructor() {
    super(process.env.RESEND_API_KEY)
    this.logger.log('ResendService initialized')
  }
}
