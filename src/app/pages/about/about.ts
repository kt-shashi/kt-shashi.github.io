import { Component, signal } from '@angular/core';
import { hobbies } from '../../data/portfolio.data';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutPage {
  readonly hobbies = hobbies;
  readonly gaming = signal(false);
}
