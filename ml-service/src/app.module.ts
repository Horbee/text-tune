import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { LlmService } from '@/llm/llm.service'
import { PrismaService } from '@/db/prisma.service'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [LlmService, PrismaService],
})
export class AppModule {}
