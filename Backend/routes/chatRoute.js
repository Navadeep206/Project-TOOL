import express from 'express';
import { getMessages, getChatList } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/list', getChatList);
router.get('/:otherUserId', getMessages);

export default router;
