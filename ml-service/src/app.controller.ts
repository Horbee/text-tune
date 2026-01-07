import { Body, Controller, Get, Logger, Post } from '@nestjs/common'
import { LlmService } from '@/llm/llm.service'
import { GecInputDto } from '@/dto/gec-input.dto'
import { GecResponseDto } from '@/dto/gec-response.dto'

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name)

  constructor(private readonly llmService: LlmService) {}

  @Get()
  getHealth(): { message: string } {
    return { message: 'ML Service is running' }
  }

  @Post('api/gec')
  async postGec(@Body() gecInputDto: GecInputDto): Promise<GecResponseDto> {
    this.logger.log(`Received GEC request with input: ${gecInputDto.text}`)
    const { response } = await this.llmService.generateCorrection(gecInputDto.text)
    return { corrected: response.trim(), original: gecInputDto.text }
  }
}
