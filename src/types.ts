export type Category = 'All' | 'Architecture' | 'Cyberpunk' | 'Street' | 'Interior' | 'Neon' | 'Macro' | 'Abstract';

export interface Author {
  name: string;
  avatar: string;
  handle?: string;
}

export interface Pin {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  userId: string;
  author: Author;
  createdAt: any;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  aspectRatio?: string;
  color?: string; // Legacy support
  accentColor?: string; // Dominant color hex
  tags: string[];
  source?: string;
  archetypes?: string[]; // Concept labels like 'Brutalist', 'Ethereal'
  colorSpectrum?: {
    r: number;
    g: number;
    b: number;
    weight: number;
  }[];
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  bio?: string;
  handle?: string;
  accentColor?: string;
  followersCount: number;
  followingCount: number;
  createdAt: any;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  message: string;
  read: boolean;
  createdAt: any;
  fromUser?: {
    name: string;
    avatar: string;
    handle?: string;
  };
  pinId?: string;
}
