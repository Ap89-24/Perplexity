import { generateEmbedding, generateEmbeddingsBatch, cosineSimilarity } from "../config/vector.config.js";
import VectorEmbedding from "../models/vector.model.js";
import { tavily } from "@tavily/core";
import mongoose from "mongoose";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

/**
 * Pure JavaScript Recursive Text Splitter to eliminate package export issues
 */
export const splitTextIntoChunks = (text, chunkSize = 600, chunkOverlap = 120, separators = ["\n\n", "\n", ". ", " ", ""]) => {
  if (!text || typeof text !== "string") return [];

  let currentSep = separators[separators.length - 1];
  for (const sep of separators) {
    if (text.includes(sep)) {
      currentSep = sep;
      break;
    }
  }

  const parts = currentSep ? text.split(currentSep) : [text];
  const chunks = [];
  let currentChunk = "";

  for (const part of parts) {
    const candidate = currentChunk ? currentChunk + currentSep + part : part;
    if (candidate.length <= chunkSize) {
      currentChunk = candidate;
    } else {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      if (chunkOverlap > 0 && currentChunk.length > chunkOverlap) {
        const overlapSlice = currentChunk.slice(currentChunk.length - chunkOverlap);
        currentChunk = overlapSlice + currentSep + part;
      } else {
        currentChunk = part;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

/**
 * Perform vector search on MongoDB Atlas Vector Search, with fallback to in-memory cosine similarity
 */
export const searchMongoDBVector = async (queryVector, filter = {}, topK = 5) => {
  try {
    // Attempt MongoDB Atlas $vectorSearch pipeline
    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryVector,
          numCandidates: topK * 10,
          limit: topK,
          ...(Object.keys(filter).length > 0 && { filter }),
        },
      },
      {
        $project: {
          title: 1,
          url: 1,
          content: 1,
          sourceType: 1,
          metadata: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];

    const results = await VectorEmbedding.aggregate(pipeline);
    if (results && results.length > 0) {
      return results;
    }
  } catch (err) {
    console.warn("MongoDB Atlas $vectorSearch not available or failed. Falling back to vector similarity search:", err.message);
  }

  // Fallback: Cosine similarity over matching documents
  const mongoFilter = {};
  if (filter.user) {
    mongoFilter.user = new mongoose.Types.ObjectId(filter.user);
  }
  if (filter.sourceType) {
    mongoFilter.sourceType = filter.sourceType;
  }
  if (filter.document) {
    mongoFilter.document = new mongoose.Types.ObjectId(filter.document);
  }

  const candidates = await VectorEmbedding.find(mongoFilter).lean();
  if (!candidates || candidates.length === 0) return [];

  const scored = candidates.map((cand) => ({
    ...cand,
    score: cosineSimilarity(queryVector, cand.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
};

/**
 * Index document text chunks into MongoDB Vector collection
 */
export const indexDocumentChunks = async (userId, docId, title, fullText) => {
  const chunks = splitTextIntoChunks(fullText, 600, 120);

  if (chunks.length === 0) return 0;

  const embeddings = await generateEmbeddingsBatch(chunks);

  const vectorRecords = chunks.map((chunk, idx) => ({
    user: userId,
    document: docId,
    sourceType: "document",
    title,
    content: chunk,
    chunkIndex: idx,
    embedding: embeddings[idx],
  }));

  await VectorEmbedding.insertMany(vectorRecords);
  return chunks.length;
};

/**
 * Process Web RAG: Fetch Tavily web results, chunk content, score against query vector, pick top K
 */
export const processWebRAG = async (query, topK = 5) => {
  try {
    const searchResponse = await tvly.search(query, {
      maxResults: 5,
      searchDepth: "advanced",
    });

    if (!searchResponse.results || searchResponse.results.length === 0) {
      return [];
    }

    const allChunks = [];
    for (const res of searchResponse.results) {
      const pageText = `${res.title}\n${res.content || ""}`;
      const pageChunks = splitTextIntoChunks(pageText, 600, 120);
      for (const chunkText of pageChunks) {
        allChunks.push({
          title: res.title,
          url: res.url,
          content: chunkText,
          publishedDate: res.published_date || "",
        });
      }
    }

    if (allChunks.length === 0) return [];

    // Generate query embedding & chunk embeddings
    const queryVector = await generateEmbedding(query);
    const chunkTexts = allChunks.map((c) => c.content);
    const chunkVectors = await generateEmbeddingsBatch(chunkTexts);

    // Score chunks by similarity
    const scoredChunks = allChunks.map((chunk, idx) => ({
      ...chunk,
      score: cosineSimilarity(queryVector, chunkVectors[idx]),
      sourceType: "web",
    }));

    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks.slice(0, topK);
  } catch (error) {
    console.error("Error in Web RAG pipeline:", error);
    return [];
  }
};

/**
 * Process Document RAG: Query user uploaded documents stored in MongoDB Atlas Vector Search
 */
export const processDocumentRAG = async (query, userId, selectedDocIds = [], topK = 5) => {
  try {
    if (!userId) return [];

    const queryVector = await generateEmbedding(query);
    const filter = {
      user: userId.toString(),
      sourceType: "document",
    };

    if (selectedDocIds && selectedDocIds.length > 0) {
      filter.document = { $in: selectedDocIds.map((id) => id.toString()) };
    }

    const results = await searchMongoDBVector(queryVector, filter, topK);
    return results.map((r) => ({
      title: r.title || "Uploaded Document",
      url: "",
      content: r.content,
      sourceType: "document",
      score: r.score,
    }));
  } catch (error) {
    console.error("Error in Document RAG pipeline:", error);
    return [];
  }
};

/**
 * Get Hybrid Context: Merge Web RAG + Document RAG context into single grounded prompt & sources
 */
export const getHybridContext = async (query, userId = null, searchMode = "hybrid", selectedDocIds = []) => {
  let webPassages = [];
  let docPassages = [];

  if (searchMode === "hybrid" || searchMode === "web") {
    webPassages = await processWebRAG(query, 5);
  }

  if ((searchMode === "hybrid" || searchMode === "document") && userId) {
    docPassages = await processDocumentRAG(query, userId, selectedDocIds, 5);
  }

  const combined = [...webPassages, ...docPassages];

  // Assign citation IDs [1], [2], ...
  const sources = [];
  const contextLines = [];

  combined.forEach((item, index) => {
    const citationId = index + 1;
    sources.push({
      id: citationId,
      title: item.title,
      url: item.url || "",
      snippet: item.content.slice(0, 200) + "...",
      sourceType: item.sourceType,
    });

    contextLines.push(
      `[${citationId}] (${item.sourceType.toUpperCase()}) ${item.title}${item.url ? ` - ${item.url}` : ""}\nContent: ${item.content}`
    );
  });

  const contextText = contextLines.join("\n\n-----------------\n\n");

  return {
    contextText,
    sources,
  };
};
