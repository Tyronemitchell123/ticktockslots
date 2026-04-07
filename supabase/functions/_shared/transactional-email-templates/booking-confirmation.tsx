/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "SlotEngine"

interface BookingConfirmationProps {
  merchantName?: string
  vertical?: string
  location?: string
  time?: string
  originalPrice?: string
  discountedPrice?: string
  savings?: string
  bookingId?: string
}

const BookingConfirmationEmail = ({
  merchantName = 'Service Provider',
  vertical = 'Service',
  location = '',
  time = '',
  originalPrice = '',
  discountedPrice = '',
  savings = '',
  bookingId = '',
}: BookingConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Booking confirmed — {merchantName} via {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Text style={logoText}>⚡ {SITE_NAME}</Text>
        </Section>

        <Heading style={h1}>Booking Confirmed!</Heading>
        <Text style={subtitle}>
          You've successfully claimed a last-minute slot. Here are your details:
        </Text>

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

          {discountedPrice && (
            <>
              <Text style={detailLabel}>{SITE_NAME} Price</Text>
              <Text style={priceHighlight}>{discountedPrice}</Text>
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
          If you have any questions about your booking, please don't hesitate to reach out.
        </Text>
        <Text style={footerText}>
          — The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookingConfirmationEmail,
  subject: (data: Record<string, any>) =>
    `Booking confirmed — ${data.merchantName || 'Your slot'} via SlotEngine`,
  displayName: 'Booking confirmation',
  previewData: {
    merchantName: 'Luxe Hair Studio',
    vertical: 'Beauty',
    location: 'Manhattan, NY',
    time: '2:30 PM Today',
    originalPrice: '£180.00',
    discountedPrice: '£89.00',
    savings: '£91.00 (50%)',
    bookingId: 'a1b2c3d4-e5f6-7890',
  },
} satisfies TemplateEntry

// Styles — brand: primary blue hsl(217, 91%, 60%), dark bg app but white email bg
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
const bookingRef = { fontSize: '12px', color: '#9CA3AF', textAlign: 'center' as const, margin: '0 0 20px', fontFamily: "'JetBrains Mono', monospace" }
const footerText = { fontSize: '13px', color: '#9CA3AF', lineHeight: '1.5', margin: '0 0 8px' }
