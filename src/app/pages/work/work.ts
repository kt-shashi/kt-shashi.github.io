import { Component } from '@angular/core';
import { WorkMap } from './work-map';
import { experience, training } from '../../data/portfolio.data';

@Component({
  selector: 'app-work',
  imports: [WorkMap],
  templateUrl: './work.html',
  styleUrl: './work.scss',
})
export class WorkPage {
  readonly experience = experience;
  readonly training = training;
}
