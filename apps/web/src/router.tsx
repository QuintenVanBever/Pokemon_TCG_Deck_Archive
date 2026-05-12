import React from 'react'
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

const routeTree = rootRoute.addChildren([
  indexRoute,
  decksRoute,
  deckDetailRoute,
  statsRoute,
  erasRoute,
  formatsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
