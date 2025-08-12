export type Page = 'Dashboard' | 'Artur Creative Lab' | 'Resources' | 'Briefings' | 'Research' | 'Services' | 'User Management';
export type ExperienceLevel = 'Junior' | 'Mid-Level' | 'Senior';
export type Language = 'en' | 'es';

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  role: 'admin' | 'user' | 'guest';
}

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    picture: string;
    role: 'admin' | 'user';
    orcid?: string | null;
}

export interface Service {
  id?: string;
  created_at?: string;
  title: string;
  description: string;
  icon: string;
}

export interface Project {
  id?: string;
  created_at?: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

export interface Resource {
  id?: string;
  created_at?: string;
  title: string;
  description: string;
  url: string;
  category: string;
}

export interface BriefingData {
    id?: string;
    created_at?: string;
    companyName: string;
    projectTitle: string;
    background: string;
    goals: string[];
    targetAudience: string;
    deliverables: string[];
    timeline: string;
    experienceLevel: ExperienceLevel;
}

export interface ResearchArticle {
  id?: string;
  created_at?: string;
  title: string;
  authors: string[];
  publicationDate: string;
  journal: string;
  abstract: string;
  tags: string[];
  documentUrl: string;
}