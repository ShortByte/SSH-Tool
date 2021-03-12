export class CategoryItem {

  title: string;
  hostname: string;
  username: string;
  online_status: boolean = true;
}

export class Category {

  title: string;

  items: CategoryItem[];
}