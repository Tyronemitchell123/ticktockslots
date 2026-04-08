/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "SlotEngine"

interface PriceAlertMatchProps {
  merchantName?: string
  vertical?: string
  region?: string
  location?: string
  currentPrice?: string
  originalPrice?: string
  savings?: string
  timeDescription?: string
  alertMaxPrice?: string
  slotUrl?: string
}

const PriceAlertMatchEmail = ({
  merchantName = 'Service Provider',
  vertical = 'Service',
  region = '',
  location = '',
  currentPrice = '',
  originalPrice = '',
  savings = '',
  timeDescription = '',
  alertMaxPrice = '',
  slotUrl = '',
}: PriceAlertMatchProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>🔔 Price alert: {merchantName} — {currentPrice} (under your {alertMaxPrice} limit)</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logoText}>⚡ {SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>Price Alert Match!</Heading>
        <Text style={subtitle}>
          A slot matching your price alert has just become available.
        </Text>

        <Section style={detailsCard}>
          <Text style={detailLabel}>Provider</Text>
          <Text style={detailValue}>{merchantName}</Text>

          <Text style={detailLabel}>Category</Text>
          <Text style={detailValue}>{vertical}</Text>

          {region && (
            <>
              <Text style={detailLabel}>Region</Text>
              <Text style={detailValue}>{region}</Text>
            </>
          )}

          {location && (
            <>
              <Text style={detailLabel}>Location</Text>
              <Text style={detailValue}>{location}</Text>
            </>
          )}

          {timeDescription && (
            <>
              <Text style={detailLabel}>Available</Text>
              <Text style={detailValue}>{timeDescription}</Text>
            </>
          )}

          <Hr style={divider} />

          {originalPrice && (
            <>
              <Text style={detailLabel}>Original Price</Text>
              <Text style={priceStrike}>{originalPrice}</Text>
            </>
          )}

          {currentPrice && (
            <>
              <Text style={detailLabel}>Current Price</Text>
              <Text style={priceHighlight}>{currentPrice}</Text>
            </>
          )}

          {savings && (
            <>
              <Text style={detailLabel}>You Save</Text>
              <Text style={savingsText}>{savings}</Text>
            </>
          )}

          {alertMaxPrice && (
            <>
              <Hr style={divider} />
              <Text style={detailLabel}>Your Alert Limit</Text>
              <Text style={alertLimitText}>Under {alertMaxPrice}</Text>
            </>
          )}
        </Section>

        {slotUrl && (
          <Section style={ctaSection}>
            <Button style={ctaButton} href={slotUrl}>
              Claim This Slot
            </Button>
          </Section>
        )}

        <Text style={urgencyText}>
          ⏱ Last-minute slots go fast — claim yours before it's gone!
        </Text>

        <Text style={footerText}>
          You're receiving this because you set up a price alert on {SITE_NAME}.
          You can manage your alerts from your dashboard.
        </Text>
        <Text style={footerText}>
          — The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PriceAlertMatchEmail,
  subject: (data: Record<string, any>) =>
    `🔔 Price alert: ${data.merchantName || 'New slot'} at ${data.currentPrice || 'a great price'}`,
  displayName: 'Price alert match',
  previewData: {
    merchantName: 'Luxe Hair Studio',
    vertical: 'Beauty',
    region: 'London',
    location: 'Mayfair, London',
    currentPrice: '£65.00',
    originalPrice: '£150.00',
    savings: '£85.00 (57%)',
    timeDescription: '3:00 PM Today',
    alertMaxPrice: '£100.00',
    slotUrl: 'https://lastmincancelledbookings.lovable.app/dashboard',
  },
} satisfies TemplateEntry

// Styles — consistent with booking-confirmation
const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '520px', margin: '0 auto' }
const headerSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logoText = { fontSize: '20px', fontWeight: '700', color: '#3B82F6', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px', textAlign: 'center' as const }
const subtitle = { fontSize: '14px', color: '#6B7280', lineHeight: '1.5', margin: '0 0 24px', textAlign: 'center' as const }
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
const alertLimitText = { fontSize: '14px', color: '#6B7280', fontWeight: '500', margin: '0' }
const ctaSection = { textAlign: 'center' as const, margin: '24px 0' }
const ctaButton = {
  backgroundColor: '#3B82F6', color: '#ffffff', padding: '12px 32px',
  borderRadius: '8px', fontSize: '15px', fontWeight: '600',
  textDecoration: 'none', display: 'inline-block',
}
const urgencyText = { fontSize: '13px', color: '#F59E0B', fontWeight: '500', textAlign: 'center' as const, margin: '0 0 24px' }
const footerText = { fontSize: '13px', color: '#9CA3AF', lineHeight: '1.5', margin: '0 0 8px' }
