export default function DocumentList({
  documents,
  setDocuments,
}) {
  const handleDelete = (indexToDelete) => {
    const updatedDocuments = documents.filter(
      (_, index) => index !== indexToDelete
    );

    setDocuments(updatedDocuments);
  };

  if (documents.length === 0) {
    return (
      <p style={{ marginTop: "20px" }}>
        No documents uploaded yet
      </p>
    );
  }

  return (
    <div style={{ marginTop: "20px" }}>
      {documents.map((doc, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #444",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <strong>{doc.name}</strong>

          <p>{doc.status}</p>

          <button
            onClick={() => handleDelete(index)}
            style={{
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
