import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FakePaginationDataService {
  private readonly DATA_PAGE_1 = {
    data: [
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' },
      { id: 3, name: 'User 3', email: 'user3@example.com' },
      { id: 4, name: 'User 4', email: 'user4@example.com' },
      { id: 5, name: 'User 5', email: 'user5@example.com' },
      { id: 6, name: 'User 6', email: 'user6@example.com' },
      { id: 7, name: 'User 7', email: 'user7@example.com' },
      { id: 8, name: 'User 8', email: 'user8@example.com' },
      { id: 9, name: 'User 9', email: 'user9@example.com' },
      { id: 10, name: 'User 10', email: 'user10@example.com' },
    ],
    pagination: {
      limit: 10,
      currentPage: 1,
      totalPage: 3,
      totalElements: 30,
    },
  };
  private readonly DATA_PAGE_2 = {
    data: [
      { id: 11, name: 'User 11', email: 'user11@example.com' },
      { id: 12, name: 'User 12', email: 'user12@example.com' },
      { id: 13, name: 'User 13', email: 'user13@example.com' },
      { id: 14, name: 'User 14', email: 'user14@example.com' },
      { id: 15, name: 'User 15', email: 'user15@example.com' },
      { id: 16, name: 'User 16', email: 'user16@example.com' },
      { id: 17, name: 'User 17', email: 'user17@example.com' },
      { id: 18, name: 'User 18', email: 'user18@example.com' },
      { id: 19, name: 'User 19', email: 'user19@example.com' },
      { id: 20, name: 'User 20', email: 'user20@example.com' },
    ],
    pagination: {
      limit: 10,
      currentPage: 2,
      totalPage: 3,
      totalElements: 30,
    },
  };
  private readonly DATA_PAGE_3 = {
    data: [
      { id: 21, name: 'User 21', email: 'user21@example.com' },
      { id: 22, name: 'User 22', email: 'user22@example.com' },
      { id: 23, name: 'User 23', email: 'user23@example.com' },
      { id: 24, name: 'User 24', email: 'user24@example.com' },
      { id: 25, name: 'User 25', email: 'user25@example.com' },
      { id: 26, name: 'User 26', email: 'user26@example.com' },
      { id: 27, name: 'User 27', email: 'user27@example.com' },
      { id: 28, name: 'User 28', email: 'user28@example.com' },
      { id: 29, name: 'User 29', email: 'user29@example.com' },
      { id: 30, name: 'User 30', email: 'user30@example.com' },
    ],
    pagination: {
      limit: 10,
      currentPage: 3,
      totalPage: 3,
      totalElements: 30,
    },
  };

  getData({ page }: { page: number }) {
    if (page === 1) return of(this.DATA_PAGE_1);
    if (page === 2) return of(this.DATA_PAGE_2);
    if (page === 3) return of(this.DATA_PAGE_3);

    return of(this.DATA_PAGE_1);
  }
}
