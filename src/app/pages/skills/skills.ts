import { Component } from '@angular/core';
import { skills } from '../../data/portfolio.data';
import { SectionMap } from '../../section-map';

@Component({
  selector: 'app-skills',
  imports: [SectionMap],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class SkillsPage {
  readonly skills = skills;
}
