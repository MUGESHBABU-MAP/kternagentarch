import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="h-screen bg-background">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .h-screen {
      height: 100vh;
    }
    .bg-background {
      background-color: #ffffff;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'Digital Maps Assessment';

  ngOnInit() {
    // Initialize app
  }
}
