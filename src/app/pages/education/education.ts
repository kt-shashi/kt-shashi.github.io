import { Component } from '@angular/core';
import { education } from '../../data/portfolio.data';
import { SectionMap } from '../../section-map';

@Component({
  selector: 'app-education',
  imports: [SectionMap],
  templateUrl: './education.html',
  styleUrl: './education.scss',
})
export class EducationPage {
  readonly qualifications = [...education].reverse();
}
