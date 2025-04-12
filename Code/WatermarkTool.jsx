import React, { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Download, Image as ImageIcon } from "lucide-react";

interface WatermarkToolProps {}

const WatermarkTool: React.FC<WatermarkToolProps> = () => {
  const [image, setImage] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [visibleText, setVisibleText] = useState<string>("");
  const [invisibleText, setInvisibleText] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [mode, setMode] = useState<"none" | "visible" | "extracted">("none");
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [logoOpacity, setLogoOpacity] = useState<number>(0.5);
  const [logoSize, setLogoSize] = useState<number>(30); // percentage of main image width
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setExtractedText(null);
      setMode("none");
      setWatermarkedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const onDropLogo = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });

  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps } = useDropzone({
    onDrop: onDropLogo,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });

  const applyVisibleWatermark = () => {
    if (!image || !visibleText || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Configure watermark text
      const fontSize = Math.max(40, img.width * 0.08);
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 3;

      // Calculate diagonal position
      const text = visibleText;
      const textMetrics = ctx.measureText(text);
      
      // Save the current context state
      ctx.save();
      
      // Move to center and rotate
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);
      
      // Draw text multiple times for a tiled effect
      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          const x = (i * canvas.width / 2) - textMetrics.width / 2;
          const y = (j * canvas.height / 3);
          
          ctx.strokeText(text, x, y);
          ctx.fillText(text, x, y);
        }
      }
      
      // Restore the context state
      ctx.restore();

      setWatermarkedImage(canvas.toDataURL('image/png'));
    };
    img.src = image;
    setMode("visible");
  };

  const applyLogoWatermark = () => {
    if (!image || !logo || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mainImg = new Image();
    mainImg.onload = () => {
      canvas.width = mainImg.width;
      canvas.height = mainImg.height;
      ctx.drawImage(mainImg, 0, 0);

      const logoImg = new Image();
      logoImg.onload = () => {
        // Calculate logo dimensions based on main image width
        const logoWidth = (mainImg.width * logoSize) / 100;
        const logoHeight = (logoImg.height * logoWidth) / logoImg.width;

        // Set global alpha for transparency
        ctx.globalAlpha = logoOpacity;

        // Draw logo in each corner and center
        const positions = [
          { x: 10, y: 10 }, // Top left
          { x: mainImg.width - logoWidth - 10, y: 10 }, // Top right
          { x: 10, y: mainImg.height - logoHeight - 10 }, // Bottom left
          { x: mainImg.width - logoWidth - 10, y: mainImg.height - logoHeight - 10 }, // Bottom right
          { x: (mainImg.width - logoWidth) / 2, y: (mainImg.height - logoHeight) / 2 } // Center
        ];

        positions.forEach(pos => {
          ctx.drawImage(logoImg, pos.x, pos.y, logoWidth, logoHeight);
        });

        // Reset global alpha
        ctx.globalAlpha = 1;

        setWatermarkedImage(canvas.toDataURL('image/png'));
      };
      logoImg.src = logo;
    };
    mainImg.src = image;
  };

  const stringToBinary = (str: string): number[] => {
    const result: number[] = [];
    for (let i = 0; i < str.length; i++) {
      const binary = str.charCodeAt(i).toString(2).padStart(8, '0');
      for (let j = 0; j < 8; j++) {
        result.push(parseInt(binary[j]));
      }
    }
    return result;
  };

  const binaryToString = (binary: number[]): string => {
    let result = '';
    for (let i = 0; i < binary.length; i += 8) {
      const byte = binary.slice(i, i + 8).join('');
      result += String.fromCharCode(parseInt(byte, 2));
    }
    return result;
  };

  const applyInvisibleWatermark = () => {
    if (!image || !invisibleText || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert text to binary
      const binaryMessage = stringToBinary(invisibleText);
      
      // Store message length at the beginning
      const lengthBinary = stringToBinary(binaryMessage.length.toString());
      
      // Embed the length first (32 bits for length)
      for (let i = 0; i < 32; i++) {
        const bit = i < lengthBinary.length ? lengthBinary[i] : 0;
        // Only modify the least significant bit
        data[i * 4] = (data[i * 4] & 0xFE) | bit;
      }

      // Embed the message
      for (let i = 0; i < binaryMessage.length; i++) {
        const position = (i + 32) * 4; // Start after length bits
        if (position < data.length) {
          // Only modify the least significant bit
          data[position] = (data[position] & 0xFE) | binaryMessage[i];
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setWatermarkedImage(canvas.toDataURL('image/png'));
    };
    img.src = image;
  };

  const extractInvisibleWatermark = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Extract length first (32 bits)
      const lengthBits: number[] = [];
      for (let i = 0; i < 32; i++) {
        lengthBits.push(data[i * 4] & 0x01);
      }
      const messageLength = parseInt(binaryToString(lengthBits), 10);

      // Extract message
      const messageBits: number[] = [];
      for (let i = 0; i < messageLength; i++) {
        const position = (i + 32) * 4; // Start after length bits
        if (position < data.length) {
          messageBits.push(data[position] & 0x01);
        }
      }

      const extractedMessage = binaryToString(messageBits);
      setExtractedText(extractedMessage);
      setMode("extracted");
    };
    img.src = watermarkedImage || image || '';
  };

  const downloadWatermarkedImage = () => {
    if (!watermarkedImage) return;
    
    const link = document.createElement('a');
    link.href = watermarkedImage;
    link.download = 'watermarked-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#000035] text-white p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Watermark Tool</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div
            {...getRootProps()}
            className="border-4 border-dashed border-white p-10 rounded-xl cursor-pointer hover:bg-white/10 transition"
          >
            <input {...getInputProps()} />
            <p className="text-lg">Drop your main image here or click to upload</p>
          </div>

          <div
            {...getLogoRootProps()}
            className="border-4 border-dashed border-white p-10 rounded-xl cursor-pointer hover:bg-white/10 transition"
          >
            <input {...getLogoInputProps()} />
            <p className="text-lg">Drop your logo here or click to upload</p>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {image && (
          <div className="mb-6 space-y-6">
            <div className="relative">
              <img
                src={watermarkedImage || image}
                alt="Uploaded"
                className="mx-auto max-h-[400px] object-contain rounded-lg"
              />
            </div>

            {watermarkedImage && (
              <button
                onClick={downloadWatermarkedImage}
                className="flex items-center gap-2 mx-auto px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded text-white"
              >
                <Download size={20} />
                Download Watermarked Image
              </button>
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

            {logo && (
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <label className="flex-1">
                    Logo Size (%)
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={logoSize}
                      onChange={(e) => setLogoSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </label>
                  <label className="flex-1">
                    Logo Opacity
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={logoOpacity}
                      onChange={(e) => setLogoOpacity(Number(e.target.value))}
                      className="w-full"
                    />
                  </label>
                </div>
                <button
                  onClick={applyLogoWatermark}
                  className="w-full px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded text-white flex items-center justify-center gap-2"
                >
                  <ImageIcon size={20} />
                  Apply Logo Watermark
                </button>
              </div>
            )}

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
};

export default WatermarkTool;
