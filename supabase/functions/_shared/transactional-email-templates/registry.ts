/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as bookingConfirmation } from './booking-confirmation.tsx'
import { template as welcome } from './welcome.tsx'
import { template as priceAlertMatch } from './price-alert-match.tsx'
import { template as autoClaimConfirmation } from './auto-claim-confirmation.tsx'
import { template as merchantOutreach } from './merchant-outreach.tsx'
import { template as merchantInvitation } from './merchant-invitation.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'booking-confirmation': bookingConfirmation,
  'welcome': welcome,
  'price-alert-match': priceAlertMatch,
  'auto-claim-confirmation': autoClaimConfirmation,
  'merchant-outreach': merchantOutreach,
  'merchant-invitation': merchantInvitation,
}
