import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  getAllAdmins,
  deleteAdmin,
  verifyToken,
  getDashboardStats
} from '../controllers/adminController.js';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  deleteEventImage,
  toggleEventFeatured,
  updateEventStatus,
  getEventsStats,
  bulkUpdateEvents
} from '../controllers/eventController.js';
import {
  authenticateToken,
  requireSuperAdmin,
  requireAdmin
} from '../Middlewares/Auth.js';
import {
  createClient,
  getAllClients,
  updateClient,
  getClient,
  deleteClient,
  getClientStats,
  bulkUpdateStatus,
  exportClients
} from '../controllers/clientController.js';
import { validateClient } from '../Middlewares/clientValidation.js';

const AdminRouter = express.Router();

const s3Client = new S3Client({
  region: 'eu-north-1'
});

const isAllowedImage = (mimetype) =>
  ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'].includes(mimetype);

const eventUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: 'dd-event-images',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const fileName = file.originalname.toLowerCase().replace(/\s+/g, '-');
      cb(null, `events/${uniqueSuffix}-${fileName}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (isAllowedImage(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10
  }
});

AdminRouter.post('/login', loginAdmin);

AdminRouter.post(
  '/register',
  authenticateToken,
  requireSuperAdmin,
  registerAdmin
);

AdminRouter.get(
  '/verify',
  authenticateToken,
  verifyToken
);

AdminRouter.get(
  '/profile',
  authenticateToken,
  getAdminProfile
);

AdminRouter.put(
  '/profile',
  authenticateToken,
  updateAdminProfile
);

AdminRouter.put(
  '/change-password',
  authenticateToken,
  changePassword
);

AdminRouter.get(
  '/dashboard/stats',
  authenticateToken,
  requireAdmin,
  getDashboardStats
);

AdminRouter.get(
  '/all',
  authenticateToken,
  requireSuperAdmin,
  getAllAdmins
);

AdminRouter.delete(
  '/:id',
  authenticateToken,
  requireSuperAdmin,
  deleteAdmin
);

AdminRouter.get(
  '/events',
  authenticateToken,
  getAllEvents
);

AdminRouter.get(
  '/events/stats/overview',
  authenticateToken,
  getEventsStats
);

AdminRouter.get(
  '/events/:id',
  authenticateToken,
  getEventById
);

AdminRouter.post(
  '/events',
  authenticateToken,
  requireAdmin,
  eventUpload.array('images', 10),
  createEvent
);

AdminRouter.put(
  '/events/:id',
  authenticateToken,
  requireAdmin,
  eventUpload.array('images', 10),
  updateEvent
);

AdminRouter.delete(
  '/events/:id',
  authenticateToken,
  requireAdmin,
  deleteEvent
);

AdminRouter.delete(
  '/events/:id/images/:index',
  authenticateToken,
  requireAdmin,
  deleteEventImage
);

AdminRouter.patch(
  '/events/:id/featured',
  authenticateToken,
  requireAdmin,
  toggleEventFeatured
);

AdminRouter.patch(
  '/events/:id/status',
  authenticateToken,
  requireAdmin,
  updateEventStatus
);

AdminRouter.post(
  '/events/bulk-update',
  authenticateToken,
  requireAdmin,
  bulkUpdateEvents
);

// CLIENT ROUTES - REORDERED: Specific routes BEFORE parameterized routes

// 1. Get all clients
AdminRouter.get(
  '/clients',
  authenticateToken,
  getAllClients
);

// 2. Get client stats - MUST come before /clients/:id
AdminRouter.get(
  '/clients/stats',
  authenticateToken,
  getClientStats
);

// 3. Export clients - MUST come before /clients/:id
AdminRouter.get(
  '/clients/export',
  authenticateToken,
  requireAdmin,
  exportClients
);

// 4. Bulk operations - MUST come before /clients/:id
AdminRouter.put(
  '/clients/bulk/status',
  authenticateToken,
  requireAdmin,
  bulkUpdateStatus
);

AdminRouter.delete(
  '/clients/bulk',
  authenticateToken,
  requireAdmin,
  bulkUpdateStatus
);

// 5. Create new client
AdminRouter.post(
  '/clients',
  authenticateToken,
  requireAdmin,
  validateClient,
  createClient
);

// 6. Get single client by ID - MUST come after all specific routes
AdminRouter.get(
  '/clients/:id',
  authenticateToken,
  getClient
);

// 7. Update client
AdminRouter.put(
  '/clients/:id',
  authenticateToken,
  requireAdmin,
  validateClient,
  updateClient
);

// 8. Delete client
AdminRouter.delete(
  '/clients/:id',
  authenticateToken,
  requireAdmin,
  deleteClient
);

export default AdminRouter;