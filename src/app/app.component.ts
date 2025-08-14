import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-main-layout>
      <router-outlet></router-outlet>
    </app-main-layout>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Digital Maps Assessment';

  ngOnInit() {
    // Initialize app
  }
}
