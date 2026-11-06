import { Component, computed, input, signal } from '@angular/core';
import { ProjectScreenshot } from '../../data/portfolio.data';

@Component({
  selector: 'app-project-gallery',
  templateUrl: './project-gallery.html',
  styleUrl: './project-gallery.scss',
})
export class ProjectGallery {
  readonly screenshots = input.required<readonly ProjectScreenshot[]>();
  readonly name = input.required<string>();
  readonly page = signal(0);
  readonly pages = computed(() => Math.ceil(this.screenshots().length / 2));
  readonly visible = computed(() => this.screenshots().slice(this.page() * 2, this.page() * 2 + 2));

  step(direction: number) {
    const count = this.pages();
    this.page.update((page) => (page + direction + count) % count);
  }
}
