'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import type { Trip } from '@/types';
import CreateTripForm from '@/components/CreateTripForm';
import ItineraryCard from '@/components/ItineraryCard';
import PackingList from '@/components/PackingList';

export default function Dashboard() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchUserTrips = useCallback(async () => {
    try {
      const data = await api.trips.getAll();
      setTrips(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch trips', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUserTrips().then((data) => {
      if (data.length > 0) {
        setSelectedTrip((current) => current ?? data[0]);
      }
    });
  }, [router, fetchUserTrips]);

  const handleTripCreated = (trip: Trip) => {
    setTrips((prev) => [trip, ...prev]);
    setSelectedTrip(trip);
    setShowCreateForm(false);
  };

  const handleTripUpdated = (trip: Trip) => {
    setTrips((prev) => prev.map((t) => (t._id === trip._id ? trip : t)));
    setSelectedTrip(trip);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Delete this trip permanently?')) return;
    try {
      await api.trips.delete(tripId);
      const remaining = trips.filter((t) => t._id !== tripId);
      setTrips(remaining);
      setSelectedTrip(remaining.length > 0 ? remaining[0] : null);
    } catch (err) {
      console.error('Failed to delete trip', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
        <p className="text-xl animate-pulse">Loading secure user vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="max-w-7xl mx-auto flex justify-between items-center border-b border-slate-800 pb-5 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
            AI Travel Dashboard
          </h1>
          <p className="text-sm text-slate-400">User Data Enclave Connected</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-indigo-600 hover:bg-indigo-500 transition text-white px-4 py-2 rounded-lg text-sm"
          >
            {showCreateForm ? 'Cancel' : '+ New Trip'}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/login');
            }}
            className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-lg text-sm"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          {showCreateForm && <CreateTripForm onTripCreated={handleTripCreated} />}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Your Active Trips</h2>
            {trips.length === 0 ? (
              <p className="text-slate-500">No itineraries found. Create one to begin!</p>
            ) : (
              <div className="space-y-3">
                {trips.map((trip) => (
                  <div key={trip._id} className="relative group">
                    <button
                      onClick={() => setSelectedTrip(trip)}
                      className={`w-full text-left p-4 rounded-xl transition ${
                        selectedTrip?._id === trip._id
                          ? 'bg-blue-600 border border-blue-500 text-white'
                          : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <p className="font-bold">{trip.destination}</p>
                      <p className="text-xs opacity-80">
                        {trip.durationDays} Days &bull; {trip.budgetTier} Budget
                      </p>
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip._id)}
                      className="absolute top-2 right-2 text-xs text-red-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedTrip && (
            <>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Financial Cost Ledger</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Transport:</span>
                    <span className="font-semibold">${selectedTrip.estimatedBudget.transport}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Lodging:</span>
                    <span className="font-semibold">
                      ${selectedTrip.estimatedBudget.accommodation}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Food:</span>
                    <span className="font-semibold">${selectedTrip.estimatedBudget.food}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Activities:</span>
                    <span className="font-semibold">${selectedTrip.estimatedBudget.activities}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-slate-800 pt-3 text-white font-bold">
                    <span>Grand Total:</span>
                    <span>${selectedTrip.estimatedBudget.total}</span>
                  </div>
                </div>
              </div>

              {selectedTrip.hotels && selectedTrip.hotels.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4">Recommended Hotels</h2>
                  <div className="space-y-3">
                    {selectedTrip.hotels.map((hotel, i) => (
                      <div key={i} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <p className="font-semibold text-sm">{hotel.name}</p>
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>{hotel.tier}</span>
                          <span>${hotel.estimatedCostNightUSD}/night</span>
                          <span>{hotel.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedTrip ? (
            <>
              <ItineraryCard trip={selectedTrip} onTripUpdated={handleTripUpdated} />
              <PackingList trip={selectedTrip} onTripUpdated={handleTripUpdated} />
            </>
          ) : (
            <div className="flex flex-col justify-center items-center h-96 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-6xl mb-4">✈️</span>
              <p className="text-slate-400">
                Select an existing itinerary or create a new trip to begin exploring.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
