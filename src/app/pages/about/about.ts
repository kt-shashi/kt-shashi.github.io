import { Component, signal } from '@angular/core';
import { about, hobbies } from '../../data/portfolio.data';

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class AboutPage {
  readonly about = about;
  readonly hobbies = hobbies;
  readonly gaming = signal(false);
}
