'use client';

import { useState } from 'react';
import { api } from '@/utils/api';
import type { Trip } from '@/types';

interface ItineraryCardProps {
  trip: Trip;
  onTripUpdated: (trip: Trip) => void;
}

export default function ItineraryCard({ trip, onTripUpdated }: ItineraryCardProps) {
  const [newActivityName, setNewActivityName] = useState('');
  const [targetDay, setTargetDay] = useState<number>(1);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackDay, setFeedbackDay] = useState<number | null>(null);

  const handleAddActivity = async (dayNum: number) => {
    if (!newActivityName.trim()) return;

    try {
      const updated = await api.trips.addActivity(trip._id, dayNum, {
        title: newActivityName,
        description: 'Added by traveler',
        estimatedCostUSD: 0,
        timeOfDay: 'Afternoon',
      });
      onTripUpdated(updated);
      setNewActivityName('');
    } catch (err) {
      console.error('Failed to add activity', err);
    }
  };

  const handleRemoveActivity = async (dayNum: number, activityIndex: number) => {
    try {
      const updated = await api.trips.removeActivity(trip._id, dayNum, activityIndex);
      onTripUpdated(updated);
    } catch (err) {
      console.error('Failed to remove activity', err);
    }
  };

  const handleRegenerateDay = async (dayNum: number) => {
    setRegeneratingDay(dayNum);
    try {
      const updated = await api.trips.regenerateDay(trip._id, dayNum, feedback);
      onTripUpdated(updated);
      setFeedback('');
      setFeedbackDay(null);
    } catch (err) {
      console.error('Failed to regenerate day', err);
    } finally {
      setRegeneratingDay(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-slate-800 pb-3">
        Day-by-Day Timeline: {trip.destination}
      </h2>

      <div className="space-y-6">
        {trip.itinerary.map((day) => (
          <div key={day.dayNumber} className="border-l-2 border-indigo-500 pl-6 relative">
            <div className="absolute -left-[9px] top-1 w-4 h-4 bg-indigo-500 rounded-full border-4 border-slate-900" />
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-slate-200">Day {day.dayNumber}</h3>
              <button
                onClick={() => setFeedbackDay(feedbackDay === day.dayNumber ? null : day.dayNumber)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                Regenerate Day
              </button>
            </div>

            {feedbackDay === day.dayNumber && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. Change to outdoor hiking activities..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleRegenerateDay(day.dayNumber)}
                  disabled={regeneratingDay === day.dayNumber}
                  className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                >
                  {regeneratingDay === day.dayNumber ? 'Regenerating...' : 'Go'}
                </button>
              </div>
            )}

            <div className="space-y-3 mb-4">
              {day.activities.map((act, index) => (
                <div
                  key={index}
                  className="bg-slate-800 p-3 rounded-lg border border-slate-700 group"
                >
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">{act.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-indigo-900/40 text-indigo-300 px-2 py-0.5 rounded-full">
                        {act.timeOfDay}
                      </span>
                      <button
                        onClick={() => handleRemoveActivity(day.dayNumber, index)}
                        className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{act.description}</p>
                  {act.estimatedCostUSD > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">${act.estimatedCostUSD}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm mt-3">
              <input
                type="text"
                placeholder="Add new activity..."
                value={targetDay === day.dayNumber ? newActivityName : ''}
                onChange={(e) => {
                  setTargetDay(day.dayNumber);
                  setNewActivityName(e.target.value);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:border-indigo-500 w-full"
              />
              <button
                onClick={() => handleAddActivity(day.dayNumber)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
