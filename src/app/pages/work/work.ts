import { Component } from '@angular/core';
import { experience, training } from '../../data/portfolio.data';

@Component({
  selector: 'app-work',
  templateUrl: './work.html',
  styleUrl: './work.scss',
})
export class WorkPage {
  readonly experience = experience;
  readonly training = training;
}
