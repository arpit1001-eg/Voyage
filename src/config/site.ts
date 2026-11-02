/**
 * All static copy lives here so the template can be re-skinned for a client
 * without touching components. Replace demo copy and configure contact details
 * before using the site for a real travel service.
 * Destinations and journal posts are edited in the admin panel (/admin).
 */

export const site = {
  name: 'Voyage',
  email: '',
  replyTime: 'two working days',
  description: 'Discover places, plan a trip that feels like you, play your way, and collect a passport full of possibility.',
  nav: [
    { label: 'Discover', to: '/discover' },
    { label: 'Destinations', to: '/destinations' },
    { label: 'Trip Studio', to: '/planner' },
    { label: 'Play', to: '/adventure' },
    { label: 'My Adventures', to: '/my-adventures' },
    { label: 'Journal', to: '/journal' },
  ],
  hero: {
    headline: [
      { w: 'Travel' },
      { w: 'slowly,', i: true },
      { w: 'return' },
      { w: 'changed.', i: true },
    ],
    body: 'Handcrafted journeys for curious travellers. We plan the route, the stays and the quiet moments in between, so all you have to do is arrive.',
    cta: 'Begin Journey',
  },
  manifesto:
    'Voyage designs journeys for people who would rather see one place properly than ten places quickly. We plan the route, choose the stays and leave room for the unplanned: the long lunch, the wrong turn, the afternoon with nowhere to be.',
  ways: [
    {
      title: 'Private journeys',
      body: 'Your dates, your pace, your companions. Designed from scratch around how you like to travel.',
      items: ['Custom routes', 'Hand-picked stays', 'Private guides and transfers', 'Support while you travel'],
    },
    {
      title: 'Honeymoons and celebrations',
      body: 'Trips for the moments worth marking, planned so that nothing needs your attention but each other.',
      items: ['Romantic stays', 'Private experiences', 'Surprises arranged quietly', 'Flexible pacing'],
    },
    {
      title: 'Family travel',
      body: 'Itineraries that work for different ages, with room for rest and for curiosity.',
      items: ['Kid-friendly activities', 'Connecting rooms and suites', 'Shorter transfer days', 'Guides who enjoy families'],
    },
    {
      title: 'Small-group trips',
      body: 'A handful of travellers, a clear route and a guide who knows the place well.',
      items: ['Small groups only', 'Fixed departure dates', 'Shared guides', 'Single-traveller friendly'],
    },
  ],
  process: [
    { title: 'Listen', body: 'Tell us where you want to go, who is coming and how you like to spend a day.' },
    { title: 'Design', body: 'We draft a route with stays, guides and timings, and refine it with you.' },
    { title: 'Book', body: 'We handle reservations and paperwork so every detail is confirmed before you leave.' },
    { title: 'Travel', body: 'We stay reachable while you are away, in case plans need to change.' },
  ],
  travellerOptions: ['1', '2', '3', '4', '5 to 8', '9 or more'],
} as const
