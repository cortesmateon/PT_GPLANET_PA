import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-paginator',
  imports: [CommonModule, FormsModule],
  templateUrl: './paginator.html'
})
export class PaginatorComponent {
  total        = input<number>(0);
  page         = input<number>(1);
  pageSize     = input<number>(25);
  pageSizeOptions = input<number[]>([10, 25, 50, 100]);

  pageChange     = output<number>();
  pageSizeChange = output<number>();

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  from       = computed(() => this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1);
  to         = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  pages = computed<(number | null)[]>(() => {
    const t = this.totalPages();
    const c = this.page();
    if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
    const result: (number | null)[] = [1];
    if (c > 3) result.push(null);
    for (let i = Math.max(2, c - 1); i <= Math.min(t - 1, c + 1); i++) result.push(i);
    if (c < t - 2) result.push(null);
    result.push(t);
    return result;
  });

  prev() { if (this.page() > 1) this.pageChange.emit(this.page() - 1); }
  next() { if (this.page() < this.totalPages()) this.pageChange.emit(this.page() + 1); }
  goTo(p: number | null) { if (p) this.pageChange.emit(p); }
}
