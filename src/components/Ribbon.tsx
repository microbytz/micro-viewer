import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough, Code, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Undo, Redo, Table, Image as ImageIcon, Minus, Link as LinkIcon, FileText,
  HelpCircle, ChevronDown, Check, FolderOpen, Save, Plus, Trash2, FileDown,
  Palette, RefreshCw, Layers, Sparkles, Volume2, VolumeX, Eye, EyeOff
} from 'lucide-react';
import { RibbonTab, PageOrientation } from '../types';

interface RibbonProps {
  editor: Editor | null;
  activeTab: RibbonTab;
  setActiveTab: (tab: RibbonTab) => void;
  orientation: PageOrientation;
  setOrientation: (orientation: PageOrientation) => void;
  marginType: string;
  setMarginType: (type: string) => void;
  paperColor: string;
  setPaperColor: (color: string) => void;
  docTitle: string;
  setDocTitle: (title: string) => void;
  savedDocuments: Array<{ id: string; title: string; updatedAt: string }>;
  onSave: () => void;
  onNew: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (format: 'html' | 'markdown' | 'text') => void;
  isFocusMode: boolean;
  setIsFocusMode: (mode: boolean) => void;
  isSpeaking: boolean;
  onReadAloud: () => void;
}

const FONTS = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { name: 'Courier New', value: '"Courier New", Courier, monospace' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
];

const FONT_SIZES = [
  '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '28pt', '36pt', '48pt', '72pt'
];

const LINE_SPACINGS = [
  { name: 'Single (1.0)', value: '1.0' },
  { name: '1.15 Spacing', value: '1.15' },
  { name: '1.5 Spacing', value: '1.5' },
  { name: 'Double (2.0)', value: '2.0' },
  { name: 'Triple (3.0)', value: '3.0' },
];

