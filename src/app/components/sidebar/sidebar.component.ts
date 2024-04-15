import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  globalSearchType: number = 1;
  globalSearchText: string;

  constructor() {
  }

  ngOnInit(): void {
  }

  goToMain() {

  }

  toggleSideMenu() {

  }

  search(type: number, placeholderr: string) {

  }

  globalSearch() {
    //TODO ng12 upgrade
  }
}
