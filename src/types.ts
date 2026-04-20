export interface Pin {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  userId: string;
  author: {
    name: string;
    handle?: string;
    avatar: string;
  };
  tags: string[];
  category: Category;
  color?: string; // Dominant color for filtering
  palette?: string[]; // Multiple colors for UI
  aspectRatio: 'landscape' | 'portrait' | 'square';
  createdAt: any;
  likesCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  source?: string;
}

export type Category = 'All' | 'Architecture' | 'Cyberpunk' | 'Street' | 'Interior' | 'Neon';

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'save' | 'system';
  message: string;
  read: boolean;
  createdAt: any;
}