const TEXT_COLORS = [
  { name: 'Default', value: '#111827' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Yellow', value: '#d97706' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Gray', value: '#4b5563' },
];

const HIGHLIGHT_COLORS = [
  { name: 'None', value: 'transparent' },
  { name: 'Yellow Highlighter', value: '#fef08a' },
  { name: 'Green Highlighter', value: '#bbf7d0' },
  { name: 'Blue Highlighter', value: '#bfdbfe' },
  { name: 'Pink Highlighter', value: '#fbcfe8' },
  { name: 'Orange Highlighter', value: '#fed7aa' },
];

export default function Ribbon({
  editor,
  activeTab,
  setActiveTab,
  orientation,
  setOrientation,
  marginType,
  setMarginType,
  paperColor,
  setPaperColor,
  docTitle,
  setDocTitle,
  savedDocuments,
  onSave,
  onNew,
  onLoad,
  onDelete,
  onExport,
  isFocusMode,
  setIsFocusMode,
  isSpeaking,
  onReadAloud,
}: RibbonProps) {
  // Dropdown States
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showSpacingDropdown, setShowSpacingDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showHighlightDropdown, setShowHighlightDropdown] = useState(false);
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [showTableSelect, setShowTableSelect] = useState(false);
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);

  // Table grid dimensions
  const [tableGrid, setTableGrid] = useState({ r: 3, c: 3 });

  // Outclick Refs
  const fontRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const spacingRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (fontRef.current && !fontRef.current.contains(e.target as Node)) setShowFontDropdown(false);
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) setShowSizeDropdown(false);
      if (spacingRef.current && !spacingRef.current.contains(e.target as Node)) setShowSpacingDropdown(false);
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setShowColorDropdown(false);
      if (highlightRef.current && !highlightRef.current.contains(e.target as Node)) setShowHighlightDropdown(false);
      if (fileRef.current && !fileRef.current.contains(e.target as Node)) setShowFileDropdown(false);
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) setShowTableSelect(false);
      if (headingRef.current && !headingRef.current.contains(e.target as Node)) setShowHeadingDropdown(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!editor) {
    return (
      <div className="bg-gray-50 border-b border-gray-200 h-32 flex items-center justify-center text-gray-400">
        Initializing Ribbon Controls...
      </div>
    );
  }

  // Formatting helpers
  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleStrikethrough = () => editor.chain().focus().toggleStrike().run();
  const toggleCode = () => editor.chain().focus().toggleCode().run();

  const setFontFamily = (family: string) => {
    editor.chain().focus().setFontFamily(family).run();
    setShowFontDropdown(false);
  };

  const setFontSize = (size: string) => {
    editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
    setShowSizeDropdown(false);
  };

  const applyTextColor = (color: string) => {
    editor.chain().focus().setMark('textStyle', { color }).run();
    setShowColorDropdown(false);
  };

  const applyHighlightColor = (bgColor: string) => {
    if (bgColor === 'transparent') {
      editor.chain().focus().setMark('textStyle', { backgroundColor: null }).run();
    } else {
      editor.chain().focus().setMark('textStyle', { backgroundColor: bgColor }).run();
    }
    setShowHighlightDropdown(false);
  };

  const clearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  const setHeading = (level: 1 | 2 | 3 | 0) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
    setShowHeadingDropdown(false);
  };

  const setAlignment = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    editor.chain().focus().setTextAlign(alignment).run();
  };

  const applyLineHeight = (height: string) => {
    editor.chain().focus().updateAttributes('paragraph', { lineHeight: height }).updateAttributes('heading', { lineHeight: height }).run();
    setShowSpacingDropdown(false);
  };

  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();

  // Insert elements
  const insertHorizontalLine = () => editor.chain().focus().setHorizontalRule().run();

  const insertTable = (r: number, c: number) => {
    // using clean schema
    (editor.chain().focus() as any).insertTable({ rows: r, cols: c, withHeaderRow: true }).run();
    setShowTableSelect(false);
  };

  const insertImage = () => {
    const url = window.prompt('Enter Image URL:', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter Link URL:', previousUrl || 'https://');
    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  // Get active items for selectors
  const getActiveFont = () => {
    const attrs = editor.getAttributes('textStyle');
    if (!attrs || !attrs.fontFamily) return 'Inter';
    const found = FONTS.find(f => f.value === attrs.fontFamily || f.name === attrs.fontFamily);
    return found ? found.name : 'Custom';
  };

  const getActiveSize = () => {
    const attrs = editor.getAttributes('textStyle');
    return attrs && attrs.fontSize ? attrs.fontSize : '11pt';
  };

  const getActiveHeadingLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    return 'Normal Body';
  };

  return (
    <div className="bg-white border-b border-gray-200 select-none shadow-xs flex flex-col w-full shrink-0">
      {/* 1. Title bar & File actions */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white rounded-md p-1.5 flex items-center justify-center">
            <FileText size={18} id="app-logo-icon" />
          </div>
          <div className="flex items-center space-x-1">
            <input
              type="text"
              id="document-title-input"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="text-sm font-semibold text-gray-700 bg-transparent hover:bg-gray-200/50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-0.5 outline-hidden transition max-w-[200px]"
              title="Click to rename document"
            />
            <span className="text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded font-medium transition cursor-pointer">
              Cloud Saved (Local)
            </span>
          </div>
        </div>

        {/* Top bar operations / Quick Access */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1 px-1.5 rounded-sm hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={14} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1 px-1.5 rounded-sm hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={14} />
          </button>

          <span className="w-px h-5 bg-gray-200 mx-1"></span>

          {/* Read Aloud Text Speech synthesis */}
          <button
            onClick={onReadAloud}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-sm text-xs font-bold transition duration-150 shrink-0 select-none cursor-pointer ${
              isSpeaking
                ? 'bg-red-550 text-white shadow-inner animate-pulse hover:bg-red-650'
                : 'bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800'
            }`}
            id="read-aloud-button-quick"
            title={isSpeaking ? "Stop Speaking" : "Read Aloud: selects selected text or falls back to entire page text"}
          >
            {isSpeaking ? <VolumeX size={13} className="shrink-0" /> : <Volume2 size={13} className="shrink-0" />}
            <span>{isSpeaking ? "Stop Voice" : "Read Aloud"}</span>
          </button>

          {/* Persistent Focus Mode Button */}
          <button
            onClick={() => setIsFocusMode(true)}
            className="flex items-center space-x-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 hover:border-amber-300 px-3 py-1.5 rounded-sm text-xs font-bold cursor-pointer transition"
            id="focus-mode-toggle-quick"
            title="Focus Mode: Hides ribbon and bottom stats bar for distraction-free typing"
          >
            <Eye size={13} className="shrink-0 text-amber-600" />
            <span>Focus</span>
          </button>

          <span className="w-px h-5 bg-gray-200 mx-1"></span>

          {/* Persistent Save Button with animated loading state */}
          <button
            onClick={onSave}
            className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-sm text-xs font-semibold cursor-pointer shadow-xs hover:shadow-md transition duration-150"
            id="save-button-header"
          >
            <Save size={14} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* 2. Ribbon Tabs Navigation */}
      <div className="flex items-end px-3 bg-gray-50 border-b border-gray-100 pt-1">
        {/* File Dropdown Selector */}
        <div className="relative mb-[-1px] z-50 mr-1" ref={fileRef}>
          <button
            onClick={() => setShowFileDropdown(!showFileDropdown)}
            className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded-t-[3px] border-t border-x transition cursor-pointer ${
              showFileDropdown
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-transparent text-blue-700 border-transparent hover:bg-gray-200'
            }`}
          >
            <span>File</span>
            <ChevronDown size={12} />
          </button>

          {showFileDropdown && (
            <div className="absolute left-0 mt-0.5 w-[240px] bg-white border border-gray-200 rounded-md shadow-xl py-1 z-50 text-xs">
              <button
                onClick={() => {
                  onNew();
                  setShowFileDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center space-x-2.5 transition"
              >
                <Plus size={14} className="text-gray-400" />
                <div className="flex flex-col">
                  <span className="font-semibold">New Document</span>
                  <span className="text-[10px] text-gray-400">Blank starting canvas</span>
                </div>
              </button>
              <button
                onClick={() => {
                  onSave();
                  setShowFileDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center space-x-2.5 transition"
              >
                <Save size={14} className="text-gray-400" />
                <div className="flex flex-col">
                  <span className="font-semibold">Save Document</span>
                  <span className="text-[10px] text-gray-400">Commit to system browser storage</span>
                </div>
              </button>

              <hr className="my-1 border-gray-100" />

              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Load Saved Documents ({savedDocuments.length})
              </div>
              {savedDocuments.length === 0 ? (
                <div className="px-4 py-1.5 text-gray-400 italic text-[11px]">No saved documents. Click Save above!</div>
              ) : (
                <div className="max-h-[160px] overflow-y-auto">
                  {savedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="group flex items-center justify-between px-4 py-1.5 hover:bg-slate-50 text-gray-700 font-semibold text-left select-none transition"
                    >
                      <button
                        onClick={() => {
                          onLoad(doc.id);
                          setShowFileDropdown(false);
                        }}
                        className="text-left truncate flex-1 block hover:text-blue-600 font-medium"
                        title={doc.title}
                      >
                        {doc.title}
                      </button>
                      <button
                        onClick={() => onDelete(doc.id)}
                        className="text-red-400 hover:text-red-600 transition shrink-0 opacity-0 group-hover:opacity-100 p-0.5 ml-2"
                        title="Delete document"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <hr className="my-1 border-gray-100" />

              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Export Options
              </div>
              <button
                onClick={() => {
                  onExport('html');
                  setShowFileDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center space-x-2.5 transition"
              >
                <FileDown size={14} className="text-gray-400" />
                <div className="flex flex-col">
                  <span className="font-medium">Download HTML Document</span>
                  <span className="text-[10px] text-gray-400">Great for web rendering models</span>
                </div>
              </button>
              <button
                onClick={() => {
                  onExport('markdown');
                  setShowFileDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center space-x-2.5 transition"
              >
                <FileDown size={14} className="text-gray-400" />
                <div className="flex flex-col">
                  <span className="font-medium">Download Markdown (.md)</span>
                  <span className="text-[10px] text-gray-400">Plain text system style formatting</span>
                </div>
              </button>
              <button
                onClick={() => {
                  onExport('text');
                  setShowFileDropdown(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 flex items-center space-x-2.5 transition"
              >
                <FileDown size={14} className="text-gray-400" />
                <div className="flex flex-col">
                  <span className="font-medium">Export raw readable text</span>
                  <span className="text-[10px] text-gray-400">Removes structural coding markers</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Home, Insert, Layout, Help Tabs */}
        {(['home', 'insert', 'layout', 'help'] as RibbonTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setShowFileDropdown(false);
            }}
            className={`px-4 py-1.5 text-xs font-semibold rounded-t-[3px] border-t border-x cursor-pointer transition capitalize ${
              activeTab === tab
                ? 'bg-white border-gray-200 text-blue-600 font-bold border-b-white z-20'
                : 'bg-transparent text-gray-600 border-transparent hover:bg-gray-200/50 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Ribbon Controls Panel */}
      <div className="bg-white px-4 py-2 flex items-center justify-start flex-wrap space-y-1 sm:space-y-0 text-gray-700 min-h-[76px] shadow-xs select-none">
        
        {/* ======================= HOME TAB ======================= */}
        {activeTab === 'home' && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 w-full">
            {/* History section */}
            <div className="flex flex-col items-center border-r border-gray-100 pr-3 last:border-0">
              <div className="flex items-center space-x-0.5">
                <button
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="p-1 px-1.5 rounded-sm hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo size={15} />
                </button>
                <button
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="p-1 px-1.5 rounded-sm hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo size={15} />
                </button>
              </div>
              <span className="text-[9px] text-gray-400 uppercase mt-auto leading-none font-semibold tracking-wider">History</span>
            </div>

            {/* Font Family Selector */}
            <div className="flex flex-col items-stretch border-r border-gray-100 pr-3" ref={fontRef}>
              <div className="relative">
                <button
                  onClick={() => setShowFontDropdown(!showFontDropdown)}
                  className="flex items-center justify-between text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50/50 hover:bg-gray-100 w-36 text-left"
                >
                  <span className="truncate font-medium">{getActiveFont()}</span>
                  <ChevronDown size={12} className="text-gray-400" />
                </button>

                {showFontDropdown && (
                  <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 text-xs">
                    {FONTS.map((font) => (
                      <button
                        key={font.name}
                        onClick={() => setFontFamily(font.value)}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-100 flex items-center justify-between font-semibold"
                        style={{ fontFamily: font.value }}
                      >
                        <span>{font.name}</span>
                        {editor.getAttributes('textStyle').fontFamily === font.value && (
                          <Check size={12} className="text-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[9px] text-gray-400 uppercase text-center mt-auto leading-none font-semibold tracking-wider">Font Family</span>
            </div>

            {/* Font Size Selector */}
            <div className="flex flex-col items-stretch border-r border-gray-100 pr-3" ref={sizeRef}>
              <div className="relative">
                <button
                  onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                  className="flex items-center justify-between text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50/50 hover:bg-gray-100 w-20 text-left"
                >
                  <span className="font-semibold">{getActiveSize()}</span>
                  <ChevronDown size={12} className="text-gray-400" />
                </button>

                {showSizeDropdown && (
                  <div className="absolute left-0 mt-1 w-24 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 text-xs max-h-56 overflow-y-auto">
                    {FONT_SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className="w-full text-left px-3 py-1.25 hover:bg-gray-100 flex items-center justify-between font-medium"
                      >
                        <span>{size}</span>
                        {editor.getAttributes('textStyle').fontSize === size && (
                          <Check size={12} className="text-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[9px] text-gray-400 uppercase text-center mt-auto leading-none font-semibold tracking-wider">Font Size</span>
            </div>

            {/* Text Styling (Bold, Italic, Underline) */}
            <div className="flex flex-col items-center border-r border-gray-100 pr-3">
              <div className="flex bg-gray-100/50 rounded-sm p-0.5 border border-gray-200">
                <button
                  onClick={toggleBold}
                  className={`p-1 px-1.5 rounded-sm transition cursor-pointer font-bold ${
                    editor.isActive('bold')
                      ? 'bg-white shadow-xs text-blue-600 border border-gray-200'
                      : 'hover:bg-gray-200/50 text-gray-600'
                  }`}
                  title="Bold (Ctrl+B)"
                >
                  <Bold size={14} />
                </button>
                <button
                  onClick={toggleItalic}
                  className={`p-1 px-1.5 rounded-sm transition cursor-pointer inline-block ${
                    editor.isActive('italic')
                      ? 'bg-white shadow-xs text-blue-600 border border-gray-200'
                      : 'hover:bg-gray-200/50 text-gray-600'
                  }`}
                  title="Italic (Ctrl+I)"
                >
                  <Italic size={14} />
                </button>
                <button
                  onClick={toggleUnderline}
                  className={`p-1 px-1.5 rounded-sm transition cursor-pointer inline-block ${
                    editor.isActive('underline')
                      ? 'bg-white shadow-xs text-blue-600 border border-gray-200'
                      : 'hover:bg-gray-200/50 text-gray-600'
                  }`}
                  title="Underline (Ctrl+U)"
                >
                  <Underline size={14} />
                </button>
                <button
                  onClick={toggleStrikethrough}
                  className={`p-1 px-1.5 rounded-sm transition cursor-pointer inline-block ${
                    editor.isActive('strike')
                      ? 'bg-white shadow-xs text-blue-600 border border-gray-200'
                      : 'hover:bg-gray-200/50 text-gray-600'
                  }`}
                  title="Strikethrough"
                >
                  <Strikethrough size={14} />
                </button>
                <button
                  onClick={toggleCode}
                  className={`p-1 px-1.5 rounded-sm transition cursor-pointer inline-block ${
                    editor.isActive('code')
                      ? 'bg-white shadow-xs text-blue-600 border border-gray-200 font-mono text-xs'
                      : 'hover:bg-gray-200/50 text-gray-600 font-mono'
                  }`}
                  title="Code Mark"
                >
                  <Code size={14} />
                </button>
              </div>
              <span className="text-[9px] text-gray-400 uppercase text-center mt-auto leading-none font-semibold tracking-wider">Style</span>
            </div>

            {/* Colors Section */}
            <div className="flex flex-col items-center border-r border-gray-100 pr-3">
              <div className="flex space-x-1.5">
                {/* Text Color Dropdown */}
                <div className="relative" ref={colorRef}>
                  <button
                    onClick={() => setShowColorDropdown(!showColorDropdown)}
                    className="p-1 px-1.5 rounded hover:bg-gray-100 text-gray-700 border border-gray-200 bg-gray-50/50 flex items-center space-x-1"
                    title="Font Color"
                  >
                    <span className="font-bold underline text-xs" style={{ color: editor.getAttributes('textStyle').color || '#111827' }}>A</span>
                    <Palette size={12} className="text-gray-400" />
                  </button>
                  {showColorDropdown && (
                    <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg p-2.5 z-50 text-xs text-center">
                      <div className="grid grid-cols-4 gap-1.5">
                        {TEXT_COLORS.map((tc) => (
                          <button
                            key={tc.name}
                            onClick={() => applyTextColor(tc.value)}
                            className="w-6 h-6 rounded-full border border-gray-200 block shadow-2xs hover:scale-110 transition cursor-pointer"
                            style={{ backgroundColor: tc.value }}
                            title={tc.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Text Highlight Dropdown */}
                <div className="relative" ref={highlightRef}>
                  <button
                    onClick={() => setShowHighlightDropdown(!showHighlightDropdown)}
                    className="p-1 px-1.5 rounded hover:bg-gray-100 text-gray-700 border border-gray-200 bg-gray-50/50 flex items-center space-x-1"
                    title="Text Highlight Color"
                  >
                    <span className="font-bold text-xs bg-yellow-200 px-0.5 rounded text-gray-800">ab</span>
                    <Palette size={12} className="text-gray-400" />
                  </button>
                  {showHighlightDropdown && (
                    <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg p-2.5 z-50 text-xs text-center">
                      <div className="grid grid-cols-3 gap-2">
                        {HIGHLIGHT_COLORS.map((hc) => (
                          <button
                            key={hc.name}
                            onClick={() => applyHighlightColor(hc.value)}
                            className={`w-full h-6 rounded border border-gray-300 block hover:scale-105 transition cursor-pointer relative ${
                              hc.value === 'transparent' ? 'bg-slate-50 relative overflow-hidden' : ''
                            }`}
                            style={{ backgroundColor: hc.value === 'transparent' ? undefined : hc.value }}
                            title={hc.name}
                          >
                            {hc.value === 'transparent' && (
                              <div className="absolute inset-0 flex items-center justify-center text-[9px] text-gray-600 font-bold uppercase select-none">Ø</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Clear spacing/styling */}
                <button
                  onClick={clearFormatting}
                  className="p-1 px-1.5 rounded hover:bg-gray-100 text-gray-400 border border-gray-200 bg-gray-50/50"
                  title="Clear formatting"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
              <span className="text-[9px] text-gray-400 uppercase mt-auto leading-none font-semibold tracking-wider">Color</span>
            </div>

            {/* Paragraph Section (Alignment/Spacing/Headers) */}
            <div className="flex flex-col items-center border-r border-gray-100 pr-3">
              <div className="flex items-center space-x-1">
                {/* Heading Type Selector */}
                <div className="relative" ref={headingRef}>
                  <button
                    onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
                    className="flex items-center justify-between text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50/50 hover:bg-gray-100 w-28 text-left"
                  >
                    <span className="truncate font-semibold">{getActiveHeadingLabel()}</span>
                    <ChevronDown size={11} className="text-gray-400 shrink-0" />
                  </button>

                  {showHeadingDropdown && (
                    <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 text-xs">
                      <button
                        onClick={() => setHeading(0)}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-100"
                      >
                        <span className="text-gray-800 font-medium">Normal Body</span>
                      </button>
                      <button
                        onClick={() => setHeading(1)}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-100 font-bold text-lg"
                      >
                        <span className="text-gray-950 font-extrabold text-sm">Heading 1</span>
                      </button>
                      <button
                        onClick={() => setHeading(2)}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-100 font-bold text-base"
                      >
                        <span className="text-gray-950 font-bold text-xs">Heading 2</span>
                      </button>
                      <button
                        onClick={() => setHeading(3)}
                        className="w-full text-left px-3 py-1.5 hover:bg-gray-100 font-bold text-sm"
                      >
                        <span className="text-gray-950 font-semibold text-xs border-b border-gray-300">Heading 3</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Paragraph Alignment controls */}
                <div className="flex bg-gray-100/50 rounded p-0.5 border border-gray-200">
                  <button
                    onClick={() => setAlignment('left')}
                    className={`p-1 rounded-sm transition cursor-pointer ${
                      editor.isActive({ textAlign: 'left' })
                        ? 'bg-white shadow-xs text-blue-600 font-bold'
                        : 'hover:bg-gray-200/50 text-gray-600'
                    }`}
                    title="Align Left"
                  >
                    <AlignLeft size={13} />
                  </button>
                  <button
                    onClick={() => setAlignment('center')}
                    className={`p-1 rounded-sm transition cursor-pointer ${
                      editor.isActive({ textAlign: 'center' })
                        ? 'bg-white shadow-xs text-blue-600 font-bold'
                        : 'hover:bg-gray-200/50 text-gray-600'
                    }`}
                    title="Align Center"
                  >
                    <AlignCenter size={13} />
                  </button>
                  <button
                    onClick={() => setAlignment('right')}
                    className={`p-1 rounded-sm transition cursor-pointer ${
                      editor.isActive({ textAlign: 'right' })
                        ? 'bg-white shadow-xs text-blue-600 font-bold'
                        : 'hover:bg-gray-200/50 text-gray-600'
                    }`}
                    title="Align Right"
                  >
                    <AlignRight size={13} />
                  </button>
                  <button
                    onClick={() => setAlignment('justify')}
                    className={`p-1 rounded-sm transition cursor-pointer ${
                      editor.isActive({ textAlign: 'justify' })
                        ? 'bg-white shadow-xs text-blue-600 font-bold'
                        : 'hover:bg-gray-200/50 text-gray-600'
                    }`}
                    title="Justify"
                  >
                    <AlignJustify size={13} />
                  </button>
                </div>

                {/* Line Spacing Selector */}
                <div className="relative" ref={spacingRef}>
                  <button
                    onClick={() => setShowSpacingDropdown(!showSpacingDropdown)}
                    className="p-1 px-1.5 rounded hover:bg-gray-100 text-gray-700 border border-gray-200 bg-gray-50/50 flex items-center space-x-1"
                    title="Line Spacing"
                  >
                    <Layers size={13} />
                    <ChevronDown size={10} className="text-gray-400" />
                  </button>
                  {showSpacingDropdown && (
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 text-xs text-left">
                      {LINE_SPACINGS.map((spacing) => (
                        <button
                          key={spacing.value}
                          onClick={() => applyLineHeight(spacing.value)}
                          className="w-full text-left px-3 py-1.5 hover:bg-gray-100 font-medium"
                        >
                          {spacing.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[9px] text-gray-400 uppercase mt-auto leading-none font-semibold tracking-wider">Paragraph</span>
            </div>

            {/* List Type buttons */}
            <div className="flex flex-col items-center">
              <div className="flex bg-gray-100/50 rounded-sm p-0.5 border border-gray-200">
                <button
                  onClick={toggleBulletList}
                  className={`p-1 px-1.5 rounded-sm transition cursor-pointer ${
                    editor.isActive('bulletList')
                      ? 'bg-white shadow-xs text-blue-600 font-bold'
                      : 'hover:bg-gray-200/50 text-gray-600'
                  }`}
                  title="Bulleted List"
                >
                  <List size={14} />
                </button>
                <button
                  onClick={toggleOrderedList}
                  className={`p-1 px-1.5 rounded-sm transition cursor-pointer ${
                    editor.isActive('orderedList')
                      ? 'bg-white shadow-xs text-blue-600 font-bold'
                      : 'hover:bg-gray-200/50 text-gray-600'
                  }`}
                  title="Numbered List"
                >
                  <ListOrdered size={14} />
                </button>
              </div>
              <span className="text-[9px] text-gray-400 uppercase mt-auto leading-none font-semibold tracking-wider">Lists</span>
            </div>
          </div>
        )}

        {/* ======================= INSERT TAB ======================= */}
        {activeTab === 'insert' && (
          <div className="flex items-center gap-x-4 flex-wrap text-xs">
            {/* Table insert tool */}
            <div className="relative flex flex-col items-center border-r border-gray-150 pr-4" ref={tableRef}>
              <button
                onClick={() => setShowTableSelect(!showTableSelect)}
                className="flex items-center space-x-1.5 px-3 py-1 text-xs border border-gray-200 rounded hover:bg-slate-50 relative bg-gray-50/50"
              >
                <Table size={14} className="text-blue-600" />
                <span className="font-semibold">Table</span>
                <ChevronDown size={11} className="text-gray-400" />
              </button>

              {showTableSelect && (
                <div className="absolute left-0 mt-8 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-50 text-[11px] text-center w-48">
                  <div className="font-semibold text-gray-500 mb-1.5">Insert Table Matrix</div>
                  
                  {/* Visual Grid Selector */}
                  <div className="grid grid-cols-5 gap-1 mb-2.5 max-w-fit mx-auto">
                    {Array.from({ length: 5 }).map((_, rIdx) => (
                      <div key={rIdx} className="flex">
                        {Array.from({ length: 5 }).map((_, cIdx) => {
                          const rNum = rIdx + 1;
                          const cNum = cIdx + 1;
                          const active = rNum <= tableGrid.r && cNum <= tableGrid.c;
                          return (
                            <button
                              key={cIdx}
                              onMouseEnter={() => setTableGrid({ r: rNum, c: cNum })}
                              onClick={() => insertTable(tableGrid.r, tableGrid.c)}
                              className={`w-4 h-4 rounded-3xs border transition duration-75 mx-0.5 ${
                                active ? 'bg-blue-500 border-blue-600' : 'bg-gray-100 border-gray-200'
                              }`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-400 mb-2 font-bold uppercase">
                    Grid Size: {tableGrid.r} rows x {tableGrid.c} columns
                  </div>

                  <button
                    onClick={() => {
                      const r = parseInt(window.prompt('Enter number of rows (1-20):', '3') || '0');
                      const c = parseInt(window.prompt('Enter number of columns (1-20):', '3') || '0');
                      if (r > 0 && c > 0) insertTable(r, c);
                    }}
                    className="w-full py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold text-blue-600"
                  >
                    Custom Table Dimensions...
                  </button>
                </div>
              )}
              <span className="text-[9px] text-gray-400 uppercase mt-1 leading-none font-semibold tracking-wider">Tables</span>
            </div>

            {/* Image insert tool */}
            <div className="flex flex-col items-center border-r border-gray-150 pr-4">
              <button
                onClick={insertImage}
                className="flex items-center space-x-1.5 px-3 py-1.5 border border-gray-250 rounded hover:bg-slate-50 bg-gray-50/50"
              >
                <ImageIcon size={14} className="text-emerald-600" />
                <span className="font-semibold text-gray-700">Add Cover/Image</span>
              </button>
              <span className="text-[9px] text-gray-400 uppercase mt-1 leading-none font-semibold tracking-wider">Illustrations</span>
            </div>

            {/* Links, Dividers, Break lines */}
            <div className="flex flex-col items-center border-r border-gray-150 pr-4">
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={insertLink}
                  className={`flex items-center space-x-1 px-3 py-1.5 border rounded hover:bg-slate-50 transition cursor-pointer bg-gray-50/50 ${
                    editor.isActive('link') ? 'bg-blue-50 border-blue-500' : 'border-gray-250'
                  }`}
                  title="Insert Hyperlink"
                >
                  <LinkIcon size={13} className="text-orange-600" />
                  <span className="font-semibold text-gray-700">Hyperlink</span>
                </button>

                <button
                  onClick={insertHorizontalLine}
                  className="flex items-center space-x-1 px-3 py-1.5 border border-gray-250 rounded hover:bg-slate-50 font-semibold bg-gray-50/50"
                  title="Insert horizontal row divider"
                >
                  <Minus size={13} className="text-indigo-600" />
                  <span className="text-gray-700 font-semibold">Horizontal Rule</span>
                </button>
              </div>
              <span className="text-[9px] text-gray-400 uppercase mt-1 leading-none font-semibold tracking-wider">Links & Dividers</span>
            </div>

            {/* Extra formatting help text */}
            <div className="hidden md:flex items-center space-x-1.5 text-gray-400 select-none italic text-[11px] ml-auto">
              <Sparkles size={12} className="text-blue-500 shrink-0" />
              <span>Full table controls available under selection handles</span>
            </div>
          </div>
        )}

        {/* ======================= LAYOUT TAB ======================= */}
        {activeTab === 'layout' && (
          <div className="flex items-center gap-x-5 flex-wrap text-xs">
            {/* Margins */}
            <div className="flex flex-col items-center border-r border-gray-150 pr-5">
              <div className="flex items-center space-x-1 bg-gray-50/50 border border-gray-200 rounded p-0.5">
                {(['normal', 'narrow', 'wide'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMarginType(m)}
                    className={`px-2.5 py-1 text-2xs font-bold rounded-sm uppercase transition cursor-pointer ${
                      marginType === m
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-150'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-gray-400 uppercase mt-1 leading-none font-semibold tracking-wider">Margins</span>
            </div>

            {/* Page Orientation */}
            <div className="flex flex-col items-center border-r border-gray-150 pr-5">
              <div className="flex items-center space-x-1 bg-gray-50/50 border border-gray-200 rounded p-0.5">
                {(['portrait', 'landscape'] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrientation(o)}
                    className={`px-2.5 py-1 text-2xs font-bold rounded-sm uppercase transition cursor-pointer ${
                      orientation === o
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-150'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-gray-400 uppercase mt-1 leading-none font-semibold tracking-wider">Orientation</span>
            </div>

            {/* Paper Theme selector */}
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-1.5 bg-gray-50/50 border border-gray-200 rounded-sm p-1">
                {[
                  { key: 'classic-white', name: 'White', bg: 'bg-white border-gray-300' },
                  { key: 'warm-ivory', name: 'Ivory', bg: 'bg-[#faf6eb] border-amber-200' },
                  { key: 'comfort-sepia', name: 'Sepia', bg: 'bg-[#f4eccf] border-amber-300' },
                  { key: 'dark-slate', name: 'Midnight', bg: 'bg-gray-900 border-gray-700' },
                ].map((col) => (
                  <button
                    key={col.key}
                    onClick={() => setPaperColor(col.key)}
                    className={`w-4 h-4 rounded-full border shadow-2xs transition hover:scale-110 cursor-pointer flex items-center justify-center ${col.bg}`}
                    title={`Set Paper Color: ${col.name}`}
                  >
                    {paperColor === col.key && (
                      <div className={`w-1.5 h-1.5 rounded-full ${col.key === 'dark-slate' ? 'bg-white' : 'bg-blue-600'}`}></div>
                    )}
                  </button>
                ))}
              </div>
              <span className="text-[9px] text-gray-400 uppercase mt-1 leading-none font-semibold tracking-wider">Paper Color</span>
            </div>
          </div>
        )}

        {/* ======================= HELP TAB ======================= */}
        {activeTab === 'help' && (
          <div className="flex items-center justify-between w-full text-xs text-gray-500 py-1 font-semibold">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded">
                <span className="bg-slate-200 px-1 py-0.25 rounded text-[10px] font-mono shadow-3xs">Ctrl + B / I / U</span>
                <span>Bold, Italic, Underline</span>
              </div>
              <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded">
                <span className="bg-slate-200 px-1 py-0.25 rounded text-[10px] font-mono shadow-3xs">* space</span>
                <span>Quick Bulleted lists</span>
              </div>
              <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded">
                <span className="bg-slate-200 px-1 py-0.25 rounded text-[10px] font-mono shadow-3xs"># space</span>
                <span>Heading creation triggers</span>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium">
              <HelpCircle size={14} className="shrink-0 animate-pulse" />
              <span>Full rich document canvas persistence loaded locally</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
