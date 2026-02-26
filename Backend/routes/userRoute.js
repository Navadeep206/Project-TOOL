import { createUser, loginUser, deleteUser, getUsers } from '../controllers/userController.js';
import express from 'express';
import { auditAction, auditAuthError } from '../middleware/auditMiddleware.js';

const userRoute = express.Router();

// Apply auth error auditing to all user routes to catch failed logins
userRoute.use(auditAuthError);

userRoute.get('/', getUsers);
userRoute.post('/', auditAction('USER_REGISTRATION', 'user'), createUser);
userRoute.post('/login', loginUser);
userRoute.post('/register', auditAction('USER_REGISTRATION', 'user'), createUser);
userRoute.delete('/:id', auditAction('DELETE_USER', 'user'), deleteUser);

export default userRoute;
