import { Component } from '@angular/core';
import { projects } from '../../data/portfolio.data';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class ProjectsPage {
  readonly projects = projects;
}
