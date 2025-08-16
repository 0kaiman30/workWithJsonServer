import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  userForm!: FormGroup;

  constructor(private usersService: UsersService, private fb: FormBuilder) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1)]],
    });

    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.usersService
      .getUsers()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => (this.users = data),
        error: (err) => console.error('Error loading users', err),
      });
  }

  addUser() {
    if (this.userForm.invalid) return;

    const newUser = this.userForm.value;
    this.usersService.addUser(newUser).subscribe({
      next: (user) => {
        this.users.push(user); // сразу обновляем список
        this.userForm.reset();
      },
      error: (err) => console.error('Error adding user', err),
    });
  }
}
