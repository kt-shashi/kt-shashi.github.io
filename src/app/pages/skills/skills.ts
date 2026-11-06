import { Component } from '@angular/core';
import { skills } from '../../data/portfolio.data';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class SkillsPage {
  readonly skills = skills;
}
