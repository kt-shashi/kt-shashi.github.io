import { Routes } from '@angular/router';
import { mapTransitionGuard } from './map-transition.guard';

export const sections = [
  {
    path: 'journey',
    label: 'Journey',
    loadComponent: () => import('./journey').then((m) => m.Journey),
  },
  {
    path: 'work',
    label: 'Work',
    loadComponent: () => import('./pages/work/work').then((m) => m.WorkPage),
  },
  {
    path: 'projects',
    label: 'Projects',
    loadComponent: () => import('./pages/projects/projects').then((m) => m.ProjectsPage),
  },
  {
    path: 'skills',
    label: 'Skills',
    loadComponent: () => import('./pages/skills/skills').then((m) => m.SkillsPage),
  },
  {
    path: 'education',
    label: 'Education',
    loadComponent: () => import('./pages/education/education').then((m) => m.EducationPage),
  },
  {
    path: 'about',
    label: 'About',
    loadComponent: () => import('./pages/about/about').then((m) => m.AboutPage),
  },
  {
    path: 'contact',
    label: 'Contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.ContactPage),
  },
] as const;

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'journey' },
  ...sections.map(({ path, label, loadComponent }) => ({
    path,
    loadComponent,
    title: label + ' · Shashi Kant — Full-Stack Developer',
    ...(path === 'work' || path === 'projects' || path === 'education'
      ? { canActivate: [mapTransitionGuard(path)] }
      : {}),
  })),
  { path: '**', redirectTo: 'journey' },
];
