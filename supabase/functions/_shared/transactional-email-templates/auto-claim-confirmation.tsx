/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "TickTock Slots"

interface AutoClaimConfirmationProps {
  merchantName?: string
  vertical?: string
  location?: string
  time?: string
  originalPrice?: string
  claimedPrice?: string
  savings?: string
  bookingId?: string
  ruleSummary?: string
}

const AutoClaimConfirmationEmail = ({
  merchantName = 'Service Provider',
  vertical = 'Service',
  location = '',
  time = '',
  originalPrice = '',
  claimedPrice = '',
  savings = '',
  bookingId = '',
  ruleSummary = '',
}: AutoClaimConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Auto-claimed: {merchantName} — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logoText}>⚡ {SITE_NAME}</Text>
        </Section>

        <Section style={autoBadgeSection}>
          <Text style={autoBadge}>🤖 AUTO-CLAIMED</Text>
        </Section>

        <Heading style={h1}>Slot Automatically Claimed!</Heading>
        <Text style={subtitle}>
          Your auto-claim rule matched a new slot. We've secured it for you instantly.
        </Text>

        {ruleSummary && (
          <Section style={ruleCard}>
            <Text style={ruleLabel}>Matched Rule</Text>
            <Text style={ruleValue}>{ruleSummary}</Text>
          </Section>
        )}

        <Section style={detailsCard}>
          <Text style={detailLabel}>Provider</Text>
          <Text style={detailValue}>{merchantName}</Text>

          <Text style={detailLabel}>Category</Text>
          <Text style={detailValue}>{vertical}</Text>

          {location && (
            <>
              <Text style={detailLabel}>Location</Text>
              <Text style={detailValue}>{location}</Text>
            </>
          )}

          {time && (
            <>
              <Text style={detailLabel}>Time</Text>
              <Text style={detailValue}>{time}</Text>
            </>
          )}

          <Hr style={divider} />

          {originalPrice && (
            <>
              <Text style={detailLabel}>Original Price</Text>
              <Text style={priceStrike}>{originalPrice}</Text>
            </>
          )}

          {claimedPrice && (
            <>
              <Text style={detailLabel}>{SITE_NAME} Price</Text>
              <Text style={priceHighlight}>{claimedPrice}</Text>
            </>
          )}

          {savings && (
            <>
              <Text style={detailLabel}>You Saved</Text>
              <Text style={savingsText}>{savings}</Text>
            </>
          )}
        </Section>

        {bookingId && (
          <Text style={bookingRef}>Booking Ref: {bookingId.slice(0, 8).toUpperCase()}</Text>
        )}

        <Text style={footerText}>
          This slot was claimed automatically based on your rules.
          You can manage your auto-claim settings from your dashboard.
        </Text>
        <Text style={footerText}>
          — The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AutoClaimConfirmationEmail,
  subject: (data: Record<string, any>) =>
    `Auto-claimed: ${data.merchantName || 'New slot'} — TickTock Slots`,
  displayName: 'Auto-claim confirmation',
  previewData: {
    merchantName: 'Glow & Go London',
    vertical: 'Beauty',
    location: 'London, UK',
    time: '3:15 PM Today',
    originalPrice: '£120.00',
    claimedPrice: '£59.00',
    savings: '£61.00 (51%)',
    bookingId: 'ac1b2c3d-e5f6-7890',
    ruleSummary: 'Beauty • London • Under £80',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '520px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '8px' }
const logoText = { fontSize: '20px', fontWeight: '700', color: '#3B82F6', margin: '0' }
const autoBadgeSection = { textAlign: 'center' as const, marginBottom: '16px' }
const autoBadge = {
  display: 'inline-block' as const, fontSize: '12px', fontWeight: '700',
  color: '#7C3AED', backgroundColor: '#EDE9FE', borderRadius: '20px',
  padding: '6px 16px', letterSpacing: '0.05em', margin: '0',
}
const h1 = { fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px', textAlign: 'center' as const }
const subtitle = { fontSize: '14px', color: '#6B7280', lineHeight: '1.5', margin: '0 0 24px', textAlign: 'center' as const }
const ruleCard = {
  backgroundColor: '#EDE9FE', borderRadius: '10px', padding: '14px 18px', marginBottom: '16px',
  border: '1px solid #DDD6FE',
}
const ruleLabel = { fontSize: '11px', color: '#7C3AED', textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '0 0 4px', fontWeight: '600' }
const ruleValue = { fontSize: '14px', color: '#4C1D95', fontWeight: '600', margin: '0' }
const detailsCard = {
  backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px',
  border: '1px solid #E5E7EB',
}
const detailLabel = { fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase' as const, letterSpacing: '0.05em', margin: '12px 0 2px', fontWeight: '500' }
const detailValue = { fontSize: '15px', color: '#111827', fontWeight: '600', margin: '0 0 4px' }
const divider = { borderColor: '#E5E7EB', margin: '16px 0' }
const priceStrike = { fontSize: '14px', color: '#9CA3AF', textDecoration: 'line-through', margin: '0 0 4px' }
const priceHighlight = { fontSize: '20px', color: '#3B82F6', fontWeight: '700', margin: '0 0 4px' }
const savingsText = { fontSize: '15px', color: '#10B981', fontWeight: '600', margin: '0' }
const bookingRef = { fontSize: '12px', color: '#9CA3AF', textAlign: 'center' as const, margin: '0 0 20px', fontFamily: "'JetBrains Mono', monospace" }
const footerText = { fontSize: '13px', color: '#9CA3AF', lineHeight: '1.5', margin: '0 0 8px' }
