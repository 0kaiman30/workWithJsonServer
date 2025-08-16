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
  editingUser: User | null = null;
  showModal = false;

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
        this.users.push(user);
        this.userForm.reset();
      },
      error: (err) => console.error('Error adding user', err),
    });
  }

  startEdit(user: User) {
    this.editingUser = { ...user }; // копия, чтобы не портить сразу список
    this.showModal = true;
  }

  updateUser() {
    if (!this.editingUser) return;

    this.usersService.updateUser(this.editingUser).subscribe({
      next: (user) => {
        const index = this.users.findIndex((u) => u.id === user.id);
        if (index > -1) {
          this.users[index] = user;
        }
        this.closeModal();
      },
      error: (err) => console.error('Error updating user', err),
    });
  }

  closeModal() {
    this.showModal = false;
    this.editingUser = null;
  }

  deleteUser(id: number) {
    this.usersService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== id);
      },
      error: (err) => console.error('Error deleting user', err),
    });
  }
}
