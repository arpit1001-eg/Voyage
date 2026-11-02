import Seo from '../components/Seo'
import PageHeader from '../components/PageHeader'
import JournalList from '../components/Journal'

export default function Journal() {
  return (
    <>
      <Seo title="Journal" />
      <PageHeader title={<>The <span className="italic text-muted">journal.</span></>} lead="Notes and advice for planning better trips." />
      <JournalList preview={false} />
    </>
  )
}
