export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  liked?: boolean;
  disliked?: boolean;
  video_path?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type ThemePreference = 'light' | 'dark' | 'system';
export type RadiusPreference = 'sm' | 'md' | 'lg' | 'xl';
export type DensityPreference = 'compact' | 'comfortable' | 'spacious';

export interface AppSettings {
  sidebarCollapsed: boolean;
  language: 'en' | 'ar';
  fontSize: 'sm' | 'base' | 'lg';
  theme: ThemePreference;
  /** Hex color for the navigation sidebar. */
  sidebarColor: string;
  /** Primary accent used for buttons, links, and focus. */
  accentColor: string;
  /** Empty string = follow light/dark theme canvas. */
  canvasColor: string;
  /** Empty string = derive from canvas. */
  bubbleColor: string;
  radius: RadiusPreference;
  density: DensityPreference;
  ambient: boolean;
}