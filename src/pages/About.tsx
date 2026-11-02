import Seo from '../components/Seo'
import PageHeader from '../components/PageHeader'
import Manifesto from '../components/Manifesto'
import Services from '../components/Services'
import Process from '../components/Process'
import CtaBand from '../components/CtaBand'

export default function About() {
  return (
    <>
      <Seo title="About" />
      <PageHeader title={<>How we <span className="italic text-muted">travel.</span></>} />
      <Manifesto />
      <Services />
      <Process />
      <CtaBand />
    </>
  )
}
