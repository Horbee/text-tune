import { Global, Module } from '@nestjs/common'
import { ResendService } from '@/lib/resend.service'

@Global()
@Module({
  providers: [ResendService],
  exports: [ResendService],
})
export class ResendModule {}
