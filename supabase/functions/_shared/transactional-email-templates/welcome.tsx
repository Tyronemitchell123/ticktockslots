/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "SlotEngine"
const SITE_URL = "https://aurelia-privateconcierge.com"

interface WelcomeEmailProps {
  displayName?: string
}

const WelcomeEmail = ({ displayName }: WelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME} — grab last-minute luxury deals</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logoText}>⚡ {SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>
          {displayName ? `Welcome, ${displayName}!` : 'Welcome aboard!'}
        </Heading>
        <Text style={text}>
          You're now part of {SITE_NAME} — the smartest way to grab last-minute
          cancelled bookings at luxury venues, top restaurants, premium spas,
          and more.
        </Text>

        <Text style={text}>Here's what you can do:</Text>

        <Section style={featureCard}>
          <Text style={featureItem}>🔍 Browse live cancelled slots at up to 50% off</Text>
          <Text style={featureItem}>⚡ Claim deals instantly before they expire</Text>
          <Text style={featureItem}>🔔 Set price alerts to never miss a match</Text>
          <Text style={featureItem}>⭐ Build your trust score for priority access</Text>
        </Section>

        <Section style={ctaSection}>
          <Button style={ctaButton} href={SITE_URL}>
            Explore Live Slots
          </Button>
        </Section>

        <Text style={footerText}>
          Happy hunting — The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: `Welcome to ${SITE_NAME} — let's get started`,
  displayName: 'Welcome email',
  previewData: { displayName: 'Jane' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '520px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logoText = { fontSize: '20px', fontWeight: '700', color: '#3B82F6', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 12px', textAlign: 'center' as const }
const text = { fontSize: '14px', color: '#6B7280', lineHeight: '1.6', margin: '0 0 16px' }
const featureCard = {
  backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
  border: '1px solid #E5E7EB',
}
const featureItem = { fontSize: '14px', color: '#374151', margin: '6px 0', lineHeight: '1.5' }
const ctaSection = { textAlign: 'center' as const, marginBottom: '24px' }
const ctaButton = {
  backgroundColor: '#3B82F6', color: '#ffffff', borderRadius: '12px',
  padding: '12px 32px', fontSize: '15px', fontWeight: '600', textDecoration: 'none',
}
const footerText = { fontSize: '13px', color: '#9CA3AF', lineHeight: '1.5', margin: '0' }
