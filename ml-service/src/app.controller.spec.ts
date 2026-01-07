import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { LlmService } from './llm/llm.service'

describe('AppController', () => {
  let appController: AppController
  let llmService: LlmService

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: LlmService,
          useValue: {
            generateText: jest.fn(),
          },
        },
      ],
    }).compile()

    appController = app.get<AppController>(AppController)
    llmService = app.get<LlmService>(LlmService)
  })

  describe('root', () => {
    it('should return status message', () => {
      expect(appController.getHealth()).toEqual({
        message: 'ML Service is running',
      })
    })
  })

  describe('postGec', () => {
    it('should return corrected sentence', async () => {
      const inputDto = { text: 'This is a test sentense with a typo.' }
      const mockResponse = {
        response: 'This is a test sentence with a typo.',
      }

      jest.spyOn(llmService, 'generateCorrection').mockResolvedValue(mockResponse as any)

      const result = await appController.postGec(inputDto)

      expect(llmService.generateCorrection).toHaveBeenCalledWith(inputDto.text)
      expect(result).toEqual({
        corrected_sentence: mockResponse.response,
      })
    })
  })
})
