import { Router } from "express";
import authUser from "../middleware/auth.middleware.js";
import { uploadDocument, getDocuments, deleteDocument } from "../controllers/document.controller.js";

const documentRouter = Router();

documentRouter.post("/upload", authUser, uploadDocument);
documentRouter.get("/", authUser, getDocuments);
documentRouter.delete("/:docId", authUser, deleteDocument);

export default documentRouter;
