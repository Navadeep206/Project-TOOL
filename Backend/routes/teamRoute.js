import express from 'express';
import { getTeams, createTeam, updateTeam } from '../controllers/teamController.js';

const router = express.Router();

router.get('/', getTeams);
router.post('/', createTeam);
router.put('/:id', updateTeam);

export default router;
