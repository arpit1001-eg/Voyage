import PlanForm from '../components/PlanForm'
import Seo from '../components/Seo'

export default function PlanPage() {
  return (
    <div className="pt-24 md:pt-32">
      <Seo title="Plan a trip" />
      <PlanForm />
    </div>
  )
}
