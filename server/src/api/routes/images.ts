import { Router } from 'express';
// import { uploadImage } from '#controllers/images/upload-image.ts';
import { getImage } from '#controllers/images/get-image.ts';
// import { deleteImage } from '#controllers/images/delete-image.ts';
// import { upload } from '#config/multer.ts';

const router = Router();

router.get('/:image', getImage);

// only to be used for testing
// router.delete("/:image", deleteImage);

// only to be used for testing
// router.post("/", upload.single('image'), uploadImage);

export default router;
