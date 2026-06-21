'use client';

import { useState } from 'react';
import { api } from '@/utils/api';
import type { CreateTripPayload, Trip } from '@/types';

interface CreateTripFormProps {
  onTripCreated: (trip: Trip) => void;
}

const INTEREST_OPTIONS = [
  'Food & Dining',
  'History & Culture',
  'Nature & Outdoors',
  'Nightlife',
  'Shopping',
  'Art & Museums',
  'Adventure Sports',
  'Relaxation',
];

export default function CreateTripForm({ onTripCreated }: CreateTripFormProps) {
  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(5);
  const [budgetTier, setBudgetTier] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: CreateTripPayload = {
        destination,
        durationDays,
        budgetTier,
        interests,
      };
      const trip = await api.trips.generate(payload);
      onTripCreated(trip);
      setDestination('');
      setDurationDays(5);
      setBudgetTier('Medium');
      setInterests([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-lg font-bold mb-4">Create New Trip</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            placeholder="e.g. Tokyo, Japan"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Duration (days)</label>
          <input
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            min={1}
            max={30}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Budget Tier</label>
          <select
            value={budgetTier}
            onChange={(e) => setBudgetTier(e.target.value as 'Low' | 'Medium' | 'High')}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  interests.includes(interest)
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition text-sm"
        >
          {loading ? 'Generating with AI...' : 'Generate Itinerary'}
        </button>
      </form>
    </div>
  );
}
