import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function WatermarkTool() {
  const [image, setImage] = useState(null);
  const [visibleText, setVisibleText] = useState("");
  const [invisibleText, setInvisibleText] = useState("");
  const [extractedText, setExtractedText] = useState(null);
  const [mode, setMode] = useState("none");

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setExtractedText(null);
      setMode("none");
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const applyVisibleWatermark = () => {
    setMode("visible");
  };

  const applyInvisibleWatermark = () => {
    localStorage.setItem("invisible-watermark", invisibleText);
    alert("Invisible watermark added (simulated by localStorage).");
  };

  const extractInvisibleWatermark = () => {
    const hidden = localStorage.getItem("invisible-watermark");
    setExtractedText(hidden);
    setMode("extracted");
  };

  return (
    <div className="min-h-screen bg-[#000035] text-white p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Watermark Tool</h1>

        <div
          {...getRootProps()}
          className="border-4 border-dashed border-white p-10 rounded-xl cursor-pointer hover:bg-white/10 transition mb-6"
        >
          <input {...getInputProps()} />
          <p className="text-lg">Drop your image here or click to upload</p>
        </div>

        {image && (
          <div className="mb-6">
            <img
              src={image}
              alt="Uploaded"
              className="mx-auto max-h-[400px] object-contain rounded-lg"
            />

            {mode === "visible" && (
              <div className="absolute top-4 left-4 text-xl font-bold text-white bg-black/50 px-2 py-1 rounded">
                {visibleText}
              </div>
            )}
          </div>
        )}

        {image && (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Enter visible watermark text"
                value={visibleText}
                onChange={(e) => setVisibleText(e.target.value)}
                className="px-4 py-2 rounded bg-white text-black w-full"
              />
              <button
                onClick={applyVisibleWatermark}
                className="mt-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
              >
                Apply Visible Watermark
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="Enter invisible watermark text"
                value={invisibleText}
                onChange={(e) => setInvisibleText(e.target.value)}
                className="px-4 py-2 rounded bg-white text-black w-full"
              />
              <button
                onClick={applyInvisibleWatermark}
                className="mt-2 px-6 py-2 bg-green-500 hover:bg-green-600 rounded text-white"
              >
                Add Invisible Watermark
              </button>
            </div>

            <button
              onClick={extractInvisibleWatermark}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 rounded text-black"
            >
              Extract Invisible Watermark
            </button>

            {extractedText && (
              <p className="mt-4 text-lg text-green-300">
                Extracted Watermark: <strong>{extractedText}</strong>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
