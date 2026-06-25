import { useState } from "react";

import FileUploader from "../components/documents/FileUploader";
import DocumentList from "../components/documents/DocumentList";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);

  return (
    <div>
      <h1>Documents Manager</h1>

  <p
  style={{
    color: "#666",
    marginBottom: "20px",
  }}
>
  Total documents: {documents.length}
</p>

      <FileUploader
        documents={documents}
        setDocuments={setDocuments}
      />

      <DocumentList
  documents={documents}
  setDocuments={setDocuments}
/>
    </div>
  );
}