const express = require('express');
const {
    // Site
    getSites,
    getSiteById,
    createSite,
    updateSite,
    deleteSite,
    // Staff
    getSiteStaff,
    addSiteStaff,
    updateSiteStaff,
    removeSiteStaff,
    // Vehicles
    getSiteVehicles,
    addSiteVehicle,
    updateSiteVehicle,
    removeSiteVehicle,
    // Machines
    getSiteMachines,
    addSiteMachine,
    updateSiteMachine,
    removeSiteMachine,
} = require('../controllers/siteController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Site routes with role-based permissions
router.route('/')
    .get(protect, getSites)  // All authenticated users can view
    .post(protect, authorize('ADMIN', 'SUPERVISOR'), createSite);  // Only Admin & Supervisor can add

router.route('/:id')
    .get(protect, getSiteById)  // All authenticated users can view
    .put(protect, authorize('ADMIN'), updateSite)  // Only Admin can edit
    .delete(protect, authorize('ADMIN'), deleteSite);  // Only Admin can delete

// Staff routes
router.route('/:siteId/staff')
    .get(protect, getSiteStaff)  // All authenticated users can view
    .post(protect, authorize('ADMIN', 'SUPERVISOR'), addSiteStaff);  // Only Admin & Supervisor can add

router.route('/staff/:id')
    .put(protect, authorize('ADMIN'), updateSiteStaff)  // Only Admin can edit
    .delete(protect, authorize('ADMIN'), removeSiteStaff);  // Only Admin can delete

// Vehicle routes
router.route('/:siteId/vehicles')
    .get(protect, getSiteVehicles)  // All authenticated users can view
    .post(protect, authorize('ADMIN', 'SUPERVISOR'), addSiteVehicle);  // Only Admin & Supervisor can add

router.route('/vehicles/:id')
    .put(protect, authorize('ADMIN'), updateSiteVehicle)  // Only Admin can edit
    .delete(protect, authorize('ADMIN'), removeSiteVehicle);  // Only Admin can delete

// Machine routes
router.route('/:siteId/machines')
    .get(protect, getSiteMachines)  // All authenticated users can view
    .post(protect, authorize('ADMIN', 'SUPERVISOR'), addSiteMachine);  // Only Admin & Supervisor can add

router.route('/machines/:id')
    .put(protect, authorize('ADMIN'), updateSiteMachine)  // Only Admin can edit
    .delete(protect, authorize('ADMIN'), removeSiteMachine);  // Only Admin can delete

module.exports = router;
