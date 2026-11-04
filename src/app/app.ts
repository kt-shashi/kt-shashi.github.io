import { Component, signal, HostListener } from '@angular/core';
import { Journey } from './journey';
import {
  identity,
  experience,
  projects,
  skills,
  about,
  hobbies,
  training,
} from './data/portfolio.data';
@Component({
  selector: 'app-root',
  imports: [Journey],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly identity = identity;
  readonly experience = experience;
  readonly projects = projects;
  readonly skills = skills;
  readonly about = about;
  readonly hobbies = hobbies;
  readonly training = training;
  readonly menu = signal(false);
  readonly gaming = signal(false);
  readonly copyStatus = signal('');
  @HostListener('document:keydown.escape') escape() {
    if (this.menu()) {
      this.menu.set(false);
      document.getElementById('menu-toggle')?.focus();
    }
  }
  async copyEmail() {
    try {
      await navigator.clipboard.writeText(identity.email);
      this.copyStatus.set('Email address copied.');
    } catch {
      this.copyStatus.set('Could not copy. Please use the email link or select the address.');
    }
  }
}
