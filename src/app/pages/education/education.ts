import { Component } from '@angular/core';
import { education } from '../../data/portfolio.data';

@Component({
  selector: 'app-education',
  templateUrl: './education.html',
  styleUrl: './education.scss',
})
export class EducationPage {
  readonly qualifications = education;
}
