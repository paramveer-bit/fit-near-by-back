import multer from "multer";

//cb is callback function
const storage = multer.memoryStorage()

export const upload = multer({ storage: storage }).single('image')

