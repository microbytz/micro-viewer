import React, { useState, useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';

// Custom extensions and sub-components
import { FontSize, TextColor, HighlightColor, LineHeight, TextAlign } from './components/Extensions';
import Ribbon from './components/Ribbon';
import Canvas from './components/Canvas';
import StatusBar from './components/StatusBar';
import { RibbonTab, PageOrientation, SavedDocument, DocumentOutlineItem } from './types';
import { 
  Menu, Compass, HelpCircle, FileText, Check, ChevronRight, X, Info, NotebookTabs,
  Eye, EyeOff, Volume2, VolumeX
} from 'lucide-react';

const INITIAL_TEMPLATE = `
<h1>Annual Business Growth Report</h1>
<p>Welcome to your professional desktop-grade <strong>Document Editor</strong>! This interactive canvas is designed to feel identical in layout, typography, and controls to Microsoft Word. It is powered by <em>React</em>, <em>TypeScript</em>, and a highly responsive <em>ProseMirror editor engine</em>.</p>

<h2>Core Formatting Features</h2>
<p>This platform fully supports Phase 1 text operations. Feel free to type anywhere, double-click words to apply styles, or structure thoughts using bulleted lists:</p>
<ul>
  <li><strong>Typographical Options:</strong> Select between classic fonts (<em>Georgia</em>, <em>Inter</em>, <em>Times New Roman</em>, or <em>Courier</em>) and font sizes ranging up to 72pt.</li>
  <li><strong>Aesthetic Layouts:</strong> Explore the <strong>Layout Tab</strong> to alter page margins, toggle landscape orientation, or apply comfortable, warm sepia paper backings.</li>
  <li><strong>Line & Spacing:</strong> Align text block elements left, right, centered, or justified, and scale spacing from single line (1.0) to triple line (3.0).</li>
</ul>

<h2>Advanced Elements: Tables & Images</h2>
<p>To demonstrate production-grade readiness, we have integrated functional tables and images. Select inside the table cells below to trigger the <strong>Table Context Menu</strong> in the canvas top margin:</p>

<table>
  <thead>
    <tr>
      <th>Project Milestone</th>
      <th>Q1 Performance</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Redesign Ribbon Layout</td>
      <td>114% of Target</td>
      <td><span style="color: #16a34a"><strong>Completed</strong></span></td>
    </tr>
    <tr>
      <td>Synchronize Selection Marks</td>
      <td>95% of Target</td>
      <td><span style="color: #2563eb"><strong>Active</strong></span></td>
    </tr>
    <tr>
      <td>Phase 2 Production Build</td>
      <td>Scheduled</td>
      <td><span style="color: #d97706"><strong>Pending</strong></span></td>
    </tr>
  </tbody>
</table>

<blockquote>
  <p>"Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed."</p>
</blockquote>
`;

export default function App() {
  // App-level document preferences
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [marginType, setMarginType] = useState<string>('normal');
  const [paperColor, setPaperColor] = useState<string>('classic-white');
  const [zoom, setZoom] = useState<number>(100);
  
  // Storage & Management states
  const [docTitle, setDocTitle] = useState<string>('Annual Business Report');
  const [currentDocId, setCurrentDocId] = useState<string>('default-doc-id');
  const [savedDocsList, setSavedDocsList] = useState<Array<{ id: string; title: string; updatedAt: string }>>([]);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Layout sidebar
  const [showOutline, setShowOutline] = useState<boolean>(true);
  const [outline, setOutline] = useState<DocumentOutlineItem[]>([]);

  // Phase 1.5 States
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);

  // Focus Mode ESC key listener & Speaking unmount cleanup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-To-Speech function
  const handleReadAloud = () => {
    if (!window.speechSynthesis) {
      window.alert("Web Speech API is not supported in this browser environment.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let textToRead = '';
    if (editor) {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        textToRead = editor.state.doc.textBetween(from, to, ' ').trim();
      }
      if (!textToRead) {
        textToRead = editor.getText();
      }
    }

    if (!textToRead || textToRead.trim() === '') {
      window.alert("Please type some context first or make a selection to read aloud.");
      return;
    }

    // Stop any current utterance
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Stats calculators
  const getStats = () => {
    const text = editor ? editor.getText() : '';
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const charsWithSpaces = text.replace(/\r?\n/g, '').length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    const lines = text.split('\n').filter(l => l.trim().length > 0).length || 1;
    const pages = Math.ceil(words / 500) || 1;

    const readingTimeMin = words / 200;
    const readingTimeStr = readingTimeMin < 1 
      ? `${Math.max(1, Math.round(readingTimeMin * 60))} sec` 
      : `${Math.ceil(readingTimeMin)} min`;

    const speakingTimeMin = words / 140;
    const speakingTimeStr = speakingTimeMin < 1 
      ? `${Math.max(1, Math.round(speakingTimeMin * 60))} sec` 
      : `${Math.ceil(speakingTimeMin)} min`;

    return {
      words,
      charsWithSpaces,
      charsNoSpaces,
      paragraphs,
      lines,
      pages,
      readingTimeStr,
      speakingTimeStr
    };
  };

  // Initialize TipTap
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline font-semibold',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        allowBase64: true,
      }),
      FontSize,
      TextColor,
      HighlightColor,
      LineHeight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: INITIAL_TEMPLATE,
    onUpdate({ editor: editorInstance }) {
      handleParseOutline(editorInstance);
    },
    onSelectionUpdate({ editor: editorInstance }) {
      handleParseOutline(editorInstance);
    },
  });

  // Load Saved Document Index on launch
  useEffect(() => {
    const listJson = localStorage.getItem('document_index_list');
    if (listJson) {
      const parsed = JSON.parse(listJson);
      setSavedDocsList(parsed);
      
      // If there exists articles, load the first one or default
      if (parsed.length > 0) {
        const lastUsedId = localStorage.getItem('last_active_doc_id') || parsed[0].id;
        loadDocumentFromId(lastUsedId, parsed);
      } else {
        // Seeding default doc index
        seedDefaultDocument();
      }
    } else {
      seedDefaultDocument();
    }
  }, [editor]); // Run when editor becomes ready

  const seedDefaultDocument = () => {
    const defaultId = 'default-doc-id';
    const initialDoc: SavedDocument = {
      id: defaultId,
      title: 'Annual Business Report',
      content: INITIAL_TEMPLATE,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    localStorage.setItem(`doc_content_${defaultId}`, JSON.stringify(initialDoc));
    const list = [{ id: defaultId, title: initialDoc.title, updatedAt: initialDoc.updatedAt }];
    localStorage.setItem('document_index_list', JSON.stringify(list));
    setSavedDocsList(list);
    setCurrentDocId(defaultId);
    setDocTitle(initialDoc.title);
    
    if (editor) {
      editor.commands.setContent(INITIAL_TEMPLATE);
      handleParseOutline(editor);
    }
  };

  // Safe outline parsing using ProseMirror Syntax Tree descendants
  const handleParseOutline = (editorInstance: any) => {
    if (!editorInstance) return;
    const list: DocumentOutlineItem[] = [];
    
    editorInstance.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === 'heading') {
        const text = node.textContent;
        const level = node.attrs.level;
        list.push({
          id: `heading-${pos}`,
          text: text || '(Empty Heading)',
          level,
        });
      }
    });
    setOutline(list);
  };

  const loadDocumentFromId = (id: string, customList?: typeof savedDocsList) => {
    const docData = localStorage.getItem(`doc_content_${id}`);
    if (docData && editor) {
      const parsed: SavedDocument = JSON.parse(docData);
      setCurrentDocId(parsed.id);
      setDocTitle(parsed.title);
      editor.commands.setContent(parsed.content);
      localStorage.setItem('last_active_doc_id', parsed.id);
      
      // Update statistics
      setTimeout(() => handleParseOutline(editor), 100);
      setSavingStatus('idle');
    }
  };

  // Operation Actions
  const handleSaveDocument = () => {
    if (!editor) return;
    setSavingStatus('saving');

    const content = editor.getHTML();
    const saveTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const updatedDoc: SavedDocument = {
      id: currentDocId,
      title: docTitle.trim() === '' ? 'Untitled Document' : docTitle,
      content,
      updatedAt: saveTime,
    };

    // Save actual text
    localStorage.setItem(`doc_content_${currentDocId}`, JSON.stringify(updatedDoc));

    // Update index references
    const updatedList = savedDocsList.map((doc) => {
      if (doc.id === currentDocId) {
        return { ...doc, title: updatedDoc.title, updatedAt: saveTime };
      }
      return doc;
    });

    // If currently saved is new and not in the list, add it
    const exists = savedDocsList.some(doc => doc.id === currentDocId);
    if (!exists) {
      updatedList.push({ id: currentDocId, title: updatedDoc.title, updatedAt: saveTime });
    }

    localStorage.setItem('document_index_list', JSON.stringify(updatedList));
    setSavedDocsList(updatedList);
    setSavingStatus('saved');
    setLastSavedAt(saveTime);

    // Fade saved state
    setTimeout(() => setSavingStatus('idle'), 3000);
  };

  const handleCreateNewDocument = () => {
    if (!editor) return;
    
    const newId = `doc-${Date.now()}`;
    const newTitle = `New Document ${savedDocsList.length + 1}`;
    const emptyContent = `<h1>${newTitle}</h1><p>Start drafting your content here...</p>`;
    
    const newDoc: SavedDocument = {
      id: newId,
      title: newTitle,
      content: emptyContent,
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Save to storage
    localStorage.setItem(`doc_content_${newId}`, JSON.stringify(newDoc));
    
    const updatedList = [...savedDocsList, { id: newId, title: newTitle, updatedAt: newDoc.updatedAt }];
    localStorage.setItem('document_index_list', JSON.stringify(updatedList));
    setSavedDocsList(updatedList);
    
    // Switch cursor context
    setCurrentDocId(newId);
    setDocTitle(newTitle);
    editor.commands.setContent(emptyContent);
    localStorage.setItem('last_active_doc_id', newId);
    
    setTimeout(() => handleParseOutline(editor), 100);
    setSavingStatus('idle');
  };

  const handleDeleteDocument = (id: string) => {
    // Prevent delete only document
    if (savedDocsList.length <= 1) {
      window.alert("Cannot delete the only remaining saved document. Create a new document first.");
      return;
    }

    // Confirm action
    const confirm = window.confirm(`Are you sure you want to delete this document from your cloud memory?`);
    if (!confirm) return;

    localStorage.removeItem(`doc_content_${id}`);
    
    const filteredList = savedDocsList.filter(doc => doc.id !== id);
    localStorage.setItem('document_index_list', JSON.stringify(filteredList));
    setSavedDocsList(filteredList);

    // If deleting active document, switch immediately
    if (id === currentDocId && filteredList.length > 0) {
      loadDocumentFromId(filteredList[0].id, filteredList);
    }
  };

  const handleExportFile = (format: 'html' | 'markdown' | 'text') => {
    if (!editor) return;
    
    const content = editor.getHTML();
    let fileContent = '';
    let fileName = docTitle.toLowerCase().replace(/\s+/g, '-');
    let mimeType = 'text/plain';

    if (format === 'html') {
      fileContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${docTitle}</title>
    <style>
        body { font-family: 'Inter', sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
        h1 { font-size: 2.5em; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        h2 { font-size: 1.8em; margin-top: 30px; }
        h3 { font-size: 1.3em; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
        th { background: #f8fafc; font-weight: bold; }
        blockquote { border-left: 4px solid #3b82f6; padding-left: 20px; font-style: italic; color: #475569; }
        code { background: #f1f5f9; padding: 2px 5px; border-radius: 4px; font-family: monospace; }
        ul, ol { padding-left: 25px; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
      fileName += '.html';
      mimeType = 'text/html';
    } 
    else if (format === 'markdown') {
      // Basic HTML-to-MD converter strategy for premium output
      let md = content
        .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
        .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
        .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
        .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<em>(.*?)<\/em>/gi, '*$1*')
        .replace(/<ul>(.*?)<\/ul>/gis, '$1')
        .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
        .replace(/<ol>(.*?)<\/ol>/gis, '$1')
        .replace(/<blockquote>(.*?)<\/blockquote>/gis, '> $1\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/&nbsp;/g, ' ');

      // Strip remaining HTML tags
      md = md.replace(/<[^>]*>/g, '');
      fileContent = `# Document: ${docTitle}\n\n${md}`;
      fileName += '.md';
      mimeType = 'text/markdown';
    } 
    else {
      fileContent = editor.getText();
      fileName += '.txt';
      mimeType = 'text/plain';
    }

    const a = document.createElement('a');
    const file = new Blob([fileContent], { type: mimeType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Jump cursor to heading node location in ProseMirror state tree
  const handleJumpToOutlinePos = (textToFind: string) => {
    if (!editor) return;
    
    // Find heading matching text
    let targetPos = -1;
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === 'heading' && node.textContent === textToFind) {
        targetPos = pos;
        return false; // Stop traversal
      }
    });

    if (targetPos > -1) {
      try {
        editor.chain().focus().setTextSelection(targetPos).scrollIntoView().run();
      } catch (err) {
        console.warn("Could not scroll into view", err);
      }
    }
  };

  const stats = getStats();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 font-sans antialiased text-gray-800 relative">
      
      {/* Floating Focus Mode Banner */}
      {isFocusMode && (
        <div className="absolute top-4 right-4 z-50 flex items-center space-x-2 bg-white/95 backdrop-blur-xs px-4 py-2 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all animate-fade-in">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[11px] text-gray-600 font-semibold select-none">Distraction-free Focus Active</span>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => setIsFocusMode(false)}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold transition flex items-center space-x-1 cursor-pointer"
            title="Press Esc to exit distraction-free focus mode"
          >
            <EyeOff size={13} />
            <span>Exit Focus</span>
          </button>
        </div>
      )}

      {/* 1. Header & Navigation Ribbon Options */}
      {!isFocusMode && (
        <Ribbon
          editor={editor}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          orientation={orientation}
          setOrientation={setOrientation}
          marginType={marginType}
          setMarginType={setMarginType}
          paperColor={paperColor}
          setPaperColor={setPaperColor}
          docTitle={docTitle}
          setDocTitle={setDocTitle}
          savedDocuments={savedDocsList}
          onSave={handleSaveDocument}
          onNew={handleCreateNewDocument}
          onLoad={(id) => loadDocumentFromId(id)}
          onDelete={handleDeleteDocument}
          onExport={handleExportFile}
          isFocusMode={isFocusMode}
          setIsFocusMode={setIsFocusMode}
          isSpeaking={isSpeaking}
          onReadAloud={handleReadAloud}
        />
      )}

      {/* 2. Main Workspace Layout Area */}
      <div className="flex-grow flex overflow-hidden relative w-full">
        
        {/* Navigation Sidebar Panel (Microsoft Word styled outline) */}
        {!isFocusMode && (
          <div
            className={`shrink-0 border-r border-gray-200 bg-white flex flex-col transition-all duration-300 relative z-30 select-none ${
              showOutline ? 'w-64' : 'w-0 overflow-hidden border-r-0'
            }`}
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-100 flex items-center justify-between text-xs bg-gray-50/50">
              <span className="font-bold text-gray-500 uppercase tracking-widest flex items-center space-x-1.5">
                <NotebookTabs size={12} className="text-blue-500" />
                <span>Navigation map</span>
              </span>
              <button
                onClick={() => setShowOutline(false)}
                className="text-gray-400 hover:text-gray-600 transition p-0.5 rounded cursor-pointer"
                title="Hide Navigation Map"
              >
                <X size={13} />
              </button>
            </div>

            {/* Quick Help Box */}
            <div className="p-3.5 m-3 bg-blue-50/70 border border-blue-100 rounded text-[11px] text-blue-800 flex items-start space-x-2">
              <Info size={14} className="shrink-0 text-blue-500 mt-0.5" />
              <div className="leading-normal font-semibold">
                Select any header item below to autojump right to that document module instantly.
              </div>
            </div>

            {/* Dynamic TOC Listing */}
            <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin">
              {outline.length === 0 ? (
                <div className="px-3 py-6 text-center select-none">
                  <p className="text-xs text-slate-400 font-medium italic">No headers present.</p>
                  <p className="text-[10px] text-slate-300 mt-1 leading-snug">Add top-level # headings inside your paper to auto-structure this index!</p>
                </div>
              ) : (
                outline.map((item, idx) => {
                  const indent = item.level === 1 ? 'pl-2' : item.level === 2 ? 'pl-5' : 'pl-8';
                  const bulletColor = item.level === 1 ? 'bg-blue-500' : item.level === 2 ? 'bg-emerald-500' : 'bg-indigo-300';
                  return (
                    <button
                      key={`${item.id}-${idx}`}
                      onClick={() => handleJumpToOutlinePos(item.text)}
                      className={`w-full text-left py-1.5 hover:bg-slate-50 rounded-sm text-xs text-gray-700 hover:text-blue-600 font-medium truncate flex items-center space-x-2 transition ${indent}`}
                      title={item.text}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${bulletColor}`}></span>
                      <span className="truncate">{item.text}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Collapsed Sidebar Handle Drawer button */}
        {!showOutline && !isFocusMode && (
          <button
            onClick={() => setShowOutline(true)}
            className="absolute left-0.5 top-2.5 z-40 bg-white border border-gray-200 hover:bg-blue-50 hover:text-blue-600 text-gray-500 p-1.5 shadow-md rounded-r-md transition shrink-0 cursor-pointer flex items-center justify-center border-l-0"
            title="Expand Navigation Map"
          >
            <ChevronRight size={14} className="animate-bounce-horizontal" />
          </button>
        )}

        {/* 3. Document Canvas Room */}
        <Canvas
          editor={editor}
          orientation={orientation}
          marginType={marginType}
          paperColor={paperColor}
          zoom={zoom}
        />
      </div>

      {/* 4. Real-time Status Counts & Zoom slider */}
      {!isFocusMode && (
        <StatusBar
          editor={editor}
          zoom={zoom}
          setZoom={setZoom}
          savingStatus={savingStatus}
          lastSavedAt={lastSavedAt}
          onShowStats={() => setShowStatsModal(true)}
        />
      )}

      {/* Detailed Document Statistics Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in" id="stats-modal-overlay">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 w-96 max-w-full animate-scale-up text-slate-800">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-2">
                <FileText size={16} className="text-blue-600" />
                <span>Document Statistics</span>
              </h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded transition cursor-pointer"
                title="Close statistics details"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-semibold">Words</span>
                <span className="font-bold text-gray-950 text-right">{stats.words}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-semibold">Characters (no spaces)</span>
                <span className="font-bold text-gray-950 text-right">{stats.charsNoSpaces}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-semibold">Characters (with spaces)</span>
                <span className="font-bold text-gray-950 text-right">{stats.charsWithSpaces}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-semibold">Paragraphs</span>
                <span className="font-bold text-gray-950 text-right">{stats.paragraphs}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-semibold">Lines</span>
                <span className="font-bold text-gray-950 text-right">{stats.lines}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-semibold">Estimated Pages (A4)</span>
                <span className="font-bold text-gray-950 text-right">{stats.pages}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-blue-700 bg-blue-50/70 p-2.5 rounded hover:bg-blue-50 transition border border-blue-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Estimated Reading Time</span>
                  <span className="font-bold text-xs bg-white px-2 py-0.5 rounded shadow-3xs">{stats.readingTimeStr}</span>
                </div>
                <div className="flex items-center justify-between text-indigo-700 bg-indigo-50/70 p-2.5 rounded hover:bg-indigo-50 transition border border-indigo-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Estimated Speaking Time</span>
                  <span className="font-bold text-xs bg-white px-2 py-0.5 rounded shadow-3xs">{stats.speakingTimeStr}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowStatsModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-sm cursor-pointer shadow-sm hover:shadow transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
