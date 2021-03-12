import { Component, OnInit } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { Category, CategoryItem } from './core/entities';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {

  items: Category[] = [];

  selectedItems: CategoryItem[] = [];

  selectedCategory: string = 'ALL';

  constructor(private electronService: ElectronService, private translate: TranslateService) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    const items = localStorage.getItem('items');
    
    if(items)
      this.items = JSON.parse(items);
  }

  private save() {
    this.items.sort((a, b) => a.title.localeCompare(b.title));
    this.items.forEach((item) => item.items.sort((a, b) => a.title.localeCompare(b.title)));

    localStorage.setItem('items', JSON.stringify(this.items));
  }

  private deletePrompt() {
    return Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
  }

  private inputPrompt(title: string, confirmButtonText: string) {
    return Swal.fire({
      title: title,
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: confirmButtonText
    });
  }

  selectCategory(name: string) {
    this.selectedCategory = name;
  }

  checkVisibility(category: Category) {
    return this.selectedCategory === 'ALL' || this.selectedCategory === category.title;
  }

  checkSelected(item: CategoryItem) {
    return this.selectedItems.includes(item);
  }

  addCategory() {
    this.inputPrompt('Add new category', 'Save').then((result) => {
      if(!(result.isConfirmed)) return;
      this.items.push({ title: result.value, items: [] });
      this.save();
    });
  }

  deleteCategory(index: number) {
    this.deletePrompt().then((result) => {
      if(!(result.isConfirmed)) return;
      this.items.splice(index, 1);
      this.save();
      Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
    });
  }

  addItem(category: number) {
    Swal.mixin({
      input: 'text',
      confirmButtonText: 'Next &rarr;',
      showCancelButton: true,
      progressSteps: ['1', '2', '3']
    }).queue([
      'Name of item?',
      'Hostname of item?',
      'Username of item?'
    ]).then((result: any) => {
      this.items[category].items.push({ title: result.value[0], hostname: result.value[1], username: result.value[2] });
      this.save();
    });
  }

  deleteItem(category: number, item: number) {
    this.deletePrompt().then((result) => {
      if(!(result.isConfirmed)) return;
      this.items[category].items.splice(item, 1);
      this.save();
      Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
    });
  }

  openCategory(category: Category) {
    const array = [];

    category.items.forEach((item) => array.push(`${item.username}@${item.hostname}`));

    this.electronService.ipcRenderer.send('open-terminals', array);
  }

  openTerminal(event: any, item: CategoryItem) {
    if(event.ctrlKey) {
      if(this.selectedItems.includes(item))
        this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
      else
        this.selectedItems.push(item);
      return;
    }

    if(this.selectedItems.length !== 0) {
      const array = [];

      this.selectedItems.forEach((item) => array.push(`${item.username}@${item.hostname}`));
      array.push(`${item.username}@${item.hostname}`);

      this.selectedItems = [];
      this.electronService.ipcRenderer.send('open-terminals', array);
      return;
    }
    this.electronService.ipcRenderer.send('open-terminal', `${item.username}@${item.hostname}`);
  }
}
