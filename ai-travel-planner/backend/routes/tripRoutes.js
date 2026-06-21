const express = require('express');
const auth = require('../middleware/auth');
const {
  generateNewTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  addActivity,
  removeActivity,
  regenerateDay,
  regeneratePackingList,
} = require('../controllers/tripController');

const router = express.Router();

router.use(auth);

router.post('/generate', generateNewTrip);
router.get('/', getTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/activities', addActivity);
router.delete('/:id/activities', removeActivity);
router.post('/:id/regenerate-day', regenerateDay);
router.post('/:id/regenerate-packing', regeneratePackingList);

module.exports = router;
