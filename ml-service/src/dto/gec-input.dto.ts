import { ModelName } from '@/llm/llm.service'

export class GecInputDto {
  text: string
  model: ModelName
}
