import { Component } from '@angular/core';
import { experience, training } from '../../data/portfolio.data';
import { SectionMap } from '../../section-map';

@Component({
  selector: 'app-work',
  imports: [SectionMap],
  templateUrl: './work.html',
  styleUrl: './work.scss',
})
export class WorkPage {
  readonly experience = experience;
  readonly training = training;
}
