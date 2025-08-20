
'use client';

import Link from 'next/link';
import { ShoppingCart, Search, User as UserIcon, LogOut, Shield, Truck, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import CartSheet from '@/components/cart-sheet';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Image from 'next/image';
import MegaMenu from './mega-menu';
import { menuData } from '@/lib/menu-data';
import { Input } from '../ui/input';
import { ThemeToggle } from '../theme-toggle';
import LanguageSelector from './language-selector';
import { useTranslation } from '@/hooks/use-translation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Header() {
  const { cartCount } = useCart();
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };
  
  const onLinkClick = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  }
  
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between px-4">
       
         <Link href="/" className="flex items-center justify-center lg:flex-1 lg:justify-start">
            <Image 
                src="https://res.cloudinary.com/dprbpis3u/image/upload/v1754077115/SajiloMart_coregr.png"
                alt={t('logo')}
                width={128}
                height={40}
                className="object-contain h-10 w-auto"
            />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-1 justify-center items-center">
           <MegaMenu menuData={menuData} />
            <Link href="/track" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                <Truck className="mr-2"/>
                Track Order
            </Link>
        </nav>
        
        {/* Mobile Navigation Toggle */}
        <div className="lg:hidden">
           <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm">
                <SheetHeader>
                   <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                        <Image 
                            src="https://res.cloudinary.com/dprbpis3u/image/upload/v1754077115/SajiloMart_coregr.png"
                            alt={t('logo')}
                            width={128}
                            height={40}
                        />
                    </Link>
                    <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                    <SheetDescription className="sr-only">Main navigation menu for mobile devices</SheetDescription>
                </SheetHeader>
                <div className="mt-4 h-full overflow-y-auto">
                    <Accordion type="single" collapsible className="w-full">
                        {menuData.map(category => (
                            <AccordionItem value={category.title} key={category.title}>
                                <AccordionTrigger>{t(`header.nav.${category.title.toLowerCase().replace(' & ', ' & ')}`)}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex flex-col space-y-2 pl-4">
                                        {category.subCategories.map(subCategory => (
                                            <div key={subCategory.title}>
                                                <h4 className="font-semibold mb-1 text-primary">{t(`header.nav.${subCategory.title}`)}</h4>
                                                 <div className="flex flex-col space-y-2 pl-2">
                                                    {subCategory.items.map(item => (
                                                        <button key={item.title} onClick={() => onLinkClick(item.href)} className="text-muted-foreground hover:text-primary text-left">
                                                            {t(`header.nav.${item.title}`)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                         <button onClick={() => onLinkClick('/track')} className="flex items-center w-full py-4 font-medium text-left">
                            <Truck className="mr-2 h-4 w-4"/>
                            Track Order
                        </button>
                    </Accordion>
                </div>
            </SheetContent>
          </Sheet>
        </div>


        {/* Right side icons */}
        <div className="flex items-center gap-1">
            <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder={t('header.searchPlaceholder')} 
                    className="pl-10 w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                />
            </div>

            <LanguageSelector />
            <ThemeToggle />
            
             {!loading && user ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                         <Avatar className="h-9 w-9">
                            <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`} alt={user.displayName ?? 'User'} />
                            <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                         </Avatar>
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName ?? 'User'}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                            </p>
                        </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                        <Link href="/account">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>{t('header.myAccount')}</span>
                        </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                           <DropdownMenuItem asChild>
                                <Link href="/admin">
                                    <Shield className="mr-2 h-4 w-4" />
                                    <span>{t('header.nav.admin')}</span>
                                </Link>
                           </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('header.logout')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

             ) : (
                <Button asChild className="hidden sm:inline-flex">
                    <Link href="/login">
                       {t('header.login')}
                    </Link>
                </Button>
             )}


            <CartSheet>
                <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                    <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs"
                    >
                    {cartCount}
                    </Badge>
                )}
                <span className="sr-only">Open cart</span>
                </Button>
            </CartSheet>
            
            <div className="md:hidden">
                 <Button variant="ghost" size="icon">
                    <Search className="h-6 w-6" />
                    <span className="sr-only">Search</span>
                </Button>
            </div>
        </div>
      </div>
    </header>
  );
}
