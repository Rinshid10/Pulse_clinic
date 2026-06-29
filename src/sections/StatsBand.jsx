import { Reveal } from '../components/Reveal'
import { CountUp } from '../components/ui'
import { STATS } from '../data/clinic'

export default function StatsBand() {
  return (
    <div className="wrap">
      <Reveal className="statsband">
        <div className="statsband__grid">
          {STATS.map((s) => (
            <div className="statc" key={s.label}>
              <b><CountUp to={s.value} suffix={s.suffix} /></b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  )
}
