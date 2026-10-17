import type { Translation } from '../i18n';

// Practice projects listed in the programmer section; the description is a
// translation key so each locale shows its own text.
export interface Project {
  name: string;
  url: string;
  descKey: keyof Translation;
}

export const projects: Project[] = [
  { name: 'olaolapasapasa', url: 'https://olaolapasapasa.vercel.app/', descKey: 'programmer.projects.olaolapasapasa' },
  { name: 'Notnet', url: 'https://github.com/Natanmiuz/mp3-mp4-downloader/releases/tag/v.20', descKey: 'programmer.projects.notnet' },
  { name: 'VideoConvert', url: 'https://github.com/Natanmiuz/VideoConvert', descKey: 'programmer.projects.videoConvert' },
];
