import { createUser, loginUser, deleteUser } from '../controllers/userController.js';
import express from 'express';
const userRoute = express.Router();
userRoute.post('/login', loginUser);
userRoute.post('/register', createUser);
userRoute.delete('/:id', deleteUser);
export default userRoute;
