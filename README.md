# Octopus Agile Daily Rate

A Progressive Web App (PWA) for viewing daily electricity rates on the Octopus Energy Agile tariff.

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** for build tooling
- **Tailwind CSS v4** for styling
- **React Router v7** for client-side routing
- **Zustand** for state management
- **vite-plugin-pwa** with Workbox for offline support

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Start development server            |
| `npm run build`        | Type-check and build for production |
| `npm run preview`      | Preview production build locally    |
| `npm run lint`         | Run ESLint                          |
| `npm run format`       | Format code with Prettier           |
| `npm run format:check` | Check formatting                    |

## PWA

This app is installable as a PWA and works offline. During development, the service worker is enabled via `devOptions` in the Vite PWA plugin configuration.
