# AI Development Rules - DegenTrade

## Tech Stack
- **Frontend**: React 18 with TypeScript and Vite.
- **Backend**: Express.js server running on Node.js.
- **Database**: SQLite using the `better-sqlite3` library for local persistence.
- **Styling**: Tailwind CSS v4 for utility-first design and responsive layouts.
- **Animations**: Framer Motion (`motion`) for all UI transitions and game effects.
- **Icons**: Lucide React for a consistent and lightweight icon set.
- **Charts**: Recharts for trade history and PnL visualization.
- **Web3**: Ethers.js v6 and Web3Modal for wallet integration and blockchain interactions.
- **AI**: Google Gemini API via `@google/generative-ai` for intelligent features.

## Library Usage Rules

### 1. UI & Styling
- **Tailwind CSS**: Use Tailwind utility classes for all styling. Avoid creating new CSS files unless absolutely necessary.
- **Icons**: Always use `lucide-react`. Do not import icons from other libraries.
- **Components**: Prioritize using `shadcn/ui` components (already installed) for standard elements like buttons, inputs, and modals.

### 2. Animations & Interactivity
- **Framer Motion**: Use the `motion` component for any element that requires animation. Keep animations performant and purposeful.
- **Transitions**: Use `AnimatePresence` for handling entry/exit animations of components.

### 3. Data & State
- **Charts**: Use `recharts` for all data visualizations. Ensure charts are responsive and follow the app's dark-themed aesthetic.
- **API Calls**: Use the native `fetch` API for communicating with the Express backend.
- **Database**: All backend data persistence must go through `better-sqlite3`. Ensure SQL queries are prepared to prevent injection.

### 4. Web3 & Blockchain
- **Ethers.js**: Use version 6 (`ethers`) for all wallet and provider interactions.
- **Wallet Connection**: Use `@web3modal/ethers` for the connection flow.

### 5. Code Structure
- **Components**: Keep components small and focused. Create new files in `src/components/` for reusable UI logic.
- **Pages**: Main application views should reside in `src/pages/`.
- **Backend**: Keep API logic in `server.ts` or modularize into a `server/` directory if it grows significantly.