import { Component, NgZone, OnInit } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { Category, CategoryItem } from './core/entities';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {

  consoles = [
    'Windows Terminal',
    'Powershell',
    'Git Bash',
    'CMD'
  ];

  paths = {
    ping: false,
    winscp: {
      enabled: false,
      path: '',
      keypath: ''
    }
  };

  showSettings: boolean = false;

  selectedConsole = undefined;

  items: Category[] = [];

  selectedItems: CategoryItem[] = [];

  selectedCategory: string = 'ALL';

  constructor(private electronService: ElectronService, private translate: TranslateService, private ngZone: NgZone) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    const settings = localStorage.getItem('settings');

    if(settings)
      this.paths = JSON.parse(settings);

    this.electronService.ipcRenderer.send('ping-enabled', this.paths.ping);

    const items = localStorage.getItem('items');

    if(items) {
      this.items = JSON.parse(items);

      const array = [];

      this.items.forEach((category) => {
        category.items.forEach(item => {
          array.push(item);
        });
      });
      this.electronService.ipcRenderer.send('items', array);
    }

    const cmd = localStorage.getItem('console');
    this.selectedConsole = (cmd) ? cmd : this.consoles[0];

    this.electronService.ipcRenderer.on('status', (event: any, data: any) => {
      this.ngZone.run(() => {
        this.items.forEach((category) => {
          const item = category.items.find((x => x.hostname === data.hostname));
          if(!(item)) return;
          item.online_status = data.isAlive;
        });
      });
    });

    this.electronService.ipcRenderer.on('windows-terminal-not-found', () => {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1000 * 10,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp'
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });

      Toast.fire({
        icon: 'warning',
        title: 'Please install Windows Terminal!'
      });
    });
  }

  private save() {
    this.items.sort((a, b) => a.title.localeCompare(b.title));
    this.items.forEach((item) => item.items.sort((a, b) => a.title.localeCompare(b.title)));

    localStorage.setItem('items', JSON.stringify(this.items));

    const array = [];

    this.items.forEach((category) => {
      category.items.forEach(item => {
        array.push(item);
      });
    });
    this.electronService.ipcRenderer.send('items', array);
  }

  private deletePrompt() {
    return Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
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
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
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
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      },
      progressSteps: ['1', '2', '3'],
    }).queue([
      'Name of item?',
      'Hostname of item?',
      'Username of item?'
    ]).then((result: any) => {
      if(result.value[0] === '' || result.value[1] === '' || result.value[2] === '')
        return;
      this.items[category].items.push({ title: result.value[0], hostname: result.value[1], username: result.value[2], online_status: true });
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

    this.electronService.ipcRenderer.send('open-terminals', {
      console: this.selectedConsole,
      commands: array
    });
  }

  openWinSCP(item: CategoryItem) {
    if(!(this.paths.winscp.enabled))
      return;
    this.electronService.ipcRenderer.send('open-winscp', {
      path: this.paths.winscp.path,
      keypath: this.paths.winscp.keypath,
      username: item.username,
      hostname: item.hostname
    });
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
      this.electronService.ipcRenderer.send('open-terminals', {
        console: this.selectedConsole,
        commands: array
      });
      return;
    }
    this.electronService.ipcRenderer.send('open-terminal', {
      console: this.selectedConsole,
      command: `${item.username}@${item.hostname}`
    });
  }

  selectConsole(event: any) {
    this.selectedConsole = event;
    localStorage.setItem('console', event);
  }

  pickFile(type: string, files: FileList) {
    console.log(files)
    if(type === 'winscp') {
      this.paths.winscp.path = files.item(0).path;
    }
    if(type === 'keypath'){
      this.paths.winscp.keypath = files.item(0).path;
    }
  }

  saveSettings() {
    this.electronService.ipcRenderer.send('ping-enabled', this.paths.ping);

    localStorage.setItem('settings', JSON.stringify(this.paths));
  }
}
