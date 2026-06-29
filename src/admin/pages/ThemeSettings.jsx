import { useState } from 'react'
import { Palette, RotateCcw, Save, Check, Sun, Moon, ExternalLink } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { Button } from '../components/ui'
import { useToast } from '../hooks/useToast'
import * as theme from '../services/themeService'
import { setThemeMode, getThemeMode, applyCustomerTheme } from '../../services/clinicStore'

const FIELDS = [
  { key: 'brand', label: 'Primary', hint: 'BRAND' },
  { key: 'violet', label: 'Secondary', hint: 'ACCENT 2' },
  { key: 'accent', label: 'Accent', hint: 'HIGHLIGHT' },
  { key: 'bgSoft', label: 'Background', hint: 'SECTION BG' },
  { key: 'surface', label: 'Card / Surface', hint: 'CARDS' },
  { key: 'text', label: 'Text', hint: 'HEADINGS' },
]

export default function ThemeSettings() {
  const toast = useToast()
  const [colors, setColors] = useState(() => theme.getColors())
  const [mode, setMode] = useState(() => getThemeMode())

  const set = (k) => (e) => setColors((c) => ({ ...c, [k]: e.target.value }))

  const applyPreset = (name) => {
    const next = { ...colors, ...theme.PRESETS[name] }
    setColors(next)
    theme.saveColors(next)
    toast('Preset applied', `“${name}” is now live on the website`)
  }

  const save = () => {
    theme.saveColors(colors)
    toast('Theme saved', 'Customer website updated instantly')
  }

  const reset = () => {
    theme.resetColors()
    setColors(theme.getColors())
    toast('Theme reset', 'Restored default colors', 'info')
  }

  const changeMode = (m) => {
    setMode(m)
    setThemeMode(m)
    applyCustomerTheme()
    toast('Mode updated', `Website set to ${m} mode`)
  }

  return (
    <>
      <PageHeader title="Theme" subtitle="Control the customer website's look — changes apply instantly.">
        <a className="ad-btn ad-btn--ghost" href="/" target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open website</a>
        <Button variant="ghost" onClick={reset}><RotateCcw size={16} /> Reset</Button>
        <Button onClick={save}><Save size={16} /> Save changes</Button>
      </PageHeader>

      <div className="ad-grid ad-cols-2">
        <div style={{ display: 'grid', gap: 18 }}>
          <div className="ad-card">
            <div className="ad-card__head"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className="ad-stat__icon i-brand" style={{ width: 38, height: 38 }}><Palette size={18} /></span><div><h3>Colors</h3><p>Pick the palette for your site</p></div></div></div>
            <div className="ad-card__body">
              <div className="ad-swatch-grid">
                {FIELDS.map((f) => (
                  <div className="ad-swatch" key={f.key}>
                    <input type="color" value={colors[f.key] || '#ffffff'} onChange={set(f.key)} />
                    <div className="ad-swatch__meta"><b>{f.label}</b><span>{colors[f.key]}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ad-card">
            <div className="ad-card__head"><div><h3>Color presets</h3><p>One-click palettes</p></div></div>
            <div className="ad-card__body">
              <div className="ad-presets">
                {Object.entries(theme.PRESETS).map(([name, p]) => (
                  <button key={name} className="ad-preset" onClick={() => applyPreset(name)}>
                    <span className="ad-preset__dots">
                      <span style={{ background: p.brand }} />
                      <span style={{ background: p.violet }} />
                      <span style={{ background: p.accent }} />
                    </span>
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="ad-card">
            <div className="ad-card__head"><div><h3>Appearance mode</h3><p>Default mode for visitors</p></div></div>
            <div className="ad-card__body" style={{ display: 'flex', gap: 12 }}>
              <button className={`ad-preset ${mode === 'light' ? '' : ''}`} style={{ flex: 1, justifyContent: 'center', borderColor: mode === 'light' ? 'var(--ad-brand)' : 'var(--ad-border)', color: mode === 'light' ? 'var(--ad-brand-600)' : 'var(--ad-text)' }} onClick={() => changeMode('light')}>
                <Sun size={16} /> Light {mode === 'light' && <Check size={15} />}
              </button>
              <button className="ad-preset" style={{ flex: 1, justifyContent: 'center', borderColor: mode === 'dark' ? 'var(--ad-brand)' : 'var(--ad-border)', color: mode === 'dark' ? 'var(--ad-brand-600)' : 'var(--ad-text)' }} onClick={() => changeMode('dark')}>
                <Moon size={16} /> Dark {mode === 'dark' && <Check size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="ad-card" style={{ position: 'sticky', top: 88 }}>
          <div className="ad-card__head"><div><h3>Live preview</h3><p>How the website looks</p></div></div>
          <div className="ad-card__body">
            <div className="ad-preview" style={{ background: colors.bgSoft }}>
              <div className="ad-preview__bar" style={{ background: colors.surface, borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${colors.brand}, ${colors.violet})` }} />
                <b style={{ color: colors.text, fontSize: 14 }}>Pulse</b>
                <span className="ad-preview__btn" style={{ marginLeft: 'auto', background: colors.brand, fontSize: 12, padding: '6px 12px' }}>Book</span>
              </div>
              <div className="ad-preview__body">
                <div style={{ background: colors.surface, borderRadius: 14, padding: 16, boxShadow: '0 8px 24px -12px rgba(0,0,0,.2)' }}>
                  <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, color: colors.brand, background: `${colors.brand}22`, padding: '4px 10px', borderRadius: 99 }}>SPECIALIST</span>
                  <h4 style={{ color: colors.text, marginTop: 10, fontSize: 17, fontWeight: 800 }}>Dr. Sarah Chen</h4>
                  <p style={{ color: colors.text, opacity: 0.6, fontSize: 13, marginTop: 2 }}>Senior Cardiologist</p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <span className="ad-preview__btn" style={{ background: colors.brand, flex: 1, textAlign: 'center' }}>Book now</span>
                    <span className="ad-preview__btn" style={{ background: colors.accent }}>★ 4.9</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <span style={{ flex: 1, height: 8, borderRadius: 99, background: colors.brand }} />
                  <span style={{ flex: 1, height: 8, borderRadius: 99, background: colors.violet }} />
                  <span style={{ flex: 1, height: 8, borderRadius: 99, background: colors.accent }} />
                </div>
              </div>
            </div>
            <p className="ad-muted" style={{ fontSize: 12.5, marginTop: 14, textAlign: 'center' }}>
              Changes are saved to the website instantly. Open it in a new tab to see them live.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
