import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-5 border-b border-slate-800">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Trao AI Travel Planner
        </span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Plan Your Perfect Trip with{' '}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              AI
            </span>
          </h1>
          <p className="text-lg text-slate-400 mb-10">
            Generate day-by-day itineraries, realistic budgets, hotel recommendations, and
            weather-aware packing lists — all powered by Google Gemini.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition text-lg"
          >
            Start Planning Free
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="text-3xl mb-4 block">🗺️</span>
            <h3 className="text-lg font-bold mb-2">Smart Itineraries</h3>
            <p className="text-sm text-slate-400">
              AI generates structured day-by-day plans tailored to your interests and budget tier.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="text-3xl mb-4 block">💰</span>
            <h3 className="text-lg font-bold mb-2">Budget Estimates</h3>
            <p className="text-sm text-slate-400">
              Realistic cost breakdowns for accommodation, food, activities, and transport.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <span className="text-3xl mb-4 block">🎒</span>
            <h3 className="text-lg font-bold mb-2">Packing Assistant</h3>
            <p className="text-sm text-slate-400">
              Weather-aware packing checklists based on your destination and planned activities.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
