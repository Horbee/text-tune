import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { LlmService } from '@/llm/llm.service'
import { PrismaService } from '@/lib/prisma.service'
import { PrismaModule } from '@/lib/prisma.module'
import { ResendModule } from '@/lib/resend.module'
import { ResendService } from '@/lib/resend.service'
import { createBetterAuthInstance } from '@/lib/auth'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from '@thallesp/nestjs-better-auth'
import { LastActiveInterceptor } from './interceptors/last-active.interceptor'
import { APP_INTERCEPTOR } from '@nestjs/core'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ResendModule,
    AuthModule.forRootAsync({
      inject: [PrismaService, ResendService],
      useFactory: (prismaService: PrismaService, resendService: ResendService) => {
        return {
          auth: createBetterAuthInstance(prismaService, resendService),
        }
      },
    }),
  ],
  controllers: [AppController],
  providers: [LlmService, { provide: APP_INTERCEPTOR, useClass: LastActiveInterceptor }],
})
export class AppModule {}
