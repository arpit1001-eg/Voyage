import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
const Home = lazy(() => import('./pages/Home'))
const Destinations = lazy(() => import('./pages/Destinations'))
const DestinationPage = lazy(() => import('./pages/DestinationPage'))
const About = lazy(() => import('./pages/About'))
const Journal = lazy(() => import('./pages/Journal'))
const JournalPost = lazy(() => import('./pages/JournalPost'))
const PlanPage = lazy(() => import('./pages/PlanPage'))
const Planner = lazy(() => import('./pages/Planner'))
const Play = lazy(() => import('./pages/Play'))
const Passport = lazy(() => import('./pages/Passport'))
const Discover = lazy(() => import('./pages/Discover'))
const SavedTripPage = lazy(() => import('./pages/SavedTripPage'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

// The admin panel is only downloaded by people who open /admin.
const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <Routes>
      <Route
        path="admin/*"
        element={
          <Suspense fallback={<p className="p-8 text-muted">Loading…</p>}>
            <title>Admin — Voyage</title>
            <AdminApp />
          </Suspense>
        }
      />
      <Route element={<Suspense fallback={<p className="p-8 text-muted" role="status">Opening your next page…</p>}><Layout /></Suspense>}>
        <Route index element={<Home />} />
        <Route path="discover" element={<Discover />} />
        <Route path="destinations" element={<Destinations />} />
        <Route path="destinations/:slug" element={<DestinationPage />} />
        <Route path="planner/:tripId" element={<SavedTripPage />} />
        <Route path="planner" element={<Planner />} />
        <Route path="play" element={<Play />} />
        <Route path="adventure" element={<Play />} />
        <Route path="adventure/detective" element={<Play />} />
        <Route path="passport" element={<Passport />} />
        <Route path="my-adventures" element={<Passport />} />
        <Route path="privacy" element={<LegalPage kind="privacy" />} />
        <Route path="terms" element={<LegalPage kind="terms" />} />
        <Route path="about" element={<About />} />
        <Route path="journal" element={<Journal />} />
        <Route path="journal/:slug" element={<JournalPost />} />
        <Route path="plan" element={<PlanPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
