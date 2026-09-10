import React, { useEffect, useState } from 'react';
import { uploadDocumentApi, getDocumentsApi, deleteDocumentApi } from '../services/document.api.js';

/**
 * Extract plain text from PDF ArrayBuffer in browser without external dependencies
 */
export const extractTextFromPdfArrayBuffer = (arrayBuffer) => {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    let str = "";
    // Read bytes into string
    for (let i = 0; i < bytes.length; i++) {
      str += String.fromCharCode(bytes[i]);
    }

    const textBlocks = [];
    // Match text blocks enclosed in BT ... ET
    const btRegex = /BT[\s\S]*?ET/g;
    let match;

    while ((match = btRegex.exec(str)) !== null) {
      const block = match[0];
      
      // Match (text) Tj or (text) TJ
      const tjRegex = /\(([\s\S]*?)\)\s*T[jJ]/g;
      let textMatch;
      while ((textMatch = tjRegex.exec(block)) !== null) {
        let extracted = textMatch[1]
          .replace(/\\\( /g, "(")
          .replace(/\\\)/g, ")")
          .replace(/\\r/g, "\n")
          .replace(/\\n/g, "\n");
        if (extracted.trim()) {
          textBlocks.push(extracted.trim());
        }
      }

      // Match [(text1) (text2)] TJ
      const tjArrayRegex = /\[([\s\S]*?)\]\s*TJ/g;
      let arrayMatch;
      while ((arrayMatch = tjArrayRegex.exec(block)) !== null) {
        const innerArray = arrayMatch[1];
        const innerTextRegex = /\(([\s\S]*?)\)/g;
        let innerMatch;
        let line = "";
        while ((innerMatch = innerTextRegex.exec(innerArray)) !== null) {
          line += innerMatch[1];
        }
        if (line.trim()) {
          textBlocks.push(line.trim());
        }
      }
    }

    if (textBlocks.length > 0) {
      return textBlocks.join(" ");
    }

    // Fallback: extract readable ascii words from string if BT/ET structure wasn't found
    const simpleRegex = /\(([A-Za-z0-9\s.,!?'"\-]{3,})\)/g;
    const fallbackBlocks = [];
    let simpleMatch;
    while ((simpleMatch = simpleRegex.exec(str)) !== null) {
      fallbackBlocks.push(simpleMatch[1]);
    }

    return fallbackBlocks.join(" ");
  } catch (err) {
    console.error("PDF text extraction error:", err);
    return "";
  }
};

const DocumentUploadModal = ({ isOpen, onClose, selectedDocIds, setSelectedDocIds }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [textInputTitle, setTextInputTitle] = useState('');
  const [textInputContent, setTextInputContent] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'list'

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await getDocumentsApi();
      if (data && data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);

    try {
      let textContent = "";

      if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        textContent = extractTextFromPdfArrayBuffer(arrayBuffer);
        if (!textContent || textContent.trim().length < 5) {
          alert("Could not extract text from this PDF (it might be a scanned image PDF). Please copy-paste the text directly below or upload a TXT/MD document.");
          setUploading(false);
          return;
        }
      } else {
        textContent = await file.text();
      }

      if (!textContent || !textContent.trim()) {
        alert("The selected file contains no readable text.");
        setUploading(false);
        return;
      }

      const data = await uploadDocumentApi({
        title: file.name,
        fileName: file.name,
        content: textContent,
        fileType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'text/plain'),
      });

      if (data && data.document) {
        setDocuments((prev) => [data.document, ...prev]);
        setSelectedDocIds((prev) => [...prev, data.document._id]);
        setActiveTab('list');
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Failed to process file. Ensure it contains readable text.");
    } finally {
      setUploading(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInputContent.trim()) return;

    setUploading(true);
    try {
      const title = textInputTitle.trim() || `Document ${new Date().toLocaleDateString()}`;
      const data = await uploadDocumentApi({
        title,
        fileName: `${title}.txt`,
        content: textInputContent,
        fileType: 'text/plain',
      });

      if (data && data.document) {
        setDocuments((prev) => [data.document, ...prev]);
        setSelectedDocIds((prev) => [...prev, data.document._id]);
        setTextInputTitle('');
        setTextInputContent('');
        setActiveTab('list');
      }
    } catch (err) {
      alert("Failed to index text document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId, e) => {
    e.stopPropagation();
    try {
      await deleteDocumentApi(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      setSelectedDocIds((prev) => prev.filter((id) => id !== docId));
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  const toggleSelectDoc = (docId) => {
    if (selectedDocIds.includes(docId)) {
      setSelectedDocIds(selectedDocIds.filter((id) => id !== docId));
    } else {
      setSelectedDocIds([...selectedDocIds, docId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#16171a] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              📚
            </span>
            <div>
              <h3 className="text-base font-semibold text-white">Knowledge Base RAG Documents</h3>
              <p className="text-xs text-gray-400">Index PDF, TXT, and Markdown files into MongoDB Vector Search</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'upload' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            ➕ Add Document
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'list' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            📁 Indexed Documents ({documents.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              {/* File Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
                  dragActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-white/15 bg-white/5 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-2xl text-emerald-400">
                  📄
                </div>
                <p className="mt-2 text-xs font-medium text-gray-200">
                  {uploading ? "Extracting Text & Generating Vector Embeddings..." : "Drag & drop PDF, TXT, or MD file here"}
                </p>
                <p className="mt-1 text-[11px] text-gray-400">Supports PDF, TXT, MD, Code, CSV files</p>
                <input
                  type="file"
                  accept=".pdf,.txt,.md,.json,.js,.py,.csv,.doc"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  className="hidden"
                  id="rag-file-input"
                  disabled={uploading}
                />
                <label
                  htmlFor="rag-file-input"
                  className="mt-3 cursor-pointer rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400 transition-colors"
                >
                  Browse PDF / File
                </label>
              </div>

              {/* Text Area Upload Option */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#16171a] px-2 text-gray-400 text-[10px]">Or Paste Text Directly</span>
                </div>
              </div>

              <form onSubmit={handleTextSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Document Title (optional)"
                  value={textInputTitle}
                  onChange={(e) => setTextInputTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                />
                <textarea
                  rows={4}
                  placeholder="Paste document or knowledge base text content here..."
                  value={textInputContent}
                  onChange={(e) => setTextInputContent(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={uploading || !textInputContent.trim()}
                  className="w-full rounded-xl bg-emerald-500 py-2 text-xs font-semibold text-black hover:bg-emerald-400 transition-colors disabled:opacity-50"
                >
                  {uploading ? "Indexing into MongoDB Vector Search..." : "Index Text into Vector Database"}
                </button>
              </form>
            </div>
          ) : (
            /* List Tab */
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <p className="text-center py-6 text-xs text-gray-400">Loading indexed documents...</p>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">
                  <p>No indexed documents found.</p>
                  <p className="mt-1 text-[11px]">Upload a PDF or TXT file to enable Document Vector RAG.</p>
                </div>
              ) : (
                documents.map((doc) => {
                  const isSelected = selectedDocIds.includes(doc._id);
                  return (
                    <div
                      key={doc._id}
                      onClick={() => toggleSelectDoc(doc._id)}
                      className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500/60 bg-emerald-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-gray-600 text-emerald-500 focus:ring-0"
                        />
                        <div className="overflow-hidden">
                          <h4 className="truncate text-xs font-semibold text-white">{doc.title}</h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {doc.chunkCount} vector chunks indexed • {(doc.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteDoc(doc._id, e)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete Document"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-2 text-xs font-medium text-white hover:bg-white/20 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
