
'use client';

import Link from 'next/link';
import { type MenuCategory } from '@/lib/menu-data';
import { useTranslation } from '@/hooks/use-translation';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from '@/lib/utils';
import React from 'react';

interface MegaMenuProps {
    menuData: MenuCategory[];
}

export default function MegaMenu({ menuData }: MegaMenuProps) {
    const { t } = useTranslation();

    return (
        <NavigationMenu>
            <NavigationMenuList>
                {menuData.map((category) => (
                    <NavigationMenuItem key={category.title}>
                        <NavigationMenuTrigger>{t(`header.nav.${category.title.toLowerCase().replace(' & ', ' & ')}`)}</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div className="grid grid-cols-4 gap-6 p-6 w-[800px]">
                                {category.subCategories.map((subCategory) => (
                                    <div key={subCategory.title} className="flex flex-col">
                                         <NavigationMenuLink asChild>
                                            <Link href={subCategory.href} className="font-semibold text-foreground mb-2 pb-1 border-b">
                                                {t(`header.nav.${subCategory.title}`)}
                                            </Link>
                                         </NavigationMenuLink>
                                        <ul className="space-y-2">
                                            {subCategory.items.map((item) => (
                                                <li key={item.title}>
                                                    <NavigationMenuLink asChild>
                                                         <Link href={item.href} className="text-sm text-muted-foreground hover:text-primary">
                                                            {t(`header.nav.${item.title}`)}
                                                        </Link>
                                                    </NavigationMenuLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
