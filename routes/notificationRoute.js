import express from 'express';
import { registerToken, removeToken } from '../controller/notificationController.js';
import { auth } from '../middleware/auth.js';

const notificationRouter = express.Router();

notificationRouter.post('/api/notifications/register-token', auth, registerToken);
notificationRouter.delete('/api/notifications/remove-token', auth, removeToken);

export default notificationRouter;
