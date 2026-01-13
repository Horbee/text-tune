import { Test, TestingModule } from '@nestjs/testing'
import { LlmService } from './llm.service'
import { Ollama } from 'ollama'
import { PrismaService } from '../db/prisma.service'

jest.mock('ollama')

describe('LlmService', () => {
  let service: LlmService
  let mockOllama: jest.Mocked<Ollama>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlmService, PrismaService],
    }).compile()

    service = module.get<LlmService>(LlmService)
    mockOllama = (service as any).ollama
  })

  describe('generateCorrection', () => {
    it('should generate correction using Ollama', async () => {
      const mockPrompt = 'This is a test sentense.'
      const mockResponse = {
        response: 'This is a test sentence.',
        model: 'text-tune-ai',
        done: true,
      }

      mockOllama.generate = jest.fn().mockResolvedValue(mockResponse)

      const result = await service.generateCorrection(mockPrompt)

      expect(mockOllama.generate).toHaveBeenCalledWith({
        model: 'text-tune-ai',
        prompt: mockPrompt,
        stream: false,
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
