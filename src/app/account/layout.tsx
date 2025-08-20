
'use client';

import withAuth from "@/components/with-auth";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from 'next/link';
import { Package, MapPin, User as UserIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface AccountLayoutProps {
  children: React.ReactNode
}

function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname()
  const { t } = useTranslation();

  const sidebarNavItems = [
    {
      title: t('account.myOrders'),
      href: "/account/orders",
      icon: Package,
    },
    {
      title: t('account.addresses'),
      href: "/account/addresses",
      icon: MapPin,
    },
    {
      title: t('account.profile'),
      href: "/account/profile",
      icon: UserIcon,
    },
]

  return (
    <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="lg:w-1/4">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                {sidebarNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "inline-flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 justify-start",
                                pathname === item.href
                                ? "bg-muted hover:bg-muted"
                                : "hover:bg-transparent hover:underline"
                            )}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {item.title}
                        </Link>
                    )
                })}
            </nav>
            </aside>
            <div className="flex-1">{children}</div>
        </div>
    </div>
  )
}

export default withAuth(AccountLayout);

