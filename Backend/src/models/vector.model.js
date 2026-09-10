import mongoose from "mongoose";

const vectorEmbeddingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: false,
    },
    sourceType: {
      type: String,
      enum: ["web", "document"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: true,
    },
    chunkIndex: {
      type: Number,
      default: 0,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for MongoDB Atlas Vector Search
// Atlas Vector Search Index defined on collection 'vectorembeddings':
// Name: 'vector_index'
// Path: 'embedding', Dimensions: 768, Similarity: 'cosine'
vectorEmbeddingSchema.index({ user: 1, sourceType: 1 });

export default mongoose.model("VectorEmbedding", vectorEmbeddingSchema);
