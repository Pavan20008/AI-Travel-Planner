function budgetMultiplier(tier) {
  if (tier === 'Low') return 0.6;
  if (tier === 'High') return 1.8;
  return 1;
}

function generateFallbackTrip(destination, durationDays, budgetTier, interests) {
  const mult = budgetMultiplier(budgetTier);
  const primaryInterest = interests[0] || 'sightseeing';

  const itinerary = [];
  for (let day = 1; day <= durationDays; day++) {
    itinerary.push({
      dayNumber: day,
      activities: [
        {
          title: `Explore ${destination} highlights`,
          description: `Day ${day}: Morning visit to iconic landmarks and neighborhoods.`,
          estimatedCostUSD: Math.round(25 * mult),
          timeOfDay: 'Morning',
        },
        {
          title: `${primaryInterest} experience`,
          description: `Afternoon activity tailored to your interests in ${destination}.`,
          estimatedCostUSD: Math.round(35 * mult),
          timeOfDay: 'Afternoon',
        },
        {
          title: 'Local dining experience',
          description: 'Evening meal at a recommended local restaurant.',
          estimatedCostUSD: Math.round(40 * mult),
          timeOfDay: 'Evening',
        },
      ],
    });
  }

  const transport = Math.round(120 * mult);
  const accommodation = Math.round(80 * mult * durationDays);
  const food = Math.round(50 * mult * durationDays);
  const activities = Math.round(30 * mult * durationDays * 2);

  return {
    itinerary,
    hotels: [
      {
        name: `${destination} Central Hotel`,
        tier: budgetTier,
        estimatedCostNightUSD: Math.round(80 * mult),
        rating: '4.2/5',
      },
      {
        name: `${destination} Boutique Stay`,
        tier: budgetTier,
        estimatedCostNightUSD: Math.round(65 * mult),
        rating: '4.0/5',
      },
    ],
    estimatedBudget: {
      transport,
      accommodation,
      food,
      activities,
      total: transport + accommodation + food + activities,
    },
    packingList: buildPackingList(destination),
  };
}

function buildPackingList(destination) {
  return [
    { item: 'Passport / ID', category: 'Documents', isPacked: false },
    { item: 'Travel insurance documents', category: 'Documents', isPacked: false },
    { item: 'Flight / hotel confirmations', category: 'Documents', isPacked: false },
    { item: 'Comfortable walking shoes', category: 'Clothing', isPacked: false },
    { item: 'Weather-appropriate jacket', category: 'Clothing', isPacked: false },
    { item: 'Casual day outfits', category: 'Clothing', isPacked: false },
    { item: `Light layers for ${destination}`, category: 'Clothing', isPacked: false },
    { item: 'Day backpack', category: 'Gear', isPacked: false },
    { item: 'Phone charger & power adapter', category: 'Gear', isPacked: false },
    { item: 'Portable power bank', category: 'Gear', isPacked: false },
    { item: 'Sunscreen & toiletries', category: 'Other', isPacked: false },
    { item: 'Medications', category: 'Other', isPacked: false },
    { item: 'Reusable water bottle', category: 'Gear', isPacked: false },
  ];
}

function generateFallbackDay(dayNumber, destination, budgetTier, feedback) {
  const mult = budgetMultiplier(budgetTier);
  const note = feedback || 'Alternative activities for this day';

  return {
    dayNumber,
    activities: [
      {
        title: `Outdoor exploration in ${destination}`,
        description: `${note} — Morning parks, trails, or waterfront walk.`,
        estimatedCostUSD: Math.round(20 * mult),
        timeOfDay: 'Morning',
      },
      {
        title: 'Cultural site visit',
        description: 'Afternoon museum, temple, or historic district tour.',
        estimatedCostUSD: Math.round(30 * mult),
        timeOfDay: 'Afternoon',
      },
      {
        title: 'Evening local experience',
        description: 'Night market, live music, or scenic sunset viewpoint.',
        estimatedCostUSD: Math.round(35 * mult),
        timeOfDay: 'Evening',
      },
    ],
  };
}

function generateFallbackPackingList(destination) {
  return { packingList: buildPackingList(destination) };
}

module.exports = {
  generateFallbackTrip,
  generateFallbackDay,
  generateFallbackPackingList,
};
