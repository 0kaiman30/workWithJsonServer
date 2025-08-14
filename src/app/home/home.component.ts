import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { UsersService, User } from './users.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  users: User[] = [];
  isLoading = false;

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.isLoading = true;
    this.usersService
      .getUsers()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => (this.users = data),
        error: (err) => console.error('Error loading users', err),
      });
  }
}
