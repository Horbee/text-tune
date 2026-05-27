import { Body, Controller, Get, Logger, Post, Res } from '@nestjs/common'
import { LlmService } from '@/llm/llm.service'
import { type GecInputDto, gecInputSchema } from '@/dto/gec-input.dto'
import { GecResponseDto } from '@/dto/gec-response.dto'
import { ZodValidationPipe } from './pipes/zod-validation'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'
import { join } from 'path'
import type { Response } from 'express'

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)
  private readonly publicDir = join(__dirname, '..', '..', 'public')

  constructor(private readonly llmService: LlmService) {}

  @Get()
  @AllowAnonymous()
  getHealth(): { message: string } {
    return { message: 'ML Service is running' }
  }

  @Get('sign-in')
  @AllowAnonymous()
  getSignIn(@Res() res: Response): void {
    res.sendFile(join(this.publicDir, 'sign-in.html'))
  }

  @Post('api/generate-correction')
  async postGenerateCorrection(
    @Body(new ZodValidationPipe(gecInputSchema)) gecInputDto: GecInputDto
  ): Promise<GecResponseDto> {
    this.logger.log(`Received GEC request with input: "${gecInputDto.text}" and model: "${gecInputDto.model}"`)
    const correctedText = await this.llmService.generateCorrection(gecInputDto.text, gecInputDto.model)
    return { corrected: correctedText.trim(), original: gecInputDto.text }
  }
}
