import { CalendarPlus, Phone } from 'lucide-react'
import { Reveal } from '../components/Reveal'
import { useContent } from '../hooks/useClinic'

export default function CTA({ onBook }) {
  const content = useContent()
  return (
    <section className="section" style={{ paddingTop: 20 }}>
      <div className="wrap">
        <Reveal className="cta">
          <h2>{content.ctaTitle}</h2>
          <p>{content.ctaSub}</p>
          <div className="cta__btns">
            <button className="btn btn--white btn--lg" onClick={onBook}>
              <CalendarPlus size={18} /> Book appointment
            </button>
            <a className="btn btn--light btn--lg" href={`tel:${content.phone}`}>
              <Phone size={18} /> {content.phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
