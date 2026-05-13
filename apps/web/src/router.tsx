import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { Navigation } from './components/Navigation'
import { HomePage } from './pages/HomePage'
import { DeckDetailPage } from './pages/DeckDetailPage'
import { StatsPage } from './pages/StatsPage'
import { EraPage } from './pages/EraPage'
import { FormatsPage } from './pages/FormatsPage'
import { FormatDetailPage } from './pages/FormatDetailPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminFormatsPage } from './pages/admin/AdminFormatsPage'
import { AdminCardsPage } from './pages/admin/AdminCardsPage'
import { AdminDecksPage } from './pages/admin/AdminDecksPage'
import { AdminDeckEditPage } from './pages/admin/AdminDeckEditPage'
import { AdminErasPage } from './pages/admin/AdminErasPage'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Navigation />
      <Outlet />
    </>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/decks' }) },
})

const decksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/decks',
  component: HomePage,
})

const deckDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/decks/$slug',
  component: DeckDetailPage,
})

const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stats',
  component: StatsPage,
})

const erasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/eras/$slug',
  component: EraPage,
})

const formatsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/formats',
  component: FormatsPage,
})

const formatDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/formats/$slug',
  component: FormatDetailPage,
})

// ── Admin ──────────────────────────────────────────────────────────────

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminLayout,
})

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/admin/decks' }) },
})

const adminFormatsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/formats',
  component: AdminFormatsPage,
})

const adminCardsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/cards',
  component: AdminCardsPage,
})

const adminDecksRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/decks',
  component: AdminDecksPage,
})

const adminDeckEditRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/decks/$slug/edit',
  component: AdminDeckEditPage,
})

const adminErasRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/eras',
  component: AdminErasPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  decksRoute,
  deckDetailRoute,
  statsRoute,
  erasRoute,
  formatsRoute,
  formatDetailRoute,
  adminRoute.addChildren([
    adminIndexRoute,
    adminFormatsRoute,
    adminCardsRoute,
    adminDecksRoute,
    adminDeckEditRoute,
    adminErasRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
