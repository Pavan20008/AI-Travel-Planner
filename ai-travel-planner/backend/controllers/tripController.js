const Trip = require('../models/Trip');
const { callGeminiJson } = require('../services/geminiService');
const {
  generateFallbackTrip,
  generateFallbackDay,
  generateFallbackPackingList,
} = require('../services/fallbackTrip');

const TRIP_JSON_SCHEMA = `
{
  "itinerary": [
    {
      "dayNumber": 1,
      "activities": [
        { "title": "Activity name", "description": "Brief text details", "estimatedCostUSD": 20, "timeOfDay": "Morning" }
      ]
    }
  ],
  "hotels": [
    { "name": "Recommended Hotel", "tier": "Budget", "estimatedCostNightUSD": 85, "rating": "4.5/5" }
  ],
  "estimatedBudget": {
    "transport": 120,
    "accommodation": 300,
    "food": 150,
    "activities": 100,
    "total": 670
  },
  "packingList": [
    { "item": "Passport", "category": "Documents", "isPacked": false }
  ]
}`;

exports.generateNewTrip = async (req, res) => {
  const { destination, durationDays, budgetTier, interests } = req.body;
  const userId = req.user.id;

  if (!destination || !durationDays || !budgetTier) {
    return res.status(400).json({ message: 'destination, durationDays, and budgetTier are required' });
  }

  const interestsList = Array.isArray(interests) ? interests : interests ? [interests] : [];

  const prompt = `
Create a detailed travel plan for a ${durationDays}-day trip to ${destination}.
Budget preference is ${budgetTier}. Interests are: ${interestsList.join(', ') || 'general sightseeing'}.

You must output ONLY a valid JSON object matching this structure:
${TRIP_JSON_SCHEMA}

Requirements:
- Create exactly ${durationDays} days in the itinerary, each with 2-4 activities.
- Make sure cost estimates match typical realistic local rates for the specified budgetTier.
- Include 2-3 hotel recommendations matching the budget tier.
- Generate a weather-aware packing list with items in categories: Documents, Clothing, Gear, Other.
- Consider the destination climate and planned activities for packing suggestions.
- Include activity-specific gear (e.g., hiking boots if hiking is planned).
`;

  try {
    const cleanResult = await callGeminiJson(prompt, () =>
      generateFallbackTrip(destination, durationDays, budgetTier, interestsList)
    );

    const newTrip = new Trip({
      userId,
      destination,
      durationDays,
      budgetTier,
      interests: interestsList,
      itinerary: cleanResult.itinerary,
      hotels: cleanResult.hotels,
      estimatedBudget: cleanResult.estimatedBudget,
      packingList: cleanResult.packingList,
    });

    const savedTrip = await newTrip.save();
    return res.status(201).json(savedTrip);
  } catch (error) {
    console.error('Trip generation error:', error);
    return res.status(500).json({
      message: 'Failed to generate trip. Please try again.',
    });
  }
};

exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ message: 'Failed to fetch trips' });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ message: 'Failed to fetch trip' });
  }
};

exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const allowedFields = ['itinerary', 'packingList', 'hotels', 'estimatedBudget', 'interests'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        trip[field] = req.body[field];
      }
    });

    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ message: 'Failed to update trip' });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ message: 'Failed to delete trip' });
  }
};

exports.addActivity = async (req, res) => {
  try {
    const { dayNumber, activity } = req.body;
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const day = trip.itinerary.find((d) => d.dayNumber === dayNumber);
    if (!day) {
      return res.status(404).json({ message: 'Day not found in itinerary' });
    }

    day.activities.push({
      title: activity.title,
      description: activity.description || 'Added by traveler',
      estimatedCostUSD: activity.estimatedCostUSD || 0,
      timeOfDay: activity.timeOfDay || 'Afternoon',
    });

    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ message: 'Failed to add activity' });
  }
};

exports.removeActivity = async (req, res) => {
  try {
    const { dayNumber, activityIndex } = req.body;
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const day = trip.itinerary.find((d) => d.dayNumber === dayNumber);
    if (!day) {
      return res.status(404).json({ message: 'Day not found in itinerary' });
    }

    if (activityIndex < 0 || activityIndex >= day.activities.length) {
      return res.status(400).json({ message: 'Invalid activity index' });
    }

    day.activities.splice(activityIndex, 1);
    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error) {
    console.error('Remove activity error:', error);
    res.status(500).json({ message: 'Failed to remove activity' });
  }
};

exports.regenerateDay = async (req, res) => {
  try {
    const { dayNumber, feedback } = req.body;
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const existingDay = trip.itinerary.find((d) => d.dayNumber === dayNumber);
    if (!existingDay) {
      return res.status(404).json({ message: 'Day not found in itinerary' });
    }

    const prompt = `
Regenerate Day ${dayNumber} of a ${trip.durationDays}-day trip to ${trip.destination}.
Budget tier: ${trip.budgetTier}. Interests: ${trip.interests.join(', ')}.
User feedback: ${feedback || 'Provide fresh alternative activities for this day.'}

Current Day ${dayNumber} activities:
${JSON.stringify(existingDay.activities, null, 2)}

Output ONLY a valid JSON object with this structure:
{
  "dayNumber": ${dayNumber},
  "activities": [
    { "title": "Activity name", "description": "Brief details", "estimatedCostUSD": 20, "timeOfDay": "Morning" }
  ]
}

Include 2-4 activities with realistic costs for ${trip.budgetTier} budget.
`;

    const cleanResult = await callGeminiJson(prompt, () =>
      generateFallbackDay(dayNumber, trip.destination, trip.budgetTier, feedback)
    );

    const dayIndex = trip.itinerary.findIndex((d) => d.dayNumber === dayNumber);
    trip.itinerary[dayIndex] = {
      dayNumber: cleanResult.dayNumber,
      activities: cleanResult.activities,
    };

    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error) {
    console.error('Regenerate day error:', error);
    res.status(500).json({ message: 'Failed to regenerate day. Please try again.' });
  }
};

exports.regeneratePackingList = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const activitySummary = trip.itinerary
      .map((day) => `Day ${day.dayNumber}: ${day.activities.map((a) => a.title).join(', ')}`)
      .join('\n');

    const prompt = `
You are a travel packing specialist. Generate a weather-aware packing checklist for:
Destination: ${trip.destination}
Duration: ${trip.durationDays} days
Budget tier: ${trip.budgetTier}

Planned activities:
${activitySummary}

Output ONLY a valid JSON object:
{
  "packingList": [
    { "item": "Passport", "category": "Documents", "isPacked": false },
    { "item": "Rain jacket", "category": "Clothing", "isPacked": false }
  ]
}

Categories must be one of: Documents, Clothing, Gear, Other.
Include crucial travel documents, climate-appropriate clothing, and activity-specific equipment.
Generate 12-20 items total.
`;

    const cleanResult = await callGeminiJson(prompt, () =>
      generateFallbackPackingList(trip.destination)
    );
    trip.packingList = cleanResult.packingList;

    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error) {
    console.error('Regenerate packing list error:', error);
    res.status(500).json({ message: 'Failed to regenerate packing list' });
  }
};
