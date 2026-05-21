import { PrismaService } from '@/lib/prisma.service'
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class LastActiveInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LastActiveInterceptor.name)

  constructor(private readonly prisma: PrismaService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest()
    const session = req.session // attached by Better Auth middleware/guard
    if (session?.user?.id) {
      this.prisma.user
        .update({
          where: { id: session.user.id },
          data: { lastActiveAt: new Date() },
        })
        .catch((err) => this.logger.error(`Failed to update lastActiveAt: ${err.message}`))
    }
    return next.handle()
  }
}
