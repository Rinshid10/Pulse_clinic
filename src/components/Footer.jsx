import { Activity, Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react'
import { useContent } from '../hooks/useClinic'

export default function Footer({ go, onBook }) {
  const content = useContent()
  return (
    <footer className="footer" id="contact">
      <div className="wrap">
        <div className="footer__grid">
          <div className="footer__about">
            <div className="brand">
              <div className="brand__mark">
                <Activity size={23} strokeWidth={2.6} />
              </div>
              <span className="brand__name">Pulse<span>.</span></span>
            </div>
            <p>Modern healthcare made simple. Book trusted specialists, get expert care, and take control of your health — all in one place.</p>
            <div className="socials">
              <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin size={18} /></a>
            </div>
          </div>

          <div>
            <h4>Company</h4>
            <div className="footer__links">
              <button onClick={() => go('home')}>About us</button>
              <button onClick={() => go('doctors')}>Our doctors</button>
              <button onClick={onBook}>Book appointment</button>
              <button onClick={() => go('home')}>Careers</button>
            </div>
          </div>

          <div>
            <h4>Services</h4>
            <div className="footer__links">
              <button onClick={() => go('doctors')}>Cardiology</button>
              <button onClick={() => go('doctors')}>Pediatrics</button>
              <button onClick={() => go('doctors')}>Dermatology</button>
              <button onClick={() => go('doctors')}>Neurology</button>
            </div>
          </div>

          <div>
            <h4>Contact</h4>
            <div className="footer__links">
              <button><MapPin size={15} style={{ marginRight: 6, verticalAlign: -2 }} />{content.address}</button>
              <button><Phone size={15} style={{ marginRight: 6, verticalAlign: -2 }} />{content.phone}</button>
              <button><Mail size={15} style={{ marginRight: 6, verticalAlign: -2 }} />{content.email}</button>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>{content.footer}</span>
          <span>Privacy Policy · Terms of Service</span>
        </div>
      </div>
    </footer>
  )
}
