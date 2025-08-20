
export type SubCategoryItem = {
  title: string;
  href: string;
};

export type SubCategory = {
  title: string;
  href: string;
  items: SubCategoryItem[];
};

export type MenuCategory = {
  title: string;
  href: string;
  subCategories: SubCategory[];
};

export const menuData: MenuCategory[] = [
  {
    title: 'Electronics',
    href: '/products?category=Electronics',
    subCategories: [
      {
        title: 'Mobiles & Wearables',
        href: '/products?q=mobile',
        items: [
          { title: 'Smartphones', href: '/products?q=smartphone' },
          { title: 'Smartwatches', href: '/products?q=smartwatch' },
          { title: 'Headphones', href: '/products?q=headphones' },
          { title: 'Power Banks', href: '/products?q=power%20bank' },
        ],
      },
      {
        title: 'Laptops & Desktops',
        href: '/products?q=laptop',
        items: [
          { title: 'Laptops', href: '/products?q=laptop' },
          { title: 'Gaming Laptops', href: '/products?q=gaming%20laptop' },
          { title: 'Monitors', href: '/products?q=monitor' },
          { title: 'Keyboards & Mice', href: '/products?q=keyboard' },
        ],
      },
      {
        title: 'Cameras',
        href: '/products?category=Photography',
        items: [
          { title: 'DSLR', href: '/products?q=dslr' },
          { title: 'Mirrorless', href: '/products?q=mirrorless' },
          { title: 'Drones', href: '/products?q=drone' },
          { title: 'Lenses', href: '/products?q=camera%20lens' },
        ],
      },
      {
        title: 'Home Appliances',
        href: '/products?q=appliances',
        items: [
          { title: 'Televisions', href: '/products?q=tv' },
          { title: 'Washing Machines', href: '/products?q=washing%20machine' },
          { title: 'Air Conditioners', href: '/products?q=ac' },
          { title: 'Refrigerators', href: '/products?q=refrigerator' },
        ],
      },
    ],
  },
  {
    title: 'Fashion',
    href: '/products?category=Fashion',
    subCategories: [
      {
        title: "Men's Top Wear",
        href: '/products?q=men%20topwear',
        items: [
          { title: 'T-Shirts', href: '/products?q=men%20t-shirt' },
          { title: 'Casual Shirts', href: '/products?q=men%20shirt' },
          { title: 'Formal Shirts', href: '/products?q=men%20formal%20shirt' },
          { title: 'Jackets', href: '/products?q=men%20jacket' },
        ],
      },
      {
        title: "Women's Ethnic",
        href: '/products?q=women%20ethnic',
        items: [
          { title: 'Sarees', href: '/products?q=saree' },
          { title: 'Kurtas & Kurtis', href: '/products?q=kurti' },
          { title: 'Lehengas', href: '/products?q=lehenga' },
          { title: 'Salwar Kameez', href: '/products?q=salwar%20kameez' },
        ],
      },
       {
        title: "Men's Footwear",
        href: '/products?q=men%20shoes',
        items: [
          { title: 'Sports Shoes', href: '/products?q=men%20sports%20shoes' },
          { title: 'Casual Shoes', href: '/products?q=men%20casual%20shoes' },
          { title: 'Formal Shoes', href: '/products?q=men%20formal%20shoes' },
          { title: 'Sandals & Floaters', href: '/products?q=men%20sandals' },
        ],
      },
      {
        title: "Women's Western",
        href: '/products?q=women%20western',
        items: [
          { title: 'Dresses', href: '/products?q=dress' },
          { title: 'Tops & T-shirts', href: '/products?q=women%20top' },
          { title: 'Jeans & Jeggings', href: '/products?q=women%20jeans' },
          { title: 'Skirts & Shorts', href: '/products?q=skirt' },
        ],
      },
    ],
  },
  {
    title: 'Home & Kitchen',
    href: '/products?category=Home%20&%20Kitchen',
    subCategories: [
        {
            title: 'Kitchen & Dining',
            href: '/products?q=kitchen',
            items: [
                { title: 'Cookware', href: '/products?q=cookware' },
                { title: 'Dinnerware', href: '/products?q=dinnerware' },
                { title: 'Kitchen Storage', href: '/products?q=kitchen%20storage' },
                { title: 'Appliances', href: '/products?q=kitchen%20appliance' },
            ]
        },
        {
            title: 'Furniture',
            href: '/products?q=furniture',
            items: [
                { title: 'Sofas', href: '/products?q=sofa' },
                { title: 'Beds', href: '/products?q=bed' },
                { title: 'Dining Tables', href: '/products?q=dining%20table' },
                { title: 'Office Chairs', href: '/products?q=office%20chair' },
            ]
        },
        {
            title: 'Home Decor',
            href: '/products?q=decor',
            items: [
                { title: 'Paintings', href: '/products?q=painting' },
                { title: 'Clocks', href: '/products?q=clock' },
                { title: 'Lamps & Lighting', href: '/products?q=lamp' },
                { title: 'Rugs & Carpets', href: '/products?q=rug' },
            ]
        }
    ]
  },
  {
    title: 'Books',
    href: '/products?category=Books',
    subCategories: [
        {
            title: 'By Genre',
            href: '/products?category=Books',
            items: [
                { title: 'Fiction', href: '/products?q=fiction' },
                { title: 'Non-Fiction', href: '/products?q=non-fiction' },
                { title: 'Sci-Fi & Fantasy', href: '/products?q=sci-fi' },
                { title: 'Mystery & Thriller', href: '/products?q=thriller' },
            ]
        },
        {
            title: 'More Categories',
            href: '/products?category=Books',
            items: [
                { title: 'Self-Help', href: '/products?q=self-help' },
                { title: 'Business & Economics', href: '/products?q=business' },
                { title: 'Children\'s Books', href: '/products?q=kids%20books' },
                { title: 'Comics & Graphic Novels', href: '/products?q=comics' },
            ]
        },
        {
            title: 'Popular Formats',
            href: '/products?category=Books',
            items: [
                { title: 'Hardcover', href: '/products?q=hardcover' },
                { title: 'Paperback', href: '/products?q=paperback' },
                { title: 'Audiobooks', href: '/products?q=audiobook' },
                { title: 'E-Books', href: '/products?q=ebook' },
            ]
        }
    ]
  },
];
