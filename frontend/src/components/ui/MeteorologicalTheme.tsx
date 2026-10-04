'use client';

import React from 'react';
import { createStitches } from '@stitches/react';

/* ==========================================================================
   1. STITCHES CONFIGURATION (METEOROLOGICAL LIGHT GLASS THEME)
   ========================================================================== */

export const {
  styled,
  css,
  globalCss,
  keyframes,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      // Atmospheric Light Sky & Cloud Tints
      bgBackdropTint: 'rgba(240, 245, 255, 0.72)',
      bgHazyFogOverlay: 'rgba(255, 255, 255, 0.45)',

      // Floating Glass Surfaces (Translucent / Frosted)
      glassCardBg: 'rgba(255, 255, 255, 0.75)',
      glassCardBgHover: 'rgba(255, 255, 255, 0.90)',
      glassHeaderBg: 'rgba(255, 255, 255, 0.82)',
      glassTableRowBg: 'rgba(255, 255, 255, 0.35)',
      glassTableRowHover: 'rgba(241, 245, 253, 0.65)',

      // Translucent Frost Borders
      borderGlassSubtle: 'rgba(255, 255, 255, 0.65)',
      borderGlassDefault: 'rgba(219, 230, 247, 0.60)',
      borderGlassStrong: 'rgba(186, 207, 238, 0.85)',

      // Authoritative Scientific Typography
      textNavyTitle: '#0f172a',
      textPrimary: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#64748b',
      textBrandBlue: '#1e3a8a',

      // Operational Status Accents
      statusNominal: '#059669',
      statusNominalBg: 'rgba(16, 185, 129, 0.12)',
      statusWarning: '#d97706',
      statusWarningBg: 'rgba(245, 158, 11, 0.14)',
      statusCritical: '#dc2626',
      statusCriticalBg: 'rgba(239, 68, 68, 0.14)',
      statusInfo: '#2563eb',
      statusInfoBg: 'rgba(37, 99, 235, 0.12)',
    },
    fonts: {
      sans: `'Public Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
      mono: `'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace`,
    },
    fontSizes: {
      xs: '0.6875rem',  // 11px
      sm: '0.75rem',    // 12px
      base: '0.875rem', // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
    },
    radii: {
      xs: '3px',
      sm: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    shadows: {
      floatingGlass: '0 8px 32px 0 rgba(31, 38, 135, 0.08), 0 1px 1px 0 rgba(255, 255, 255, 0.7) inset',
      floatingCard: '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.8) inset',
      subtleElevation: '0 2px 8px rgba(15, 23, 42, 0.04)',
    },
  },
});

/* ==========================================================================
   2. GLOBAL LAYOUT ARCHITECTURE & HAZY ATMOSPHERIC BACKDROP
   ========================================================================== */

export const LayoutWrapper = styled('div', {
  position: 'relative',
  minHeight: '100vh',
  width: '100%',
  overflowX: 'hidden',
  fontFamily: '$sans',
  color: '$textPrimary',
});

// Fixed Hazy Cloud Background Container
export const HazyBackdropContainer = styled('div', {
  position: 'fixed',
  inset: 0,
  zIndex: -1,
  pointerEvents: 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
  backgroundRepeat: 'no-repeat',
  filter: 'blur(3px) brightness(1.04) saturate(0.95)',
  transform: 'scale(1.03)', // eliminates blur edge clipping
});

// Diffuse Sky Mist Tint Overlay
export const AtmosphericMistOverlay = styled('div', {
  position: 'fixed',
  inset: 0,
  zIndex: -1,
  pointerEvents: 'none',
  background: 'linear-gradient(180deg, rgba(248, 250, 255, 0.65) 0%, rgba(238, 242, 255, 0.78) 60%, rgba(224, 231, 255, 0.85) 100%)',
  backdropFilter: 'blur(5px)',
  WebkitBackdropFilter: 'blur(5px)',
});

/* ==========================================================================
   3. PERSISTENT TOP NAVIGATION HEADER (FROSTED GLASS)
   ========================================================================== */

export const GlassHeader = styled('header', {
  position: 'sticky',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  height: '62px',
  backgroundColor: '$glassHeaderBg',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderBottom: '1px solid $borderGlassDefault',
  boxShadow: '$floatingGlass',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 2rem',
});

