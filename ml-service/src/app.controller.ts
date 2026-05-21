import { Body, Controller, Get, Logger, Post } from '@nestjs/common'
import { LlmService } from '@/llm/llm.service'
import { type GecInputDto, gecInputSchema } from '@/dto/gec-input.dto'
import { GecResponseDto } from '@/dto/gec-response.dto'
import { ZodValidationPipe } from './pipes/zod-validation'
import { AllowAnonymous } from '@thallesp/nestjs-better-auth'

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)

  constructor(private readonly llmService: LlmService) {}

  @Get()
  @AllowAnonymous()
  getHealth(): { message: string } {
    return { message: 'ML Service is running' }
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
