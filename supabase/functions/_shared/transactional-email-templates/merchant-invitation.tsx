/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "TickTock Slots"
const SITE_URL = "https://ticktockslots.lovable.app"
const REGISTER_URL = `${SITE_URL}/merchant/register`

interface MerchantInvitationProps {
  businessName?: string
  vertical?: string
}

const MerchantInvitationEmail = ({ businessName, vertical }: MerchantInvitationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're invited to join {SITE_NAME} — fill your empty slots</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logoText}>⏰ {SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>
          {businessName ? `${businessName}, you're invited!` : "You're invited!"}
        </Heading>

        <Text style={text}>
          We'd love to have{' '}
          {businessName ? <strong>{businessName}</strong> : 'your business'} on{' '}
          <strong>{SITE_NAME}</strong> — the UK's marketplace for last-minute
          cancelled bookings.
        </Text>

        <Text style={text}>
          List your{' '}
          {vertical ? vertical.toLowerCase() : 'cancelled'}{' '}
          slots in seconds, keep <strong>70% of every sale</strong>, and turn
          empty appointments into revenue.
        </Text>

        <Section style={ctaSection}>
          <Button style={ctaButton} href={REGISTER_URL}>
            Accept Invitation
          </Button>
        </Section>

        <Text style={footer}>
          Questions? Simply reply to this email — we're happy to help.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: MerchantInvitationEmail,
  subject: (data: Record<string, any>) =>
    data.businessName
      ? `${data.businessName}, you're invited to TickTock Slots`
      : "You're invited to join TickTock Slots",
  displayName: 'Merchant invitation',
  previewData: { businessName: 'The Grand Hotel', vertical: 'Dining' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '24px 28px', maxWidth: '500px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '20px' }
const logoText = { fontSize: '22px', fontWeight: '700', color: '#3B82F6', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 16px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#4B5563', lineHeight: '1.7', margin: '0 0 16px' }
const ctaSection = { textAlign: 'center' as const, margin: '28px 0' }
const ctaButton = {
  backgroundColor: '#3B82F6', color: '#ffffff', borderRadius: '12px',
  padding: '14px 40px', fontSize: '16px', fontWeight: '600', textDecoration: 'none',
}
const footer = { fontSize: '13px', color: '#9CA3AF', margin: '24px 0 0', textAlign: 'center' as const }
