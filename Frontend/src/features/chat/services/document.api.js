import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export const uploadDocumentApi = async ({ title, fileName, content, fileType }) => {
  try {
    const response = await api.post("/api/documents/upload", {
      title,
      fileName,
      content,
      fileType,
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

export const getDocumentsApi = async () => {
  try {
    const response = await api.get("/api/documents");
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

export const deleteDocumentApi = async (docId) => {
  try {
    const response = await api.delete(`/api/documents/${docId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};
