
import React, { useState, useCallback, useEffect } from 'react';
import { ImageFile, Theme, ChatMessage, EditTarget, StylePreset } from './types';
import Header from './components/Header';
import ImageGallery from './components/ImageGallery';
import Loader from './components/Loader';
import { generateImage, upscaleImage, generateImageFromScratch, getSubjectMask, animateImage } from './services/geminiService';
import { fileToDataUrl, dataUrlToFile } from './utils/imageUtils';
import OutputPanel from './components/OutputPanel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ResizablePanels';
import FullscreenButton from './components/FullscreenButton';
import ChatPanel from './components/ChatPanel';
import UpscalePanel from './components/UpscalePanel';
import AnimatePanel from './components/AnimatePanel';

type ActiveTab = 'generate' | 'upscale' | 'animate';

export default function App() {
  const [uploadedImages, setUploadedImages] = useState<ImageFile[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [referenceImages, setReferenceImages] = useState<ImageFile[]>([]);
  
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [outputVideo, setOutputVideo] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loaderMessage, setLoaderMessage] = useState<string>('Generating your image...');
  const [error, setError] = useState<string | null>(null);
  
  const [upscaleMultiplier, setUpscaleMultiplier] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<ActiveTab>('generate');

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  // Advanced Options State
  const [stylePreset, setStylePreset] = useState<StylePreset>(StylePreset.NONE);
  const [negativePrompt, setNegativePrompt] = useState<string>('');

  // Smart Masking State
  const [subjectMask, setSubjectMask] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget>(EditTarget.SUBJECT);

  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [editorLayout, setEditorLayout] = useState<'vertical' | 'horizontal'>('vertical');
  
  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    // Clear context-sensitive state when the main image changes
    if (selectedImage) {
      setChatHistory([]);
      setSubjectMask(null);
    }
  }, [selectedImage]);

  const handleImagesUpload = useCallback(async (files: FileList) => {
    const newImageFiles: ImageFile[] = await Promise.all(
        Array.from(files).map(async (file) => {
            const url = await fileToDataUrl(file);
            return { id: crypto.randomUUID(), name: file.name, url, file };
        })
    );
    setUploadedImages(prev => [...prev, ...newImageFiles]);
    if (!selectedImage && newImageFiles.length > 0) {
      setSelectedImage(newImageFiles[0]);
    }
  }, [selectedImage]);

  const handleImageSelect = (image: ImageFile) => {
    setSelectedImage(image);
    setReferenceImages(refs => refs.filter(ref => ref.id !== image.id));
    setOutputImage(null);
    setOutputVideo(null);
  };
  
  const handleReferenceToggle = (image: ImageFile) => {
    setReferenceImages(refs => 
      refs.some(ref => ref.id === image.id)
        ? refs.filter(ref => ref.id !== image.id)
        : [...refs, image]
    );
  };

  const handleImageDelete = (imageId: string) => {
    if (selectedImage?.id === imageId) {
        setSelectedImage(null);
    }
    setReferenceImages(refs => refs.filter(ref => ref.id !== imageId));
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };
  
  const handleNewImage = () => {
    setSelectedImage(null);
    setReferenceImages([]);
    setOutputImage(null);
    setOutputVideo(null);
    setChatHistory([]);
    setSubjectMask(null);
    setActiveTab('generate');
  };

  const handleGetSubjectMask = async () => {
    if (!selectedImage) return;
    setLoaderMessage('Analyzing subject...');
    setIsLoading(true);
    setError(null);
    try {
        const maskDataUrl = await getSubjectMask(selectedImage.url);
        setSubjectMask(maskDataUrl);
    } catch(e: any) {
        console.error(e);
        setError(e.message || 'Failed to generate subject mask.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleGenerateMessage = async (prompt: string) => {
    const newMessage: ChatMessage = { id: crypto.randomUUID(), text: prompt };
    setChatHistory(prev => [...prev, newMessage]);

    setLoaderMessage('Generating your image...');
    setIsLoading(true);
    setError(null);
    setOutputImage(null);
    setOutputVideo(null);

    try {
        let resultUrl: string;
        if (selectedImage) {
           resultUrl = await generateImage(selectedImage.url, referenceImages, prompt, subjectMask, editTarget, stylePreset, negativePrompt);
        } else {
           resultUrl = await generateImageFromScratch(prompt, referenceImages, stylePreset, negativePrompt);
        }
        setOutputImage(resultUrl);
        
        const newFile = await dataUrlToFile(resultUrl, `generated-${Date.now()}.png`);
        const newImageFile: ImageFile = {
            id: crypto.randomUUID(),
            name: newFile.name,
            url: resultUrl,
            file: newFile
        };
        setUploadedImages(prev => [newImageFile, ...prev]);

    } catch (e: any) {
        console.error(e);
        setError(e.message || 'An unknown error occurred during generation.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleUpscaleImage = async () => {
    if (!selectedImage) return;
    setLoaderMessage('Upscaling your image...');
    setIsLoading(true);
    setError(null);
    setOutputImage(null);
    setOutputVideo(null);
    try {
        const resultUrl = await upscaleImage(selectedImage.url, upscaleMultiplier, referenceImages);
        setOutputImage(resultUrl);
        const newFile = await dataUrlToFile(resultUrl, `upscaled-${selectedImage.name}`);
        const newImageFile: ImageFile = { id: crypto.randomUUID(), name: newFile.name, url: resultUrl, file: newFile };
        setUploadedImages(prev => [newImageFile, ...prev]);
    } catch (e: any) {
        console.error(e);
        setError(e.message || 'An unknown error occurred while upscaling.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleAnimateImage = async (prompt: string) => {
      if (!selectedImage) return;
      setLoaderMessage('Animating image... This can take several minutes.');
      setIsLoading(true);
      setError(null);
      setOutputImage(null);
      setOutputVideo(null);
      try {
          const videoDownloadLink = await animateImage(selectedImage.url, prompt);
          // Videos from the API must be fetched with the API key
          const response = await fetch(`${videoDownloadLink}&key=${process.env.API_KEY}`);
          const videoBlob = await response.blob();
          const videoUrl = URL.createObjectURL(videoBlob);
          setOutputVideo(videoUrl);
      } catch (e: any) {
          console.error(e);
          setError(e.message || 'An unknown error occurred during animation.');
      } finally {
          setIsLoading(false);
      }
  };

  const handleUseOutputAsInput = async () => {
    if (!outputImage) return;
    const existingImage = uploadedImages.find(img => img.url === outputImage);
    if (existingImage) {
        handleImageSelect(existingImage);
    }
    setOutputImage(null);
    setOutputVideo(null);
  };
  
  const toggleEditorLayout = () => {
    setEditorLayout(prev => prev === 'vertical' ? 'horizontal' : 'vertical');
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-[var(--color-background-primary)]">
      <Header 
        theme={theme} 
        setTheme={setTheme} 
        editorLayout={editorLayout}
        onToggleLayout={toggleEditorLayout}
      />
      {error && (
        <div className="bg-red-500 text-white p-4 text-center fixed top-20 w-full z-20">
          <p>Error: {error}</p>
          <button onClick={() => setError(null)} className="font-bold underline ml-4">Dismiss</button>
        </div>
      )}
      <main className="flex-grow h-[calc(100vh-80px)]">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15}>
            <aside className="h-full overflow-y-auto bg-[var(--color-background-secondary)]">
              <ImageGallery
                images={uploadedImages}
                selectedImage={selectedImage}
                referenceImages={referenceImages}
                onImageSelect={handleImageSelect}
                onReferenceToggle={handleReferenceToggle}
                onImagesUpload={handleImagesUpload}
                onImageDelete={handleImageDelete}
                onNewImage={handleNewImage}
              />
            </aside>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={60} minSize={30}>
            <ResizablePanelGroup direction={editorLayout}>
              <ResizablePanel defaultSize={50} minSize={25}>
                <section 
                  id="editor-panel"
                  className="relative h-full bg-[var(--color-background-primary)] p-4 flex flex-col justify-center items-center overflow-hidden"
                >
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 self-start">
                        {selectedImage ? "Input Image" : "New Image Generation"}
                    </h2>
                    <div className="flex-grow w-full flex items-center justify-center relative rounded-lg bg-[var(--color-background-tertiary)] overflow-hidden">
                        <FullscreenButton targetId="editor-panel" />
                        {selectedImage ? (
                            <img src={selectedImage.url} alt="Selected for editing" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <div className="text-center text-[var(--color-text-secondary)]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="mt-2">Use the 'Generate' panel to create a new image from scratch.</p>
                            </div>
                        )}
                         {subjectMask && selectedImage && (
                            <img src={subjectMask} alt="Subject mask" className="absolute inset-0 w-full h-full object-contain opacity-50 pointer-events-none" />
                        )}
                    </div>
                </section>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={50} minSize={25}>
                 <OutputPanel 
                    outputImage={outputImage}
                    outputVideo={outputVideo}
                    onUseAsInput={handleUseOutputAsInput}
                    isLoading={isLoading}
                  />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={20} minSize={15}>
            <aside className="h-full flex flex-col bg-[var(--color-background-secondary)]">
              <div className="flex border-b border-[var(--color-border)]">
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`flex-1 py-2 text-center font-medium transition-colors ${activeTab === 'generate' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]'}`}
                >
                  Generate
                </button>
                <button
                  onClick={() => setActiveTab('upscale')}
                  className={`flex-1 py-2 text-center font-medium transition-colors ${activeTab === 'upscale' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]'}`}
                >
                  Upscale
                </button>
                 <button
                  onClick={() => setActiveTab('animate')}
                  className={`flex-1 py-2 text-center font-medium transition-colors ${activeTab === 'animate' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]'}`}
                >
                  Animate
                </button>
              </div>
              <div className="flex-grow">
                {activeTab === 'generate' && (
                    <ChatPanel
                        chatHistory={chatHistory}
                        onSendMessage={handleGenerateMessage}
                        isLoading={isLoading}
                        disabled={isLoading}
                        isTextToImage={!selectedImage}
                        subjectMask={subjectMask}
                        editTarget={editTarget}
                        onGetSubjectMask={handleGetSubjectMask}
                        onSetEditTarget={setEditTarget}
                        stylePreset={stylePreset}
                        onSetStylePreset={setStylePreset}
                        negativePrompt={negativePrompt}
                        onSetNegativePrompt={setNegativePrompt}
                    />
                )}
                {activeTab === 'upscale' && (
                    <UpscalePanel
                        multiplier={upscaleMultiplier}
                        setMultiplier={setUpscaleMultiplier}
                        onUpscaleImage={handleUpscaleImage}
                        isLoading={isLoading}
                        disabled={!selectedImage || isLoading}
                    />
                )}
                {activeTab === 'animate' && (
                    <AnimatePanel
                        onAnimate={handleAnimateImage}
                        isLoading={isLoading}
                        disabled={!selectedImage || isLoading}
                    />
                )}
              </div>
            </aside>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      {isLoading && <Loader message={loaderMessage} />}
    </div>
  );
}
