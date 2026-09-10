import Document from "../models/document.model.js";
import VectorEmbedding from "../models/vector.model.js";
import { indexDocumentChunks } from "../services/rag.service.js";

export const uploadDocument = async (req, res) => {
  try {
    const { title, fileName, content, fileType } = req.body;

    if (!fileName || !content) {
      return res.status(400).json({
        success: false,
        message: "fileName and text content are required.",
      });
    }

    const docTitle = title || fileName;

    // Create document record
    const document = await Document.create({
      user: req.user.id,
      title: docTitle,
      fileName,
      fileType: fileType || "text/plain",
      fileSize: Buffer.byteLength(content, "utf8"),
      status: "processing",
    });

    // Chunk and index vector embeddings in MongoDB
    const chunkCount = await indexDocumentChunks(
      req.user.id,
      document._id,
      docTitle,
      content
    );

    document.chunkCount = chunkCount;
    document.status = "indexed";
    await document.save();

    return res.status(201).json({
      success: true,
      message: "Document uploaded and indexed successfully into vector store.",
      document,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload and index document.",
      error: error.message,
    });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents.",
    });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    const document = await Document.findOneAndDelete({
      _id: docId,
      user: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    // Delete associated vector embeddings
    await VectorEmbedding.deleteMany({
      document: docId,
      user: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Document and vector embeddings deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete document.",
    });
  }
};
