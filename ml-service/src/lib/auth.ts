import { Logger } from '@nestjs/common'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { magicLink } from 'better-auth/plugins'
import { PrismaService } from '@/lib/prisma.service'
import { ResendService } from '@/lib/resend.service'
import { electron } from '@better-auth/electron'

export const createBetterAuthInstance = (prismaService: PrismaService, resendService: ResendService) => {
  const logger = new Logger('Auth')

  return betterAuth({
    database: prismaAdapter(prismaService, {
      provider: 'sqlite',
    }),
    trustedOrigins: ['texttune:/'],
    plugins: [
      electron(),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          const { data, error } = await resendService.emails.send({
            from: 'Text Tune AI <text-tune@horbee.live>',
            to: [email],
            subject: 'Login to Text Tune AI',
            template: {
              id: '490b168b-c5b3-454b-8d5d-814ab3470652',
              variables: {
                magic_link_url: url,
              },
            },
          })

          if (error) {
            logger.error(`Failed to send magic link to ${email}`, error)
            return
          }

          logger.log(`Magic link sent to ${email}: ${data?.id}`)
        },
      }),
    ],
  })
}
