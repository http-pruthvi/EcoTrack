<div align="center">

# 🌿 EcoTrack

**Understand, Track, and Reduce Your Carbon Footprint**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

EcoTrack is a full-stack web application that empowers citizens to calculate their personal carbon footprint through an interactive quiz, build daily sustainability habits with streak tracking, and leverage AI-powered tools for smarter environmental decisions.

[Live Demo](https://ecotrack.vercel.app) · [Report Bug](https://github.com/http-pruthvi/EcoTrack/issues) · [Request Feature](https://github.com/http-pruthvi/EcoTrack/issues)

</div>

---

## ✨ Features

### 🧮 Carbon Footprint Calculator
- **2-Minute Onboarding Quiz** — Answer questions about housing, heating, diet, commute, flights, and shopping habits.
- **Annualized Estimate** — Calculates your total CO₂e per year, broken down into four categories: Home Energy, Transportation, Diet & Food, and Goods & Shopping.
- **National Average Comparison** — See how your footprint stacks up against a configurable national baseline (default: 10,000 kg CO₂e/year).

### 📊 Dashboard & Insights
- **Footprint Summary Card** — At-a-glance view of your total emissions with monthly savings tracking.
- **Category Breakdown Chart** — Interactive donut chart visualizing emissions by category.
- **Reduction Opportunities** — AI-ranked suggestions sorted by carbon savings relative to effort required.
- **Footprint History** — Line chart tracking your emissions trajectory over time with snapshot comparisons.

### 🔥 Habit Streaks
- **Daily Check-Ins** — Log eco-friendly actions and build consecutive day streaks.
- **21-Day Rule** — Visual progress bar toward habit formation with milestone markers.
- **Streak Freezes** — One freeze per rolling 7-day window protects your streak from breaking.
- **Auto-Sync** — Streak integrity is verified and corrected on every page load.

### 🤖 EcoAI Hub (Gemini-Powered)
- **EcoGPT Chat** — Real-time AI sustainability coach powered by Gemini 2.5 Flash. Context-aware — your actual footprint data and active habits are injected as system instructions for hyper-personalized advice.
- **Smart OCR Scanner** — Upload a photo of your electricity bill, gas bill, or grocery receipt. Gemini's multimodal API extracts consumption metrics and calculates the carbon impact.
- **Green Incentives Finder** — Searchable directory of real-world green subsidies, tax credits, and rebates across the US, India, UK, and Canada.
- **Clean Grid Alerts** — Hourly forecast of renewable energy availability on your regional grid, with recommendations on when to run high-load appliances.
- **Neighborhood Leagues** — Community leaderboards tracking collective carbon reductions across districts.

### 🔐 Authentication
- **Email/Password Auth** — Secure registration and login with friendly error messages.
- **Google Sign-In** — One-click OAuth authentication.
- **Route Protection** — Unauthenticated users are redirected to login; onboarding-incomplete users are sent to the quiz.

### 📱 Responsive Design
- **Desktop Sidebar** — Full navigation with user avatar and sign-out.
- **Mobile Tab Bar** — Bottom navigation optimized for touch with smooth transitions.
- **Dark Mode** — Full dark theme support via Tailwind CSS `dark:` variants.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Backend** | [Firebase](https://firebase.google.com/) (Firestore, Auth) |
| **AI** | [Google Gemini API](https://ai.google.dev/) (gemini-2.5-flash) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```
EcoTrack/
├── app/
│   ├── layout.tsx              # Root layout with AuthProvider
│   ├── page.tsx                # Landing page
│   ├── login/page.tsx          # Authentication (Sign In / Sign Up)
│   ├── onboarding/page.tsx     # Carbon footprint quiz
│   └── dashboard/
│       ├── layout.tsx          # Dashboard shell (Sidebar + MobileTabBar)
│       ├── page.tsx            # Main dashboard with summary widgets
│       ├── ai/page.tsx         # EcoAI Hub (Chat, Scanner, Incentives, Grid, Leagues)
│       ├── habits/page.tsx     # Active habits with streak tracking
│       ├── history/page.tsx    # Footprint history chart
│       ├── insights/page.tsx   # Reduction opportunities catalog
│       └── profile/page.tsx    # Edit footprint profile & recalculate
├── components/
│   ├── auth/
│   │   └── AuthProvider.tsx    # Auth context, route guards, session state
│   ├── dashboard/
│   │   ├── CategoryBreakdownChart.tsx
│   │   ├── FootprintSummaryCard.tsx
│   │   ├── HabitStreakCard.tsx
│   │   └── InsightCard.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx         # Desktop navigation
│   │   └── MobileTabBar.tsx    # Mobile bottom navigation
│   └── ui/
│       ├── Button.tsx          # Reusable button component
│       ├── Card.tsx            # Card primitives
│       └── ProgressBar.tsx     # Animated progress bar with markers
├── lib/
│   ├── firebase.ts             # Firebase config, Firestore CRUD, Auth helpers
│   ├── footprintCalculator.ts  # Pure function carbon emission calculator
│   ├── generateInsights.ts     # Ranked reduction recommendations engine
│   ├── actionCatalog.ts        # Full catalog of eco-friendly actions
│   ├── incentives.ts           # Green subsidies & rebates directory
│   ├── equivalents.ts          # CO₂ savings to real-world equivalents
│   └── streakChecker.ts        # Streak integrity verification & auto-sync
├── .env.local.example          # Environment variable template
├── firestore.rules             # Firestore security rules
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ — [Download](https://nodejs.org/)
- **npm** or **yarn**
- **Firebase Project** — [Create one](https://console.firebase.google.com/)
- **Gemini API Key** (optional, for AI features) — [Get one](https://aistudio.google.com/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/http-pruthvi/EcoTrack.git
cd EcoTrack
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase project config:

```env
# Firebase Client Settings
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Gemini API Key (optional — enables EcoGPT chat and OCR scanner)
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

> **Note:** The Gemini API key can also be configured at runtime through the EcoAI Hub interface.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub.
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Add your environment variables under **Settings → Environment Variables**.
4. Deploy — Vercel handles the rest automatically.

### Firebase Setup

1. Enable **Authentication** (Email/Password + Google provider) in the Firebase Console.
2. Create a **Firestore Database** in production mode.
3. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 🧪 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create optimized production build |
| `npm start` | Serve production build locally |
| `npm run lint` | Run ESLint checks |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Developer

**Pruthvi**

- GitHub: [@http-pruthvi](https://github.com/http-pruthvi)

---

<div align="center">

*Built with 💚 for individuals and the planet.*

</div>
