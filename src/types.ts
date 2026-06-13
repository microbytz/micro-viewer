export type RibbonTab = 'home' | 'insert' | 'layout' | 'help';

export type PageOrientation = 'portrait' | 'landscape';

export interface PageMargin {
  name: string;
  top: string;
  right: string;
  bottom: string;
  left: string;
  className: string; // Tailwind padding style
}

export const DOCUMENT_MARGINS: Record<string, PageMargin> = {
  normal: { name: 'Normal (1 in)', top: '1in', right: '1in', bottom: '1in', left: '1in', className: 'p-12' },
  narrow: { name: 'Narrow (0.5 in)', top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in', className: 'p-6' },
  wide: { name: 'Wide (2 in)', top: '1in', right: '2in', bottom: '1in', left: '2in', className: 'px-24 py-12' },
};

export interface SavedDocument {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface DocumentOutlineItem {
  id: string;
  text: string;
  level: number;
}
