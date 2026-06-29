import { useState } from 'react'
import { Save, RotateCcw, Layout, Phone, Star, ExternalLink } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import FormField from '../components/FormField'
import { Button } from '../components/ui'
import { useToast } from '../hooks/useToast'
import * as content from '../services/contentService'

export default function ContentSettings() {
  const toast = useToast()
  const [data, setData] = useState(() => content.getContent())

  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }))
  const setT = (i, k) => (e) =>
    setData((d) => ({ ...d, testimonials: d.testimonials.map((t, idx) => (idx === i ? { ...t, [k]: e.target.value } : t)) }))

  const save = () => { content.saveContent(data); toast('Content saved', 'Website updated instantly') }
  const reset = () => { content.resetContent(); setData(content.getContent()); toast('Content reset', 'Restored defaults', 'info') }

  return (
    <>
      <PageHeader title="Website Content" subtitle="Edit the homepage text, contact details and testimonials.">
        <a className="ad-btn ad-btn--ghost" href="/" target="_blank" rel="noreferrer"><ExternalLink size={16} /> Open website</a>
        <Button variant="ghost" onClick={reset}><RotateCcw size={16} /> Reset</Button>
        <Button onClick={save}><Save size={16} /> Save changes</Button>
      </PageHeader>

      <div className="ad-grid" style={{ gap: 18 }}>
        <div className="ad-card">
          <div className="ad-card__head"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className="ad-stat__icon i-brand" style={{ width: 38, height: 38 }}><Layout size={18} /></span><div><h3>Hero section</h3><p>Top of the homepage</p></div></div></div>
          <div className="ad-card__body">
            <div className="ad-form-grid">
              <FormField label="Hero title — line 1"><input value={data.heroTitleA} onChange={set('heroTitleA')} /></FormField>
              <FormField label="Hero title — line 2 (highlighted)"><input value={data.heroTitleB} onChange={set('heroTitleB')} /></FormField>
              <FormField label="Hero subtitle" span2><textarea rows="2" value={data.heroSub} onChange={set('heroSub')} /></FormField>
            </div>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card__head"><div><h3>Services & CTA</h3><p>Section headings</p></div></div>
          <div className="ad-card__body">
            <div className="ad-form-grid">
              <FormField label="Services title" span2><input value={data.servicesTitle} onChange={set('servicesTitle')} /></FormField>
              <FormField label="Services subtitle" span2><textarea rows="2" value={data.servicesSub} onChange={set('servicesSub')} /></FormField>
              <FormField label="CTA title" span2><input value={data.ctaTitle} onChange={set('ctaTitle')} /></FormField>
              <FormField label="CTA subtitle" span2><textarea rows="2" value={data.ctaSub} onChange={set('ctaSub')} /></FormField>
            </div>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card__head"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className="ad-stat__icon i-green" style={{ width: 38, height: 38 }}><Phone size={18} /></span><div><h3>Contact & footer</h3><p>Shown in footer</p></div></div></div>
          <div className="ad-card__body">
            <div className="ad-form-grid">
              <FormField label="Phone"><input value={data.phone} onChange={set('phone')} /></FormField>
              <FormField label="Email"><input value={data.email} onChange={set('email')} /></FormField>
              <FormField label="Address" span2><input value={data.address} onChange={set('address')} /></FormField>
              <FormField label="Footer text" span2><input value={data.footer} onChange={set('footer')} /></FormField>
            </div>
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card__head"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className="ad-stat__icon i-amber" style={{ width: 38, height: 38 }}><Star size={18} /></span><div><h3>Testimonials</h3><p>Patient quotes on the homepage</p></div></div></div>
          <div className="ad-card__body" style={{ display: 'grid', gap: 16 }}>
            {data.testimonials.map((t, i) => (
              <div key={i} style={{ border: '1px solid var(--ad-border)', borderRadius: 12, padding: 14 }}>
                <div className="ad-form-grid">
                  <FormField label="Name"><input value={t.name} onChange={setT(i, 'name')} /></FormField>
                  <FormField label="Role"><input value={t.role} onChange={setT(i, 'role')} /></FormField>
                  <FormField label="Quote" span2><textarea rows="2" value={t.text} onChange={setT(i, 'text')} /></FormField>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
