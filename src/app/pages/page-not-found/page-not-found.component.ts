import { Component } from '@angular/core';

@Component({
  selector: 'com-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent {
  goToHome() {
    window.location.href = 'https://brightside.mtn.co.za';
  }
}
