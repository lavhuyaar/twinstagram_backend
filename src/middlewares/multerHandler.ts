import multer from 'multer';

const upload = multer();

const multerHandler = upload.single('image');

export default multerHandler;
