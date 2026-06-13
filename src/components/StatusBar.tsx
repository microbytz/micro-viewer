import React from 'react';
import { Editor } from '@tiptap/react';
import { HelpCircle, Monitor, ZoomIn, ZoomOut, CheckCircle2, BookOpen, Mic } from 'lucide-react';

interface StatusBarProps {
  editor: Editor | null;
  zoom: number;
  setZoom: (zoom: number) => void;
  savingStatus: 'idle' | 'saving' | 'saved';
  lastSavedAt: string | null;
  onShowStats: () => void;
}

export default function StatusBar({
  editor,
  zoom,
  setZoom,
  savingStatus,
  lastSavedAt,
  onShowStats,
}: StatusBarProps) {
  // Extract statistics
  const text = editor ? editor.getText() : '';
  // Count characters
  const charCount = text.replace(/\r?\n/g, '').length;
  // Count words
  const wordCount = text.trim() === '' 
    ? 0 
    : text.trim().split(/\s+/).filter(w => w.length > 0).length;

  // Reading Speed: 200 wpm
  const readTimeMin = wordCount / 200;
  const readTimeStr = readTimeMin < 1 
    ? `${Math.max(1, Math.round(readTimeMin * 60))}s` 
    : `${Math.ceil(readTimeMin)}m`;

  // Speaking Speed: 140 wpm
  const speakTimeMin = wordCount / 140;
  const speakTimeStr = speakTimeMin < 1 
    ? `${Math.max(1, Math.round(speakTimeMin * 60))}s` 
    : `${Math.ceil(speakTimeMin)}m`;

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(Number(e.target.value));
  };

  const incrementZoom = () => {
    setZoom(Math.min(zoom + 10, 150));
  };

  const decrementZoom = () => {
    setZoom(Math.max(zoom - 10, 50));
  };

  return (
    <div className="bg-blue-800 text-white h-7 px-4 flex items-center justify-between text-xs font-semibold select-none border-t border-blue-900 shrink-0 shadow-inner">
      {/* Interactive Word Count / Character statistics & read-out summaries */}
      <div className="flex items-center space-x-3.5">
        <button
          onClick={onShowStats}
          className="flex items-center space-x-3 cursor-pointer hover:bg-blue-700 hover:text-white px-2 py-0.5 rounded transition duration-150 border border-transparent hover:border-blue-500/30"
          title="Click to view detailed Document Statistics report"
        >
          <div className="flex items-center space-x-1.5 font-medium text-blue-100">
            <span className="font-bold text-white">{wordCount}</span>
            <span>words</span>
          </div>
          <span className="text-blue-400 font-extrabold select-none">|</span>
          <div className="flex items-center space-x-1.5 font-medium text-blue-100">
            <span className="font-bold text-white">{charCount}</span>
            <span>chars</span>
          </div>
          <span className="text-blue-300 text-[10px] bg-blue-900/60 transition-colors px-1.5 py-0.25 rounded font-bold uppercase tracking-wider scale-90">Stats</span>
        </button>

        <span className="text-blue-400 font-extrabold select-none hidden sm:inline">|</span>

        {/* Read & Speak estimations */}
        <div className="hidden sm:flex items-center space-x-3 text-blue-100">
          <div className="flex items-center space-x-1" title={`Estimated Reading Time (at 200 wpm): ${readTimeStr}`}>
            <BookOpen size={11} className="text-blue-300" />
            <span>Read: <strong className="text-white font-bold">{readTimeStr}</strong></span>
          </div>
          <div className="flex items-center space-x-1" title={`Estimated Speaking Time (at 140 wpm): ${speakTimeStr}`}>
            <Mic size={11} className="text-blue-300" />
            <span>Speak: <strong className="text-white font-bold">{speakTimeStr}</strong></span>
          </div>
        </div>

        <span className="text-blue-400 font-extrabold select-none hidden md:inline">|</span>

        {/* Save indicator */}
        <div className="hidden md:flex items-center space-x-1.25">
          {savingStatus === 'saving' ? (
            <span className="text-orange-300 flex items-center space-x-1 text-[11px] animate-pulse pb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block"></span>
              <span>Syncing with system database...</span>
            </span>
          ) : savingStatus === 'saved' ? (
            <span className="text-[#a7f3d0] flex items-center space-x-1 text-[11px] font-medium">
              <CheckCircle2 size={12} className="inline-block" />
              <span>Saved locally {lastSavedAt ? `at ${lastSavedAt}` : ''}</span>
            </span>
          ) : (
            <span className="text-blue-200 text-[11px] font-medium">System Ready</span>
          )}
        </div>
      </div>

      {/* Zoom factor & Extra view elements */}
      <div className="flex items-center space-x-4">
        {/* Zoom controls restricted to 50% - 150% */}
        <div className="flex items-center space-x-2">
          <button
            onClick={decrementZoom}
            className="text-blue-100 hover:text-white transition disabled:opacity-30 cursor-pointer p-0.5"
            disabled={zoom <= 50}
            title="Zoom Out (Ctrl+-)"
          >
            <ZoomOut size={13} />
          </button>
          <input
            type="range"
            min="50"
            max="150"
            step="10"
            value={zoom}
            onChange={handleZoomChange}
            className="w-20 md:w-28 accent-white h-1 bg-blue-600 rounded-lg cursor-pointer transition select-none tracking-normal shrink-0"
            title={`Adjust Document Scaling (${zoom}%)`}
          />
          <button
            onClick={incrementZoom}
            className="text-blue-100 hover:text-white transition disabled:opacity-30 cursor-pointer p-0.5"
            disabled={zoom >= 150}
            title="Zoom In (Ctrl++)"
          >
            <ZoomIn size={13} />
          </button>
          
          <span className="text-white min-w-[32px] text-right text-[11px] font-bold">
            {zoom}%
          </span>
        </div>

        <span className="text-blue-400 font-extrabold select-none hidden lg:inline">|</span>
        
        {/* Layout details */}
        <div className="hidden lg:flex items-center space-x-1 text-blue-200 hover:text-white transition cursor-help max-w-fit">
          <Monitor size={12} />
          <span>Layout: Standard A4</span>
        </div>
      </div>
    </div>
  );
}
