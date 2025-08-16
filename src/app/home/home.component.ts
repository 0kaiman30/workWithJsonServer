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
  showModal = false;
  editingUser: User | null = null;
  modalMode: 'add' | 'edit' = 'add';
  searchTerm: string = '';
  filteredUsers: User[] = [];
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  sortField: 'name' | 'age' | null = null;

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
        next: (data) => {
          this.users = data;
          this.applyFilters();
        },
        error: (err) => console.error('Error loading users', err),
      });
  }

  applyFilters() {
    let temp = this.users.filter((u) => u.name.toLowerCase().includes(this.searchTerm.toLowerCase()));

    if (this.sortField) {
      temp.sort((a, b) => (this.sortField === 'name' ? a.name.localeCompare(b.name) : a.age - b.age));
    }

    this.totalPages = Math.ceil(temp.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredUsers = temp.slice(start, start + this.pageSize);
  }

  sortBy(field: 'name' | 'age') {
    this.sortField = field;
    this.applyFilters();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilters();
  }

  filterUsers() {
    this.currentPage = 1;
    this.applyFilters();
  }

  openModal(mode: 'add' | 'edit', user?: User) {
    this.modalMode = mode;

    if (mode === 'edit' && user) {
      this.editingUser = { ...user };
      this.userForm.setValue({
        name: user.name,
        age: user.age,
      });
    } else {
      this.editingUser = null;
      this.userForm.reset();
    }

    this.showModal = true;
  }

  startEdit(user: User) {
    this.editingUser = { ...user };
    this.showModal = true;
  }

  saveUser() {
    if (this.userForm.invalid) return;

    const data = this.userForm.value;

    if (this.modalMode === 'add') {
      this.usersService.addUser(data).subscribe({
        next: (user) => {
          this.users.push(user);
          this.applyFilters();
          this.closeModal();
        },
      });
    } else if (this.modalMode === 'edit' && this.editingUser) {
      const updatedUser: User = { ...this.editingUser, ...this.userForm.value };
      this.usersService.updateUser(updatedUser).subscribe({
        next: (user) => {
          const index = this.users.findIndex((u) => u.id === user.id);
          if (index > -1) this.users[index] = user;
          this.applyFilters();
          this.closeModal();
        },
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.editingUser = null;
    this.userForm.reset();
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
