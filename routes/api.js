const express = require('express');
const router = express.Router();
const Media = require('../uploads/media');

const authController = require('../controllers/authController');
const propertyController = require('../controllers/propertyController'); 
const bookingController = require('../controllers/bookingController');
const roomController = require('../controllers/roomController');
const reviewController = require('../controllers/reviewController');


router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authController.getProfile); 
router.put('/auth/update', authController.updateProfile);
router.get('/all', propertyController.getProperties);
router.post('/add', Media.upload.single('image'), propertyController.addProperty);
router.get('/properties/:id', propertyController.getPropertyDetails);
router.put('/properties/:id', Media.upload.single('image'), propertyController.updateProperty);
router.delete('/properties/:id', propertyController.deleteProperty);
router.post('/rooms/add', Media.upload.array('images', 10), roomController.addRoom);
router.put('/rooms/:id', Media.upload.array('images', 10), roomController.updateRoom);
router.delete('/rooms/:id', roomController.deleteRoom);
router.post('/process', bookingController.processBooking);
router.get('/admin-all', bookingController.getAdminData);
router.get('/user-bookings/:userId', bookingController.getUserBookings);
router.delete('/bookings/:id', bookingController.deleteBooking);
router.get('/room-bookings/:roomId', bookingController.getRoomBookings);
router.post('/reviews/add', reviewController.addReview);
router.get('/reviews/stats/:propertyId', reviewController.getPropertyStats);
router.get('/reviews/:propertyId', reviewController.getReviewsByProperty);
router.get('/admin/notifications', reviewController.getAdminNotifications);
router.get('/notifications/admin', reviewController.getAdminNotifications);
router.put('/notifications/:id/read', reviewController.deleteNotification);


module.exports = router;