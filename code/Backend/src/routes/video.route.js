import { Router } from 'express';
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
    getVideoById,
    addVideo,
    updateVideo,
    deleteVideo,
    getVideoDetails
} from '../controllers/video.controller.js';

const router = Router();

// Protected Routes (Require Authentication)
router.use(verifyAccessToken);
router.get('/video/:videoId', getVideoById);

router.post("/", addVideo);
router.get("/:videoId", getVideoDetails);
router.patch("/:videoId", updateVideo);
router.delete("/:videoId", deleteVideo);

export default router;
