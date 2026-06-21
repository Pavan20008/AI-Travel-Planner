'use client';

import { useState } from 'react';
import { api } from '@/utils/api';
import type { Trip } from '@/types';

interface PackingListProps {
  trip: Trip;
  onTripUpdated: (trip: Trip) => void;
}

export default function PackingList({ trip, onTripUpdated }: PackingListProps) {
  const [regenerating, setRegenerating] = useState(false);

  const togglePackingItem = async (itemId: string) => {
    const updatedPacking = trip.packingList.map((item) => {
      if (item._id === itemId) {
        return { ...item, isPacked: !item.isPacked };
      }
      return item;
    });

    try {
      const updated = await api.trips.update(trip._id, { packingList: updatedPacking });
      onTripUpdated(updated);
    } catch (err) {
      console.error('Failed to toggle packing item', err);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const updated = await api.trips.regeneratePackingList(trip._id);
      onTripUpdated(updated);
    } catch (err) {
      console.error('Failed to regenerate packing list', err);
    } finally {
      setRegenerating(false);
    }
  };

  const packedCount = trip.packingList?.filter((i) => i.isPacked).length || 0;
  const totalCount = trip.packingList?.length || 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-xl font-bold text-white">AI Weather-Aware Packing Assistant</h3>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
        >
          {regenerating ? 'Regenerating...' : 'Refresh List'}
        </button>
      </div>
      <p className="text-xs text-slate-400 mb-2">
        Based on your planned locations and local climate, pack these items:
      </p>
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progress</span>
            <span>
              {packedCount}/{totalCount} packed
            </span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${totalCount ? (packedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trip.packingList && trip.packingList.length > 0 ? (
          trip.packingList.map((item) => (
            <div
              key={item._id}
              onClick={() => item._id && togglePackingItem(item._id)}
              className="flex items-center gap-3 p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-750 transition"
            >
              <input
                type="checkbox"
                checked={item.isPacked}
                readOnly
                className="h-4 w-4 rounded bg-slate-950 border-slate-800 accent-emerald-500 cursor-pointer"
              />
              <span
                className={`text-sm ${item.isPacked ? 'line-through text-slate-500' : 'text-slate-200'}`}
              >
                {item.item}
              </span>
              <span className="ml-auto text-[10px] uppercase bg-slate-900 text-slate-400 px-2 py-0.5 rounded font-mono">
                {item.category}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 col-span-2">No packing list generated yet.</p>
        )}
      </div>
    </div>
  );
}
