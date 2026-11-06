import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { sections } from '../app.routes';
import { identity } from '../data/portfolio.data';

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
})
export class Navigation {
  readonly sections = sections;
  readonly identity = identity;
}
