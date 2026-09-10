import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

let cachedModelName = null;

/**
 * Dynamically discover available embedding models for the user's Gemini API Key
 */
export const getAvailableEmbeddingModelName = async () => {
  if (cachedModelName) return cachedModelName;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    cachedModelName = "text-embedding-004";
    return cachedModelName;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (data.models && Array.isArray(data.models)) {
        const embedModel = data.models.find(
          (m) =>
            m.supportedGenerationMethods &&
            (m.supportedGenerationMethods.includes("embedContent") ||
              m.supportedGenerationMethods.includes("embedText"))
        );

        if (embedModel) {
          cachedModelName = embedModel.name.replace(/^models\//, "");
          console.log(`✅ Discovered & using Gemini Embedding Model: "${cachedModelName}"`);
          return cachedModelName;
        } else {
          console.warn("⚠️ No embedding model found in Google API list. Available models:", data.models.map((m) => m.name));
        }
      }
    } else {
      console.warn(`Failed to list Google models (Status ${res.status}). Defaulting to text-embedding-004.`);
    }
  } catch (err) {
    console.warn("Could not query Google models list:", err.message);
  }

  cachedModelName = "text-embedding-004";
  return cachedModelName;
};

/**
 * High-performance deterministic fallback embedding generator (768 dimensions)
 * Used if Gemini API key does not support embedContent
 */
export const generateFallbackEmbedding = (text, dim = 768) => {
  const vector = new Array(dim).fill(0);
  if (!text || typeof text !== "string") return vector;

  const words = text.toLowerCase().match(/\w+/g) || [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    const index = Math.abs(hash) % dim;
    vector[index] += 1;
  }

  // Normalize
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vector[i] * vector[i];
  }
  if (norm > 0) {
    norm = Math.sqrt(norm);
    for (let i = 0; i < dim; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
};

export const generateEmbedding = async (text) => {
  try {
    const modelName = await getAvailableEmbeddingModelName();
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName,
      apiKey: process.env.GEMINI_API_KEY,
    });
    const vector = await embeddings.embedQuery(text);
    return vector;
  } catch (error) {
    console.warn("Gemini embedding API call failed, using high-performance fallback embedding generator:", error.message);
    return generateFallbackEmbedding(text, 768);
  }
};

export const generateEmbeddingsBatch = async (texts) => {
  try {
    const modelName = await getAvailableEmbeddingModelName();
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName,
      apiKey: process.env.GEMINI_API_KEY,
    });
    const vectors = await embeddings.embedDocuments(texts);
    return vectors;
  } catch (error) {
    console.warn("Gemini batch embedding API call failed, using fallback embeddings:", error.message);
    return texts.map((t) => generateFallbackEmbedding(t, 768));
  }
};

export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
