import React from 'react';
import { EditorContent, Editor } from '@tiptap/react';
import { PageOrientation, PageMargin, DOCUMENT_MARGINS } from '../types';
import { Table, Trash2, Milestone, ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react';

interface CanvasProps {
  editor: Editor | null;
  orientation: PageOrientation;
  marginType: string;
  paperColor: string;
  zoom: number;
}

export default function Canvas({
  editor,
  orientation,
  marginType,
  paperColor,
  zoom,
}: CanvasProps) {
  if (!editor) {
    return (
      <div className="flex-1 bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500 font-semibold animate-pulse">Assembling Canvas Board...</span>
        </div>
      </div>
    );
  }

  // Get matching margin configuration
  const margin: PageMargin = DOCUMENT_MARGINS[marginType] || DOCUMENT_MARGINS.normal;

  // Compute paper dimensions for desktop A4 rendering (96 DPI standard)
  const baseWidth = orientation === 'portrait' ? 794 : 1123;
  const baseHeight = orientation === 'portrait' ? 1123 : 794;
  const scaleFactor = zoom / 100;

  // Selected Paper Theme styles
  const getPaperThemeClass = () => {
    switch (paperColor) {
      case 'warm-ivory':
        return 'bg-[#faf6eb] text-[#2d2c25] border-amber-100';
      case 'comfort-sepia':
        return 'bg-[#f4eccf] text-[#3a2a1a] border-amber-200';
      case 'dark-slate':
        return 'bg-gray-900 text-gray-100 border-gray-800 prose-invert';
      case 'classic-white':
      default:
        return 'bg-white text-gray-900 border-gray-250';
    }
  };

  // Check if cursor is inside a table, to render floating Table Actions
  const isInsideTable = editor.isActive('table');

  return (
    <div className="flex-1 bg-slate-100 p-8 overflow-y-auto overflow-x-auto flex flex-col items-center select-text relative scrollbar-thin">
      
      {/* Dynamic Table Actions Bar (Appears inline below header if inside table) */}
      {isInsideTable && (
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border border-blue-200 shadow-md rounded-md p-2 mb-6 flex items-center justify-start space-x-2 animate-fade-in text-xs font-semibold text-slate-700 max-w-fit pointer-events-auto">
          <div className="flex items-center space-x-1.5 text-blue-600 border-r border-slate-200 pr-2 mr-1">
            <Table size={14} className="shrink-0" />
            <span>Table Tools:</span>
          </div>

          <button
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="flex items-center space-x-1 hover:bg-slate-100 px-2 py-1 rounded transition text-[11px] font-medium"
            title="Add Row Above"
          >
            <ArrowUp size={12} className="text-gray-400" />
            <span>Row Above</span>
          </button>

          <button
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="flex items-center space-x-1 hover:bg-slate-100 px-2 py-1 rounded transition text-[11px] font-medium"
            title="Add Row Below"
          >
            <ArrowDown size={12} className="text-gray-400" />
            <span>Row Below</span>
          </button>

          <button
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="flex items-center space-x-1 hover:bg-slate-100 px-2 py-1 rounded transition text-[11px] font-medium"
            title="Add Column Before"
          >
            <ArrowLeft size={12} className="text-gray-400" />
            <span>Col Left</span>
          </button>

          <button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="flex items-center space-x-1 hover:bg-slate-100 px-2 py-1 rounded transition text-[11px] font-medium"
            title="Add Column After"
          >
            <ArrowRight size={12} className="text-gray-400" />
            <span>Col Right</span>
          </button>

          <span className="w-px h-5 bg-slate-200 mx-1"></span>

          <button
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="hover:bg-red-50 hover:text-red-600 text-slate-600 px-2 py-1 rounded transition text-[11px] font-medium"
            title="Delete Current Row"
          >
            Delete Row
          </button>

          <button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="hover:bg-red-50 hover:text-red-600 text-slate-600 px-2 py-1 rounded transition text-[11px] font-medium"
            title="Delete Current Column"
          >
            Delete Col
          </button>

          <button
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="flex items-center space-x-1 hover:bg-red-100 hover:text-red-700 text-red-600 px-2 py-1 rounded transition text-[11px] font-bold"
            title="Delete the entire Table"
          >
            <Trash2 size={12} />
            <span>Delete Table</span>
          </button>
        </div>
      )}

      {/* Margins Ruler Indicator (Aesthetic layout aid) */}
      <div 
        className="hidden md:flex items-center justify-between text-[10px] text-gray-400 select-none pb-2 font-mono h-4 shrink-0 transition-all duration-300"
        style={{ width: `${baseWidth * scaleFactor}px` }}
      >
        <div className="flex items-center space-x-1">
          <Milestone size={10} className="text-blue-500" />
          <span>Margin: {margin.name}</span>
        </div>
        <span>A4 Format • {orientation.toUpperCase()}</span>
      </div>

      {/* 
        A4 Responsive Workspace Scaler 
        Uses calculated base sizes and scaling offsets to allow 
        seamless layout sizing without messing up absolute positions.
      */}
      <div
        className="transition-all duration-200 flex items-start justify-center"
        style={{
          width: `${baseWidth * scaleFactor}px`,
          height: `${baseHeight * scaleFactor + 60}px`,
        }}
      >
        <div
          className={`shadow-xl border transition-all duration-300 transform rounded-xs hover:shadow-2xl relative select-text overflow-hidden ${getPaperThemeClass()}`}
          style={{
            transform: `scale(${scaleFactor})`,
            transformOrigin: 'top center',
            width: `${baseWidth}px`,
            minHeight: `${baseHeight}px`,
            boxSizing: 'border-box',
          }}
          id="a4-document-viewport"
        >
          {/* Inner Document Body Styled container */}
          <div 
            className={`w-full h-full min-h-[ inherit ] select-text focus:outline-hidden ${margin.className}`}
            style={{ boxSizing: 'border-box' }}
          >
            <EditorContent 
              editor={editor} 
              className="select-text h-full outline-hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
