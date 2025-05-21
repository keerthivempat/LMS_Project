import { Router } from 'express';
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
    getSectionById,
    createSection,
    updateSection,
    deleteSection,
    // getSectionResources,
    addResource,
    addPdfResource,
    // deleteResource,
    getSectionComments,
    addSectionComment,
    likeComment,
    addCommentReply,
    likeReply,
    // deleteComment
    deleteContent
} from '../controllers/section.controller.js';
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Protected Routes (Require Authentication)
router.use(verifyAccessToken);
// router.get('/section/:sectionId/resources', getSectionResources);

// Section routes
router.get('/section/:sectionId', getSectionById);

// Comment routes
router.get('/section/:sectionId/comments', getSectionComments);
router.post('/section/:sectionId/comments', addSectionComment);
router.put('/section/:sectionId/comments/:commentId/like', likeComment);
// new routes for replies
router.post('/section/:sectionId/comments/:commentId/reply', addCommentReply);
router.put('/section/:sectionId/comments/:commentId/replies/:replyId/like', likeReply);
// router.delete('/section/:sectionId/comments/:commentId', deleteComment);

router.post("/createSection", createSection);
router.patch("/updateSection/:sectionId", updateSection);
router.delete("/deleteSection/:sectionId", deleteSection);
router.post('/section/:sectionId/resources', upload.none(), addResource);
router.post('/section/:sectionId/pdf', upload.single('file'), addPdfResource);
router.post('/section/:sectionId/delete-content', deleteContent);


export default router;
