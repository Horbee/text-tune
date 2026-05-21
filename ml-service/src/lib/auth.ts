import { Logger } from '@nestjs/common'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { magicLink } from 'better-auth/plugins'
import { PrismaService } from '@/lib/prisma.service'
import { ResendService } from '@/lib/resend.service'

export const createBetterAuthInstance = (prismaService: PrismaService, resendService: ResendService) => {
  const logger = new Logger('Auth')

  return betterAuth({
    database: prismaAdapter(prismaService, {
      provider: 'sqlite',
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          const { data, error } = await resendService.emails.send({
            from: 'Text Tune AI <text-tune@horbee.live>',
            to: [email],
            subject: 'Login to Text Tune AI',
            html: `<p>Click the link below to sign in:</p><p><a href="${url}">${url}</a></p>`,
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
