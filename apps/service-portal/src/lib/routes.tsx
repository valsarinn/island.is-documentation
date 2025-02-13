import { RouteObject } from 'react-router-dom'
import { Dashboard } from '../screens/Dashboard/Dashboard'
import { Root } from '../components/Root'

/**
 * Creates routes for the my-pages portal. All routes are defined here.
 * Note that the routes for the modules are created within PortalRouter {@link PortalRouter}.
 */
export const createRoutes = (moduleRoutes: RouteObject[]): RouteObject[] => [
  {
    element: <Root />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      ...moduleRoutes,
    ],
  },
]
