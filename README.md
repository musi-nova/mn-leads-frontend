# mn-leads-frontend

Lead management frontend for Musi-Nova. Manage, message, and track email/social leads with a modern UI.

## Features
- View, filter, and search leads (email & social)
- Create, update, and delete leads
- Message selected leads via API
- Random selection of unmessaged leads (max 300)
- Stats dashboard for sent/total leads
- Responsive UI with cards, tables, modals

## Tech Stack
- React + TypeScript
- Vite
- Tanstack React Query
- Tailwind CSS
- shadcn-ui components
- Lucide icons

## Getting Started
1. Clone the repo:
   ```sh
   git clone <YOUR_GIT_URL>
   cd mn-leads-frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the dev server:
   ```sh
   npm run dev
   ```

## API Configuration
Update your API key in `src/hooks/useLeads.ts` and `src/hooks/useMessageLeads.ts`.

## Project Structure
- `src/pages/Index.tsx` — Main lead management UI
- `src/components/leads/` — Table, actions, stats, cards
- `src/hooks/` — Data fetching and mutations
- `src/types/lead.ts` — Lead type definitions

## Deployment
Standard Vite/React deployment. See [Vite docs](https://vitejs.dev/guide/static-deploy.html).

## License
MIT
