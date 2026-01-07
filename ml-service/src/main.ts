import { NestFactory } from '@nestjs/core'
import { AppModule } from '@/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose', 'debug', 'log', 'warn', 'error', 'fatal'],
  })
  app.enableCors()
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