export const BrandEmblem = styled('div', {
  width: '32px',
  height: '32px',
  borderRadius: '$md',
  backgroundColor: '$textBrandBlue',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  boxShadow: '$subtleElevation',
});

export const NavTabsContainer = styled('nav', {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

export const NavTabItem = styled('button', {
  padding: '8px 16px',
  fontSize: '$sm',
  fontWeight: 600,
  borderRadius: '$md',
  cursor: 'pointer',
  border: '1px solid transparent',
  color: '$textSecondary',
  backgroundColor: 'transparent',
  transition: 'all 150ms ease',
  '&:hover': {
    color: '$textNavyTitle',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  variants: {
    active: {
      true: {
        color: '#ffffff',
        backgroundColor: '$textBrandBlue',
        borderColor: '$textBrandBlue',
        boxShadow: '$subtleElevation',
        '&:hover': {
          backgroundColor: '$textBrandBlue',
          color: '#ffffff',
        },
      },
    },
  },
});

/* ==========================================================================
   4. FLOATING TRANSLUCENT CARDS & PANELS
   ========================================================================== */

export const FloatingGlassCard = styled('div', {
  backgroundColor: '$glassCardBg',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderRadius: '$xl',
  border: '1px solid $borderGlassSubtle',
  boxShadow: '$floatingCard',
  overflow: 'hidden',
  transition: 'box-shadow 200ms ease, transform 200ms ease',
  variants: {
    interactive: {
      true: {
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: '$glassCardBgHover',
          transform: 'translateY(-2px)',
          boxShadow: '$floatingGlass',
        },
      },
    },
  },
});

export const GlassCardHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid $borderGlassDefault',
  backgroundColor: 'rgba(255, 255, 255, 0.45)',
});

export const GlassCardTitle = styled('h3', {
  fontSize: '$md',
  fontWeight: 700,
  color: '$textNavyTitle',
  letterSpacing: '-0.01em',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

/* ==========================================================================
   5. FLOATING TRANSLUCENT TABLE TEMPLATE
   ========================================================================== */

export const FloatingTableContainer = styled('div', {
  width: '100%',
  overflowX: 'auto',
  borderRadius: '$xl',
  backgroundColor: '$glassCardBg',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid $borderGlassSubtle',
  boxShadow: '$floatingGlass',
});

export const GlassTable = styled('table', {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontFamily: '$sans',
});

export const GlassTableHead = styled('thead', {
  backgroundColor: 'rgba(241, 245, 253, 0.60)',
  borderBottom: '1px solid $borderGlassDefault',
  '& th': {
    padding: '0.875rem 1.25rem',
    fontSize: '$xs',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '$textMuted',
  },
});

export const GlassTableBody = styled('tbody', {
  '& tr': {
    borderBottom: '1px solid $borderGlassDefault',
    backgroundColor: '$glassTableRowBg',
    transition: 'background-color 120ms ease',
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:hover': {
      backgroundColor: '$glassTableRowHover',
    },
  },
  '& td': {
    padding: '1rem 1.25rem',
    fontSize: '$sm',
    color: '$textPrimary',
    verticalAlign: 'middle',
  },
  '& td[data-telemetry]': {
    fontFamily: '$mono',
    fontWeight: 600,
    letterSpacing: '-0.02em',
  },
});

/* ==========================================================================
   6. SCIENTIFIC TELEMETRY PILLS & STATUS BADGES
   ========================================================================== */

export const TelemetryPill = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '3px 8px',
  borderRadius: '$full',
  fontSize: '$xs',
  fontWeight: 600,
  fontFamily: '$mono',
  variants: {
    variant: {
      nominal: {
        backgroundColor: '$statusNominalBg',
        color: '$statusNominal',
        border: '1px solid rgba(16, 185, 129, 0.25)',
      },
      warning: {
        backgroundColor: '$statusWarningBg',
        color: '$statusWarning',
        border: '1px solid rgba(245, 158, 11, 0.25)',
      },
      critical: {
        backgroundColor: '$statusCriticalBg',
        color: '$statusCritical',
        border: '1px solid rgba(239, 68, 68, 0.25)',
      },
      info: {
        backgroundColor: '$statusInfoBg',
        color: '$statusInfo',
        border: '1px solid rgba(37, 99, 235, 0.25)',
      },
    },
  },
  defaultVariants: {
    variant: 'nominal',
  },
});

