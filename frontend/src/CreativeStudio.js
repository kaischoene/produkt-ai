import React, { useState, useRef, useCallback } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Progress } from './components/ui/progress';
import { toast } from 'sonner';
import {
  hasApiKey, getCredits, deductCredits,
  analyzeImage, combineImages
} from './services/geminiService';

// Helper to convert file to base64
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ─────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────
const ScanIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="7" x2="17" y1="12" y2="12" />
  </svg>
);

const LayersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17,8 12,3 7,8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
);

const LoaderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" /><line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

// ─────────────────────────────────────────────
// Drag & Drop Zone Component
// ─────────────────────────────────────────────
const DropZone = ({ onFilesSelected, multiple = false, maxFiles = 1, children, className = '' }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      );
      if (files.length > 0) {
        onFilesSelected(multiple ? files.slice(0, maxFiles) : [files[0]]);
      }
    },
    [onFilesSelected, multiple, maxFiles]
  );

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFilesSelected(multiple ? files.slice(0, maxFiles) : [files[0]]);
    }
    e.target.value = '';
  };

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`dropzone-area ${isDragOver ? 'dropzone-active' : ''} ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────
// Image Thumbnail Preview
// ─────────────────────────────────────────────
const ImageThumb = ({ file, onRemove }) => {
  const [src, setSrc] = useState(null);

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="image-thumb">
      {src && <img src={src} alt={file.name} />}
      <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="image-thumb-remove">
        <XIcon />
      </button>
      <span className="image-thumb-name">{file.name.substring(0, 12)}{file.name.length > 12 ? '...' : ''}</span>
    </div>
  );
};

// ─────────────────────────────────────────────
// Tool 1: Image-to-Prompt
// ─────────────────────────────────────────────
const ImageToPrompt = ({ onNeedApiKey }) => {
  const [imageFile, setImageFile] = useState(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!imageFile) {
      toast.error('Bitte lade zuerst ein Bild hoch.');
      return;
    }

    if (!hasApiKey()) {
      if (onNeedApiKey) onNeedApiKey();
      toast.error('Bitte zuerst einen API-Key eingeben.');
      return;
    }

    setIsAnalyzing(true);
    setGeneratedPrompt('');

    try {
      const base64 = await fileToBase64(imageFile);
      const prompt = await analyzeImage(base64, imageFile.type || 'image/png');
      setGeneratedPrompt(prompt);
      toast.success('Prompt erfolgreich generiert!');
    } catch (err) {
      console.error('Analyze error:', err);
      toast.error(err.message || 'Analyse fehlgeschlagen. Pruefe deinen API-Key.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.success('Prompt in die Zwischenablage kopiert!');
  };

  return (
    <div className="tool-section animate-fade-in">
      <Card className="tool-card">
        <CardHeader className="tool-card-header">
          <div className="tool-icon-badge tool-icon-analyze">
            <ScanIcon />
          </div>
          <div>
            <CardTitle className="text-xl">Bild analysieren</CardTitle>
            <CardDescription className="text-sm mt-1">
              Lade ein Bild hoch und erhalte einen ultra-detaillierten Prompt, der das Bild exakt beschreibt
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Upload Area */}
          <DropZone onFilesSelected={(files) => setImageFile(files[0])}>
            {imageFile ? (
              <div className="dropzone-preview">
                <ImageThumb file={imageFile} onRemove={() => { setImageFile(null); setGeneratedPrompt(''); }} />
                <p className="text-sm text-gray-500 mt-2">Klicke oder ziehe, um zu ersetzen</p>
              </div>
            ) : (
              <div className="dropzone-empty">
                <div className="dropzone-icon-wrapper">
                  <UploadIcon />
                </div>
                <p className="text-base font-semibold text-gray-800">Bild hierher ziehen</p>
                <p className="text-sm text-gray-500">oder klicken zum Auswaehlen</p>
                <Badge variant="outline" className="mt-2 text-xs">PNG, JPG, WEBP</Badge>
              </div>
            )}
          </DropZone>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!imageFile || isAnalyzing}
            className="w-full h-12 text-base studio-btn-primary"
          >
            {isAnalyzing ? (
              <>
                <LoaderIcon /><span className="ml-2">Bild wird analysiert...</span>
              </>
            ) : (
              <>
                <SparklesIcon /><span className="ml-2">Prompt generieren</span>
              </>
            )}
          </Button>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={65} className="w-full" />
              <p className="text-xs text-gray-500 text-center">Nano Banana analysiert Komposition, Farben, Beleuchtung, Texturen...</p>
            </div>
          )}

          {/* Result */}
          {generatedPrompt && (
            <div className="prompt-result animate-slide-up">
              <div className="prompt-result-header">
                <Badge className="bg-emerald-100 text-emerald-700 border-0">Generierter Prompt</Badge>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-500 hover:text-gray-800">
                  <CopyIcon /><span className="ml-1 text-xs">Kopieren</span>
                </Button>
              </div>
              <div className="prompt-result-text">
                {generatedPrompt}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────
// Tool 2: Multi-Image Combine
// ─────────────────────────────────────────────
const MultiImageCombine = ({ credits, onCreditsChange, onImagesGenerated, onNeedApiKey }) => {
  const [imageFiles, setImageFiles] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImages, setResultImages] = useState([]);

  const addFiles = (newFiles) => {
    setImageFiles((prev) => {
      const combined = [...prev, ...newFiles];
      if (combined.length > 5) {
        toast.error('Maximal 5 Bilder erlaubt!');
        return combined.slice(0, 5);
      }
      return combined;
    });
  };

  const removeFile = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!hasApiKey()) {
      if (onNeedApiKey) onNeedApiKey();
      toast.error('Bitte zuerst einen API-Key eingeben.');
      return;
    }

    if (!prompt.trim()) {
      toast.error('Bitte beschreibe, was erstellt werden soll.');
      return;
    }
    if (credits < 1) {
      toast.error('Nicht genuegend Credits!');
      return;
    }

    setIsGenerating(true);
    setResultImages([]);

    try {
      const imageData = await Promise.all(
        imageFiles.map(async (file) => ({
          base64: await fileToBase64(file),
          mimeType: file.type || 'image/png',
        }))
      );

      const result = await combineImages(imageData, prompt.trim());

      // Deduct 1 credit
      const newCredits = deductCredits(1);
      if (onCreditsChange) onCreditsChange(newCredits);

      // Convert to display format
      const displayImages = result.images.map((img) => ({
        dataUrl: img.dataUrl,
      }));
      setResultImages(displayImages);

      // Also notify parent for gallery
      if (onImagesGenerated) {
        const galleryImages = result.images.map((img, idx) => ({
          id: `combine_${Date.now()}_${idx}`,
          dataUrl: img.dataUrl,
          prompt: prompt.trim(),
          width: 1024,
          height: 1024,
          status: 'completed',
          created_at: new Date().toISOString(),
        }));
        onImagesGenerated(galleryImages);
      }

      toast.success(`Bild erfolgreich erstellt! (${newCredits} Credits verbleibend)`);
    } catch (err) {
      console.error('Combine error:', err);
      toast.error(err.message || 'Kombination fehlgeschlagen. Pruefe deinen API-Key.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="tool-section animate-fade-in">
      <Card className="tool-card">
        <CardHeader className="tool-card-header">
          <div className="tool-icon-badge tool-icon-combine">
            <LayersIcon />
          </div>
          <div>
            <CardTitle className="text-xl">Bilder kombinieren / erstellen</CardTitle>
            <CardDescription className="text-sm mt-1">
              Lade bis zu 5 Referenzbilder hoch, beschreibe dein Wunschbild, und Nano Banana erstellt es
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Multi-Upload Area */}
          <DropZone
            onFilesSelected={addFiles}
            multiple
            maxFiles={5 - imageFiles.length}
            className={imageFiles.length >= 5 ? 'pointer-events-none opacity-50' : ''}
          >
            {imageFiles.length > 0 ? (
              <div className="dropzone-multi-preview">
                <div className="image-thumb-grid">
                  {imageFiles.map((file, idx) => (
                    <ImageThumb key={idx} file={file} onRemove={() => removeFile(idx)} />
                  ))}
                  {imageFiles.length < 5 && (
                    <div className="image-thumb-add">
                      <span className="text-2xl text-gray-400">+</span>
                      <span className="text-xs text-gray-400">{5 - imageFiles.length} frei</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">{imageFiles.length}/5 Bilder</p>
              </div>
            ) : (
              <div className="dropzone-empty">
                <div className="dropzone-icon-wrapper">
                  <UploadIcon />
                </div>
                <p className="text-base font-semibold text-gray-800">Bis zu 5 Referenzbilder hochladen</p>
                <p className="text-sm text-gray-500">Oder einfach nur einen Prompt eingeben fuer Bildgenerierung ohne Referenz</p>
                <Badge variant="outline" className="mt-2 text-xs">PNG, JPG, WEBP (optional)</Badge>
              </div>
            )}
          </DropZone>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Beschreibung / Prompt
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="z.B. Erstelle ein professionelles Produktfoto auf einem eleganten Marmortisch mit warmem Licht..."
              className="min-h-[100px] studio-textarea"
            />
            <p className="text-xs text-gray-400">
              Beschreibe genau, was du erstellen moechtest. Du kannst Referenzbilder hochladen oder nur Text verwenden.
            </p>
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Beispiele</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Kombiniere alle Produkte in einer eleganten Flatlay-Szene',
                'Erstelle eine Collage mit weichen Uebergaengen',
                'Platziere alle Objekte in einer minimalistischen Studio-Szene',
                'Verschmelze die Bilder zu einem surrealen Kunstwerk'
              ].map((ex, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setPrompt(ex); }}
                  className="example-chip"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating || credits < 1}
            className="w-full h-12 text-base studio-btn-combine"
          >
            {isGenerating ? (
              <>
                <LoaderIcon /><span className="ml-2">Nano Banana generiert...</span>
              </>
            ) : (
              <>
                <LayersIcon /><span className="ml-2">
                  Bild erstellen ({credits} Credits)
                </span>
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={50} className="w-full" />
              <p className="text-xs text-gray-500 text-center">Nano Banana generiert dein Bild...</p>
            </div>
          )}

          {/* Results */}
          {resultImages.length > 0 && (
            <div className="result-gallery animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <Badge className="bg-violet-100 text-violet-700 border-0">Ergebnis</Badge>
              </div>
              <div className="result-grid">
                {resultImages.map((img, idx) => (
                  <div key={idx} className="result-image-card">
                    <img
                      src={img.dataUrl}
                      alt={`Ergebnis ${idx + 1}`}
                      className="result-image"
                    />
                    <div className="result-image-overlay">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = img.dataUrl;
                          link.download = `produktai_${Date.now()}_${idx + 1}.png`;
                          link.click();
                        }}
                      >
                        <DownloadIcon />
                        <span className="ml-1 text-xs">Download</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main CreativeStudio Component
// ─────────────────────────────────────────────
const CreativeStudio = ({ credits, onCreditsChange, onImagesGenerated, onNeedApiKey }) => {
  const [activeTool, setActiveTool] = useState('analyze');

  return (
    <div className="creative-studio">
      {/* Studio Header */}
      <div className="studio-header">
        <div className="studio-header-content">
          <h2 className="studio-title">
            <SparklesIcon />
            <span>Creative Studio</span>
          </h2>
          <p className="studio-subtitle">
            Powered by Nano Banana (Gemini) - Bildanalyse, Generierung und Kombination
          </p>
        </div>
      </div>

      {/* Tool Selector */}
      <div className="studio-tool-selector">
        <button
          className={`studio-tool-tab ${activeTool === 'analyze' ? 'studio-tool-tab-active-analyze' : ''}`}
          onClick={() => setActiveTool('analyze')}
        >
          <ScanIcon />
          <div className="text-left">
            <span className="studio-tool-tab-title">Bild zu Prompt</span>
            <span className="studio-tool-tab-desc">Bild analysieren lassen</span>
          </div>
        </button>
        <button
          className={`studio-tool-tab ${activeTool === 'combine' ? 'studio-tool-tab-active-combine' : ''}`}
          onClick={() => setActiveTool('combine')}
        >
          <LayersIcon />
          <div className="text-left">
            <span className="studio-tool-tab-title">Bilder erstellen</span>
            <span className="studio-tool-tab-desc">Mit oder ohne Referenzbilder</span>
          </div>
        </button>
      </div>

      {/* Active Tool */}
      <div className="studio-content">
        {activeTool === 'analyze' && <ImageToPrompt onNeedApiKey={onNeedApiKey} />}
        {activeTool === 'combine' && (
          <MultiImageCombine
            credits={credits}
            onCreditsChange={onCreditsChange}
            onImagesGenerated={onImagesGenerated}
            onNeedApiKey={onNeedApiKey}
          />
        )}
      </div>
    </div>
  );
};

export default CreativeStudio;
