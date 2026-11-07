import { Component } from '@angular/core';
import { projects } from '../../data/portfolio.data';
import { SectionMap } from '../../section-map';
import { ProjectGallery } from './project-gallery';

@Component({
  selector: 'app-projects',
  imports: [ProjectGallery, SectionMap],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class ProjectsPage {
  readonly projects = projects;
}
