import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult("");

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  // Upload file to backend
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data.result || "No result returned");
    } catch (error) {
      console.error("Error:", error);
      setResult("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  // Reset for new signature
  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult("");
  };

  // Determine result color
  const getResultColor = () => {
    if (result.toLowerCase().includes("genuine")) return "#4caf50"; // green
    if (result.toLowerCase().includes("forged")) return "#f44336"; // red
    return "#e0e0e0"; // gray
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>Signature Verification</h1>

        {/* File upload */}
        {!file && (
          <label className="file-upload">
            Click to upload signature
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
        )}

        {/* Preview */}
        {preview && (
          <div className="preview">
            <p>Preview:</p>
            <img src={preview} alt="Signature Preview" />
          </div>
        )}

        {/* Action Buttons */}
        {file && (
          <div className="button-group">
            {!result && (
              <button onClick={handleUpload} disabled={loading}>
                {loading ? "Processing..." : "Verify Signature"}
              </button>
            )}
            {result && (
              <button onClick={handleReset} className="secondary">
                Try Another
              </button>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <h2 className="result" style={{ color: getResultColor() }}>
            Result: {result}
          </h2>
        )}
      </div>
    </div>
  );
}

export default App;
