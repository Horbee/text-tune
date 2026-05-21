import { z } from 'zod'
import { ModelName } from '@/llm/llm.service'

export const gecInputSchema = z.object({
  text: z.string(),
  model: z.enum(ModelName).optional().default(ModelName.TextTuneBase),
})

export type GecInputDto = z.infer<typeof gecInputSchema>
