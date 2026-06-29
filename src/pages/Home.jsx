import Hero from '../sections/Hero'
import Services from '../sections/Services'
import StatsBand from '../sections/StatsBand'
import FeaturedDoctors from '../sections/FeaturedDoctors'
import Features from '../sections/Features'
import Testimonials from '../sections/Testimonials'
import CTA from '../sections/CTA'

export default function Home({ go, onBook, onOpen }) {
  return (
    <>
      <Hero onBook={onBook} go={go} />
      <Services go={go} />
      <div style={{ padding: '20px 0 40px' }}>
        <StatsBand />
      </div>
      <FeaturedDoctors go={go} onOpen={onOpen} onBook={onBook} />
      <Features />
      <Testimonials />
      <CTA onBook={onBook} />
    </>
  )
}
