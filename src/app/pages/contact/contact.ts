import { Component, signal } from '@angular/core';
import { identity } from '../../data/portfolio.data';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class ContactPage {
  readonly identity = identity;
  readonly copyStatus = signal('');
  async copyEmail() {
    try {
      await navigator.clipboard.writeText(identity.email);
      this.copyStatus.set('Email address copied.');
    } catch {
      this.copyStatus.set('Could not copy. Please use the email link or select the address.');
    }
  }
}
