export default function FileUploader({
  documents,
  setDocuments,
}) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const newDocument = {
      name: file.name,
      status: "Ready",
    };

    setDocuments([
      ...documents,
      newDocument,
    ]);
  };

  return (
    <div
      style={{
        border: "2px dashed #555",
        padding: "40px",
        textAlign: "center",
        borderRadius: "10px",
      }}
    >
      <p>Chọn file PDF hoặc DOCX</p>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
      />
    </div>
  );
}