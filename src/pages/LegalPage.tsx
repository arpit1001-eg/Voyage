import Seo from '../components/Seo'

export default function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const privacy = kind === 'privacy'
  return (
    <article className="voyage-page legal-page">
      <Seo title={privacy ? 'Privacy' : 'Terms'} />
      <p className="voyage-eyebrow">VOYAGE · {privacy ? 'A NOTE ON YOUR PRIVACY' : 'A NOTE BEFORE YOU GO'}</p>
      <h1>{privacy ? <>Your plans are <em>yours.</em></> : <>A thoughtful place to <em>begin.</em></>}</h1>
      {privacy ? (
        <div className="legal-copy">
          <p>VOYAGE is a portfolio demonstration, not a travel agency, booking service, or account-based product. We do not request an account to browse, plan a sample trip, or play the field-notes challenge.</p>
          <h2>Information stored in your browser</h2><p>Saved trip drafts, saved destinations, and parts of your passport are stored in this browser’s local storage. They are not encrypted, synced across devices, or backed up. Clearing browser data removes them. Do not save sensitive personal information in a trip draft.</p>
          <h2>Guest game sessions</h2><p>The game uses a first-party, HttpOnly guest cookie to associate server-checked answers and virtual progress with your browser. The server stores a random guest identifier, challenge answers, score, and virtual stamps in the site’s JSON data store. No precise location is collected. These guest records are not authenticated account data.</p>
          <h2>Trip enquiries</h2><p>If you submit the existing trip-enquiry form, the name, email address, and other fields you provide are stored in the site’s enquiry inbox. An optional deployment webhook may forward enquiries to the configured service. This demo uses a placeholder contact address; do not provide sensitive information.</p>
          <h2>Third-party services</h2><p>Destination photography may be loaded from Unsplash when no locally uploaded photo exists. Your browser may connect to that image host to retrieve the image. Google Fonts may also be contacted to load the site’s typography.</p>
          <h2>Your choices and contact</h2><p>You can clear local storage and cookies in your browser settings. This demonstration does not currently have user accounts, cross-device sync, or a self-service data deletion endpoint. For real deployment, replace this notice and placeholder contact details with the operator’s verified privacy and support information.</p>
          <p className="legal-updated">Last updated 2 November 2026 · Demonstration privacy notice</p>
        </div>
      ) : (
        <div className="legal-copy">
          <p>VOYAGE is a demonstration of travel discovery, trip planning, and a virtual exploration game. It does not sell travel, accept payments, make reservations, or issue real-world rewards.</p>
          <h2>Planning and estimates</h2><p>Trip Studio itineraries are curated demo drafts generated from sample destination content. Daily spend figures are approximate regional estimates, not quotes. They exclude flights and may not reflect current prices, availability, accessibility, opening times, or local conditions. Confirm important details with current, authoritative sources before travelling.</p>
          <h2>Travel decisions</h2><p>Destination information is provided for inspiration and may be incomplete or out of date. You are responsible for checking entry requirements, safety guidance, health advice, transport, weather, and accessibility requirements for your trip.</p>
          <h2>Virtual game progress</h2><p>XP, stamps, levels, and achievements are virtual demonstration features only. They have no monetary value and cannot be redeemed. Guest progress may be unavailable across devices or after site data is cleared.</p>
          <h2>Availability</h2><p>This portfolio project is provided as-is, may change or become unavailable, and should not be used as the sole source for travel, safety, or booking decisions. Trip-enquiry submission is a demonstration contact flow and does not guarantee a response or service.</p>
          <p className="legal-updated">Last updated 2 November 2026 · Demonstration terms</p>
        </div>
      )}
    </article>
  )
}