/* ==========================================================================
   7. COMPLETE PAGE SKELETON (CLEAN EXPORTABLE TEMPLATE)
   ========================================================================== */

export interface MeteorologicalTemplateProps {
  backgroundImageUrl?: string;
  pageTitle?: string;
  agencyName?: string;
  children?: React.ReactNode;
}

export const MeteorologicalPageTemplate: React.FC<MeteorologicalTemplateProps> = ({
  backgroundImageUrl = '/bg-satellite.jpg',
  pageTitle = 'Scientific Telemetry & Observations',
  agencyName = 'National Meteorological & Hazard Command',
  children,
}) => {
  return (
    <LayoutWrapper>
      {/* Hazy Cloud Backdrop */}
      <HazyBackdropContainer
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      />
      <AtmosphericMistOverlay />

      {/* Frosted Top Navigation */}
      <GlassHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BrandEmblem>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v18M3 12h18" />
            </svg>
          </BrandEmblem>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              {agencyName}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.04em', fontFamily: 'monospace' }}>
              ATMOSPHERIC & HYDROLOGICAL MONITORING
            </div>
          </div>
        </div>

        <NavTabsContainer>
          <NavTabItem active={true}>Radar & Satellite</NavTabItem>
          <NavTabItem>Severe Weather Alerts</NavTabItem>
          <NavTabItem>Surface Telemetry</NavTabItem>
          <NavTabItem>Climate Models</NavTabItem>
        </NavTabsContainer>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TelemetryPill variant="nominal">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }} />
            WMO GTS LIVE
          </TelemetryPill>
        </div>
      </GlassHeader>

      {/* Main Page Content Body with Floating Cards & Tables */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 10 }}>
        {children || (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Sample Floating Table Template */}
            <FloatingTableContainer>
              <GlassCardHeader>
                <div>
                  <GlassCardTitle>{pageTitle}</GlassCardTitle>
                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Continuous synchronized ground observation records floating over synoptic backdrop
                  </p>
                </div>
                <button style={{ padding: '6px 14px', borderRadius: '6px', backgroundColor: '#1e3a8a', color: '#fff', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  Export CSV Feed
                </button>
              </GlassCardHeader>

              <GlassTable>
                <GlassTableHead>
                  <tr>
                    <th>Station ID & Identifier</th>
                    <th>Status</th>
                    <th>Surface Temp</th>
                    <th>Wind Vector</th>
                    <th>Barometer</th>
                    <th>Precip (1h)</th>
                    <th>Data Feed</th>
                  </tr>
                </GlassTableHead>
                <GlassTableBody>
                  <tr>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>North Ridge Cut (MET-44028)</td>
                    <td><TelemetryPill variant="nominal">Nominal</TelemetryPill></td>
                    <td data-telemetry>17.8 °C</td>
                    <td data-telemetry>24 kts NW (G 32)</td>
                    <td data-telemetry>1011.2 hPa</td>
                    <td data-telemetry>6.4 mm</td>
                    <td><span style={{ color: '#2563eb', fontFamily: 'monospace', fontSize: '11px', fontWeight: 600 }}>GTS-SYNC: 4s</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>Harbor Buoy 04 (Offshore)</td>
                    <td><TelemetryPill variant="warning">Maintenance Due</TelemetryPill></td>
                    <td data-telemetry>20.2 °C</td>
                    <td data-telemetry>28 kts ENE (G 38)</td>
                    <td data-telemetry>1013.9 hPa</td>
                    <td data-telemetry>11.2 mm</td>
                    <td><span style={{ color: '#d97706', fontFamily: 'monospace', fontSize: '11px', fontWeight: 600 }}>IRIDIUM LAG: 3m</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>Alpine Summit Tower</td>
                    <td><TelemetryPill variant="nominal">Nominal</TelemetryPill></td>
                    <td data-telemetry>4.6 °C</td>
                    <td data-telemetry>36 kts W (G 51)</td>
                    <td data-telemetry>812.4 hPa</td>
                    <td data-telemetry>1.2 mm (Frozen)</td>
                    <td><span style={{ color: '#2563eb', fontFamily: 'monospace', fontSize: '11px', fontWeight: 600 }}>GTS-SYNC: 1s</span></td>
                  </tr>
                </GlassTableBody>
              </GlassTable>
            </FloatingTableContainer>
          </div>
        )}
      </main>
    </LayoutWrapper>
  );
};

export default MeteorologicalPageTemplate;
