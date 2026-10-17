// Single source for Natan's profiles: the content creator tiles, the footer,
// the contact DM link and the JSON-LD `sameAs` all read from here.

export interface SocialLink {
  /** Also the CSS class that gives each tile its brand colour. */
  id: 'tiktok' | 'youtube' | 'facebook' | 'twitter' | 'instagram' | 'twitch' | 'kick';
  name: string;
  /** Font Awesome classes. */
  icon: string;
  /** No URL means the network is not active yet: shown disabled. */
  url?: string;
  /** Direct-message link, where the network has one. */
  dm?: string;
}

export const social: SocialLink[] = [
  { id: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok', url: 'https://www.tiktok.com/@natan.kimito' },
  { id: 'youtube', name: 'YouTube', icon: 'fab fa-youtube', url: 'https://youtube.com/@natanyume' },
  { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook-f', url: 'https://www.facebook.com/profile.php?id=61593569911560' },
  { id: 'twitter', name: 'Twitter/X', icon: 'fab fa-twitter', url: 'https://x.com/natanohj_9' },
  { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', url: 'https://www.instagram.com/natansolano_', dm: 'https://ig.me/m/natansolano_' },
  { id: 'twitch', name: 'Twitch', icon: 'fab fa-twitch' },
  { id: 'kick', name: 'Kick', icon: 'fas fa-gamepad' },
];

export const github = 'https://github.com/Natanmiuz';

const byId = (id: SocialLink['id']) => social.find((link) => link.id === id)!;

export const youtube = byId('youtube');
export const instagram = byId('instagram');

/** Every active profile, for the JSON-LD `sameAs`. */
export const sameAs = () => [...social.flatMap((link) => (link.url ? [link.url] : [])), github];
