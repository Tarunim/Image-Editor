
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, EditTarget, StylePreset } from '../types';

interface ChatPanelProps {
  chatHistory: ChatMessage[];
  onSendMessage: (prompt: string) => void;
  isLoading: boolean;
  disabled: boolean;
  isTextToImage: boolean;
  subjectMask: string | null;
  editTarget: EditTarget;
  onGetSubjectMask: () => void;
  onSetEditTarget: (target: EditTarget) => void;
  stylePreset: StylePreset;
  onSetStylePreset: (preset: StylePreset) => void;
  negativePrompt: string;
  onSetNegativePrompt: (prompt: string) => void;
}

export default function ChatPanel({
  chatHistory,
  onSendMessage,
  isLoading,
  disabled,
  isTextToImage,
  subjectMask,
  editTarget,
  onGetSubjectMask,
  onSetEditTarget,
  stylePreset,
  onSetStylePreset,
  negativePrompt,
  onSetNegativePrompt
}: ChatPanelProps) {
  const [prompt, setPrompt] = useState('');
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSendMessage(prompt.trim());
      setPrompt('');
    }
  };

  return (
    <div className="p-4 bg-[var(--color-background-secondary)] h-full flex flex-col space-y-4">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Generate</h2>
      
       {!isTextToImage && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Smart Masking
          </label>
          <div className="space-y-2">
            <button
              onClick={onGetSubjectMask}
              disabled={isLoading}
              className="w-full text-center bg-[var(--color-background-primary)] hover:bg-[var(--color-background-tertiary)] text-[var(--color-text-secondary)] font-bold py-2 px-4 rounded cursor-pointer transition-colors disabled:opacity-50"
            >
              {subjectMask ? 'Recalculate Subject Mask' : 'Auto-Select Subject'}
            </button>
            {subjectMask && (
               <div className="flex space-x-2">
                  <button
                    onClick={() => onSetEditTarget(EditTarget.SUBJECT)}
                    className={`px-4 py-2 rounded-md text-sm font-medium w-full transition-colors ${
                      editTarget === EditTarget.SUBJECT
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-background-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]'
                    }`}
                  >
                    Edit Subject
                  </button>
                  <button
                    onClick={() => onSetEditTarget(EditTarget.BACKGROUND)}
                    className={`px-4 py-2 rounded-md text-sm font-medium w-full transition-colors ${
                      editTarget === EditTarget.BACKGROUND
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-background-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-tertiary)]'
                    }`}
                  >
                    Edit Background
                  </button>
               </div>
            )}
          </div>
        </div>
      )}

      <details className="border-b border-t border-[var(--color-border)] py-2 group">
        <summary className="w-full text-left text-sm font-medium text-[var(--color-text-secondary)] flex justify-between items-center cursor-pointer list-none">
          <span>Advanced Options</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="style-preset" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Style Preset
            </label>
            <select
              id="style-preset"
              value={stylePreset}
              onChange={(e) => onSetStylePreset(e.target.value as StylePreset)}
              disabled={disabled}
              className="w-full bg-[var(--color-background-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
            >
              {Object.values(StylePreset).map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="negative-prompt" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Negative Prompt
            </label>
            <textarea
              id="negative-prompt"
              value={negativePrompt}
              onChange={(e) => onSetNegativePrompt(e.target.value)}
              placeholder="e.g., text, watermarks, blurry, deformed..."
              disabled={disabled}
              rows={3}
              className="w-full bg-[var(--color-background-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
            />
          </div>
        </div>
      </details>

      <div className="flex-grow flex flex-col bg-[var(--color-background-primary)] rounded-lg p-2 overflow-hidden">
        <div className="flex-grow overflow-y-auto pr-2 space-y-3">
            {chatHistory.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-sm text-[var(--color-text-secondary)]">
                    {isTextToImage ? "Describe the image you want to create." : "Chat history for the selected image will appear here."}
                </p>
              </div>
            )}
            {chatHistory.map((msg) => (
                <div key={msg.id} className="bg-[var(--color-background-tertiary)] p-3 rounded-lg text-[var(--color-text-primary)] text-sm whitespace-pre-wrap break-words">
                    {msg.text}
                </div>
            ))}
            <div ref={historyEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2">
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={isTextToImage ? "Describe image to create..." : "Describe changes..."}
                disabled={disabled}
                className="flex-grow bg-[var(--color-background-tertiary)] border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={disabled || !prompt.trim()}
                className="bg-[var(--color-accent)] hover:opacity-90 text-white font-bold p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send prompt"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V