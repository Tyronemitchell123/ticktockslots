/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "TickTock Slots"
const SITE_URL = "https://ticktockslots.lovable.app"
const REGISTER_URL = `${SITE_URL}/merchant/register`

interface MerchantOutreachProps {
  businessName?: string
  vertical?: string
  region?: string
}

const MerchantOutreachEmail = ({ businessName, vertical, region }: MerchantOutreachProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Turn your cancelled bookings into revenue with {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logoText}>⚡ {SITE_NAME}</Text>
          <Text style={tagline}>For Businesses</Text>
        </Section>

        <Heading style={h1}>
          {businessName ? `Hi ${businessName},` : 'Hello,'}
        </Heading>

        <Text style={text}>
          We noticed you operate in the{' '}
          {vertical ? <strong>{vertical.toLowerCase()}</strong> : 'hospitality'}{' '}
          space{region ? ` in ${region}` : ''} — and we think {SITE_NAME} could
          be a perfect fit for your business.
        </Text>

        <Text style={text}>
          <strong>{SITE_NAME}</strong> is a marketplace that helps businesses
          like yours recover revenue from last-minute cancellations. Instead of
          leaving empty tables, treatment rooms, or event slots unfilled, you
          can list them on our platform and let eager customers snap them up at
          a discount.
        </Text>

        <Section style={benefitsCard}>
          <Text style={benefitHeading}>Why merchants love {SITE_NAME}</Text>
          <Text style={benefitItem}>💰 <strong>Recover lost revenue</strong> — fill cancelled slots that would otherwise go empty</Text>
          <Text style={benefitItem}>📱 <strong>Easy listing</strong> — post a slot in under 60 seconds from your dashboard</Text>
          <Text style={benefitItem}>🚀 <strong>Instant exposure</strong> — reach thousands of deal-hungry customers</Text>
          <Text style={benefitItem}>🔒 <strong>Risk-free</strong> — you only pay a small commission when a slot is claimed</Text>
          <Text style={benefitItem}>⭐ <strong>Build loyalty</strong> — turn one-time deal-seekers into repeat customers</Text>
        </Section>

        <Section style={statsRow}>
          <Text style={statItem}><strong>50%</strong><br />avg. fill rate for listed slots</Text>
          <Text style={statItem}><strong>30s</strong><br />avg. time to list a slot</Text>
          <Text style={statItem}><strong>70%</strong><br />revenue kept by merchants</Text>
        </Section>

        <Section style={ctaSection}>
          <Button style={ctaButton} href={REGISTER_URL}>
            Register as a Merchant — Free
          </Button>
        </Section>

        <Hr style={divider} />

        <Text style={footerText}>
          Have questions? Simply reply to this email and we'll be happy to help.
        </Text>
        <Text style={footerText}>
          Best regards,<br />The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: MerchantOutreachEmail,
  subject: (data: Record<string, any>) =>
    data.businessName
      ? `${data.businessName}, turn your cancellations into revenue`
      : 'Turn your cancelled bookings into revenue',
  displayName: 'Merchant outreach',
  previewData: { businessName: 'The Grand Hotel', vertical: 'Dining', region: 'London' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '540px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logoText = { fontSize: '22px', fontWeight: '700', color: '#3B82F6', margin: '0' }
const tagline = { fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0', textTransform: 'uppercase' as const, letterSpacing: '1px' }
const h1 = { fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#6B7280', lineHeight: '1.7', margin: '0 0 16px' }
const benefitsCard = {
  backgroundColor: '#F0F9FF', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px',
  border: '1px solid #DBEAFE',
}
const benefitHeading = { fontSize: '15px', fontWeight: '700', color: '#1E40AF', margin: '0 0 12px' }
const benefitItem = { fontSize: '13px', color: '#374151', margin: '8px 0', lineHeight: '1.5' }
const statsRow = { textAlign: 'center' as const, marginBottom: '28px' }
const statItem = {
  fontSize: '13px', color: '#6B7280', display: 'inline-block' as const,
  width: '30%', verticalAlign: 'top' as const, padding: '0 4px',
}
const ctaSection = { textAlign: 'center' as const, marginBottom: '28px' }
const ctaButton = {
  backgroundColor: '#3B82F6', color: '#ffffff', borderRadius: '12px',
  padding: '14px 36px', fontSize: '15px', fontWeight: '600', textDecoration: 'none',
}
const divider = { borderColor: '#E5E7EB', margin: '24px 0' }
const footerText = { fontSize: '13px', color: '#9CA3AF', lineHeight: '1.6', margin: '0 0 8px' }
