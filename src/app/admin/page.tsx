
'use client'

import withAuth from "@/components/with-auth";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, PlusCircle, MoreHorizontal, FilePen, Trash2, Package, Users, BarChart3, ChevronDown, FileDown, UserCheck, UserX, Mail, Search, Ticket, Zap, Megaphone, Presentation, UserCog } from "lucide-react";
import type { Product } from "@/lib/products";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { type Order, type OrderStatus } from "@/lib/orders";
import { type User } from "@/lib/users";
import { useCoupons } from "@/hooks/use-coupons";
import { type Coupon } from "@/lib/coupons";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import OrderStatusUpdater from "@/components/admin/order-status-updater";
import { useToast } from "@/hooks/use-toast";
import { isToday, isThisWeek, isThisMonth, isThisYear, parseISO, isPast, subHours, isWithinInterval, subDays, isYesterday } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useSale } from "@/hooks/use-sale";
import { Label } from "@/components/ui/label";
import EmailComposer from "@/components/admin/email-composer";
import { useHeroImages } from "@/hooks/use-hero-images";
import { usePromoBanners, type PromoBanner } from "@/hooks/use-promo-banners";
import { Textarea } from "@/components/ui/textarea";
import { useAdmins } from "@/hooks/use-admins";
import { useAuth } from "@/hooks/use-auth";
import { onSnapshot, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteProduct as deleteProductAction } from "@/lib/product-actions";
import { updateOrderStatus } from "@/lib/order-actions";
import { useShowcaseCategories, type ShowcaseCategory, type ShowcaseItem } from "@/hooks/use-showcase-categories";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


const statusColors: Record<OrderStatus, string> = {
    'Pending': 'bg-yellow-500',
    'Shipped': 'bg-blue-500',
    'Delivered': 'bg-green-500',
    'Cancelled': 'bg-red-500',
    'Order Placed': 'bg-gray-500',
    'Packed': 'bg-indigo-500',
    'Rider Assigned': 'bg-purple-500',
    'Picked Up': 'bg-pink-500',
    'Out for Delivery': 'bg-cyan-500',
};

type DateFilter = 'all' | 'hour' | 'last24' | 'today' | 'yesterday' | 'last7' | 'week' | 'last30' | 'month' | 'year';

const dateFilterLabels: Record<DateFilter, string> = {
  all: 'All Time',
  hour: 'Last Hour',
  last24: 'Last 24 Hours',
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'This Week',
  last7: 'Last 7 Days',
  month: 'This Month',
  last30: 'Last 30 Days',
  year: 'This Year'
};


function AdminDashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const { coupons, toggleCouponStatus } = useCoupons();
    const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [globalDateFilter, setGlobalDateFilter] = useState<DateFilter>('all');
    const [ordersDateFilter, setOrdersDateFilter] = useState<DateFilter>('all');
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const { toast } = useToast();
    const { saleConfig, startSale, endSale } = useSale();
    const [saleDuration, setSaleDuration] = useState(24);
    const [saleBackgroundImage, setSaleBackgroundImage] = useState('');
    const [emailComposerOpen, setEmailComposerOpen] = useState(false);
    const [emailTarget, setEmailTarget] = useState<{to: string, name: string, subject?: string, body?: string} | null>(null);
    const { heroImages, addHeroImage, removeHeroImage } = useHeroImages();
    const [newHeroImageUrl, setNewHeroImageUrl] = useState('');
    const { promoBanners, addPromoBanner, removePromoBanner } = usePromoBanners();
    const [newBanner, setNewBanner] = useState<Omit<PromoBanner, 'id'>>({
        title: '',
        subtitle: '',
        description: '',
        image: '',
        background: '',
        link: '/products',
    });
    const { admins, addAdmin, removeAdmin } = useAdmins();
    const { user: currentUser } = useAuth();
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const { showcaseCategories, updateShowcaseCategory, addShowcaseCategory, deleteShowcaseCategory } = useShowcaseCategories();
    const [editingShowcases, setEditingShowcases] = useState<Record<string, ShowcaseCategory>>({});
    const [newShowcase, setNewShowcase] = useState<Omit<ShowcaseCategory, 'id'>>({
        mainTitle: '',
        mainHref: '',
        order: showcaseCategories.length + 1,
        items: Array(4).fill({ title: '', image: '', href: '', aiHint: '' }),
    });

    
    useEffect(() => {
        const productsUnsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
            setProducts(productsData);
        });

        const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
            setUsers(usersData);
        });
        
        const ordersUnsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
            const ordersData = snapshot.docs.map(doc => {
                const data = doc.data();
                // Firestore timestamps need to be converted to ISO strings
                const date = data.date?.toDate ? data.date.toDate().toISOString() : new Date().toISOString();
                return { 
                    ...data, 
                    id: doc.id, 
                    date,
                } as Order;
            });
            setOrders(ordersData);
        });

        // Cleanup subscription on unmount
        return () => {
            productsUnsubscribe();
            usersUnsubscribe();
            ordersUnsubscribe();
        };
    }, []);

    const createDateFilterFn = (filter: DateFilter) => (dateStr: string) => {
        if (!dateStr) return false;
        const date = parseISO(dateStr);
        if (isNaN(date.getTime())) return false;
        const now = new Date();
        switch (filter) {
            case 'hour': return isWithinInterval(date, { start: subHours(now, 1), end: now });
            case 'last24': return isWithinInterval(date, { start: subHours(now, 24), end: now });
            case 'today': return isToday(date);
            case 'yesterday': return isYesterday(date);
            case 'week': return isThisWeek(date, { weekStartsOn: 1 });
            case 'last7': return isWithinInterval(date, { start: subDays(now, 7), end: now });
            case 'month': return isThisMonth(date);
            case 'last30': return isWithinInterval(date, { start: subDays(now, 30), end: now });
            case 'year': return isThisYear(date);
            case 'all':
            default: return true;
        }
    }

    const filteredOrders = useMemo(() => {
        const dateFilterFn = createDateFilterFn(ordersDateFilter);
        return orders.filter(order => {
            const statusMatch = orderStatusFilter === 'all' || order.status === orderStatusFilter;
            const dateMatch = dateFilterFn(order.date);
            return statusMatch && dateMatch;
        });
    }, [orders, orderStatusFilter, ordersDateFilter]);


    const filteredUsers = useMemo(() => {
        const dateFilterFn = createDateFilterFn(globalDateFilter);
        return users.filter(user => {
            const searchMatch = user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                user.email.toLowerCase().includes(userSearchQuery.toLowerCase());
            const dateMatch = dateFilterFn(user.registrationDate);
            return searchMatch && dateMatch;
        });
    }, [users, userSearchQuery, globalDateFilter]);
    
    const analytics = useMemo(() => {
        const dateFilterFn = createDateFilterFn(globalDateFilter);
        const relevantOrders = orders.filter(order => dateFilterFn(order.date));
        const relevantUsers = users.filter(user => dateFilterFn(user.registrationDate));
        const totalRevenue = relevantOrders.reduce((acc, order) => order.status !== 'Cancelled' ? acc + order.total : acc, 0);
        return {
            totalRevenue: totalRevenue,
            totalOrders: relevantOrders.length,
            totalUsers: relevantUsers.length,
            revenueChange: "+20.1%", // Static for now
        };
    }, [orders, users, globalDateFilter]);


    const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
        const success = await updateOrderStatus(orderId, newStatus);
        if (success) {
            // The real-time listener will update the state automatically.
            toast({
              title: 'Order Status Updated',
              description: `Order #${orderId} has been updated to "${newStatus}".`,
            });
        } else {
            toast({
              title: 'Error',
              description: 'Failed to update order status.',
              variant: 'destructive',
            });
        }
    };

    const handleUserStatusToggle = async (userId: string) => {
        const userToUpdate = users.find(user => user.id === userId);
        if (!userToUpdate) return;
    
        const newStatus = userToUpdate.status === 'active' ? 'blocked' : 'active';
        
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { status: newStatus });
    
        toast({
            title: 'User Status Updated',
            description: `${userToUpdate.name}'s account has been ${newStatus}.`
        });
    };

    const handleDownloadInvoice = (order: Order) => {
        const doc = new jsPDF();

        // Add header
        doc.setFontSize(20);
        doc.text(`Invoice #${order.id}`, 14, 22);
        doc.setFontSize(12);
        doc.text(`Order Date: ${new Date(order.date).toLocaleDateString()}`, 14, 30);
        doc.text(`Status: ${order.status}`, 14, 38)


        // Customer and Shipping Info
        doc.setFontSize(14);
        doc.text("Bill To:", 14, 55);
        doc.setFontSize(10);
        doc.text(order.customerName, 14, 62);
        doc.text(order.customerEmail, 14, 67);

        doc.setFontSize(14);
        doc.text("Ship To:", 105, 55);
        doc.setFontSize(10);
        doc.text(order.shippingAddress.street, 105, 62);
        doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.zip}`, 105, 67);


        // Order Items Table
        const tableColumn = ["Product", "Quantity", "Price", "Total"];
        const tableRows: any[] = [];

        order.items.forEach(item => {
            const itemData = [
                item.productName,
                item.quantity,
                `₹${item.price.toFixed(2)}`,
                `₹${(item.price * item.quantity).toFixed(2)}`
            ];
            tableRows.push(itemData);
        });

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 80,
        });

        // Order Totals
        const finalY = (doc as any).lastAutoTable.finalY || 100;
        const rightAlign = doc.internal.pageSize.width - 14;

        doc.setFontSize(12);
        doc.text(`Subtotal:`, 14, finalY + 10);
        doc.text(`₹${order.total.toFixed(2)}`, rightAlign, finalY + 10, { align: 'right' });
        
        doc.text(`Shipping:`, 14, finalY + 17);
        doc.text(`Free`, rightAlign, finalY + 17, { align: 'right' });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(`Total:`, 14, finalY + 25);
        doc.text(`₹${order.total.toFixed(2)}`, rightAlign, finalY + 25, { align: 'right' });
        
        // Footer
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Thank you for your business!", 14, doc.internal.pageSize.height - 15);
        
        doc.save(`invoice_${order.id}.pdf`);

        toast({
            title: "Invoice Downloaded",
            description: `Invoice for order #${order.id} has been downloaded.`
        });
    }

    const handleDownloadOrdersPDF = () => {
        const doc = new jsPDF();
        doc.text("User Orders Report", 14, 16);
        
        const tableColumn = ["Order ID", "Customer", "Date", "Status", "Total"];
        const tableRows: any[] = [];

        filteredOrders.forEach(order => {
            const orderData = [
                order.id,
                order.customerName,
                new Date(order.date).toLocaleDateString(),
                order.status,
                `₹${order.total.toFixed(2)}`
            ];
            tableRows.push(orderData);
        });

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save('user_orders_report.pdf');
        toast({
            title: "Report Downloaded",
            description: "User orders PDF has been downloaded."
        });
    };

    const handleDeleteProduct = async (product: Product) => {
        const success = await deleteProductAction(product.id, product.image);
        if (success) {
            toast({
                title: "Product Deleted",
                description: `The product "${product.name}" has been successfully deleted.`,
            });
        } else {
            toast({
                title: "Error Deleting Product",
                description: "There was an issue deleting the product. Please try again.",
                variant: "destructive"
            });
        }
    }

    const handleCouponStatusToggle = (couponCode: string) => {
        toggleCouponStatus(couponCode);
        const coupon = coupons.find(c => c.code === couponCode);
        if (coupon) {
            toast({
                title: 'Coupon Status Updated',
                description: `Coupon "${coupon.code}" has been ${coupon.isActive ? 'deactivated' : 'activated'}.`
            });
        }
    };
    
    const openEmailComposer = (user: User) => {
        setEmailTarget({ to: user.email, name: user.name });
        setEmailComposerOpen(true);
    };

    const openBulkSaleEmailComposer = () => {
        setEmailTarget({
            to: users.map(u => u.email).join(','),
            name: "Valued Customers",
            subject: "⚡ Flash Sale is LIVE! ⚡",
            body: `Hi there!\n\nOur biggest flash sale of the season is now live! Get up to 50% off on your favorite products. But hurry, this sale won't last long!\n\nShop now: ${window.location.origin}\n\nHappy Shopping,\nThe SajiloMart Team`
        });
        setEmailComposerOpen(true);
    }
    
    const openBulkEmailComposer = () => {
        setEmailTarget({
            to: users.map(u => u.email).join(','),
            name: "All Users",
        });
        setEmailComposerOpen(true);
    };

    const handleAddHeroImage = () => {
        if (!newHeroImageUrl.trim()) {
            toast({ title: "Image URL cannot be empty.", variant: 'destructive' });
            return;
        }
        addHeroImage(newHeroImageUrl);
        setNewHeroImageUrl('');
    };

    const handleAddBanner = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBanner.title || !newBanner.image || !newBanner.background) {
            toast({ title: "Title, Image URL, and Background URL are required for banners.", variant: 'destructive' });
            return;
        }
        addPromoBanner(newBanner);
        setNewBanner({ title: '', subtitle: '', description: '', image: '', background: '', link: '/products' }); // Reset form
    };
    
    const handleAddAdmin = () => {
        addAdmin(newAdminEmail);
        setNewAdminEmail('');
    }
    
    const handleRemoveAdmin = (email: string) => {
        if (currentUser?.email === email) {
            toast({ title: 'Action not allowed', description: 'You cannot remove your own admin privileges.', variant: 'destructive' });
            return;
        }
        removeAdmin(email);
    }
    
    const handleShowcaseChange = (id: string, field: string, value: string | number, itemIndex?: number, subfield?: keyof ShowcaseItem) => {
        setEditingShowcases(prev => {
            const editingCopy = { ...prev };
            if (!editingCopy[id]) {
                // If not already editing, create a copy from the main state
                const original = showcaseCategories.find(sc => sc.id === id);
                if (original) {
                    editingCopy[id] = JSON.parse(JSON.stringify(original)); // Deep copy
                } else {
                    return prev;
                }
            }
    
            const showcaseToEdit = editingCopy[id];
    
            if (itemIndex !== undefined && subfield !== undefined) {
                // Editing an item within the showcase
                const newItems = [...showcaseToEdit.items];
                newItems[itemIndex] = { ...newItems[itemIndex], [subfield]: value };
                showcaseToEdit.items = newItems;
            } else {
                // Editing a top-level field
                (showcaseToEdit as any)[field] = value;
            }
    
            return editingCopy;
        });
    };

    const handleSaveShowcase = (id: string) => {
        const updatedShowcase = editingShowcases[id];
        if (updatedShowcase) {
            updateShowcaseCategory(id, updatedShowcase);
            // Remove from editing state after saving
            setEditingShowcases(prev => {
                const newEditing = { ...prev };
                delete newEditing[id];
                return newEditing;
            });
        }
    };
    
    const handleNewShowcaseChange = (field: keyof Omit<ShowcaseCategory, 'id' | 'items'>, value: string | number) => {
        setNewShowcase(prev => ({ ...prev, [field]: value }));
    };

    const handleNewShowcaseItemChange = (index: number, field: keyof ShowcaseItem, value: string) => {
        setNewShowcase(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, items: newItems };
        });
    };
    
    const handleAddNewShowcase = (e: React.FormEvent) => {
        e.preventDefault();
        addShowcaseCategory(newShowcase);
        // Reset the form
        setNewShowcase({
            mainTitle: '',
            mainHref: '',
            order: showcaseCategories.length + 2, // +2 because the new one is not yet in the state
            items: Array(4).fill({ title: '', image: '', href: '', aiHint: '', productId: '' }),
        });
    };


    return (
        <div className="container mx-auto px-4 py-12">
             {emailTarget && (
                <EmailComposer
                    open={emailComposerOpen}
                    onOpenChange={setEmailComposerOpen}
                    toEmail={emailTarget.to}
                    toName={emailTarget.name}
                    initialSubject={emailTarget.subject}
                    initialBody={emailTarget.body}
                />
            )}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Shield className="h-10 w-10 text-primary"/>
                    <div>
                        <h1 className="font-headline text-4xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">
                            Showing data for: <span className="font-semibold text-primary">{dateFilterLabels[globalDateFilter]}</span>
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto">
                          Filter Dashboard <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Date Range</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {(Object.keys(dateFilterLabels) as DateFilter[]).map(filterKey => (
                            <DropdownMenuCheckboxItem 
                                key={filterKey}
                                checked={globalDateFilter === filterKey} 
                                onCheckedChange={() => setGlobalDateFilter(filterKey)}
                            >
                                {dateFilterLabels[filterKey]}
                            </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button asChild>
                        <Link href="/admin/products/new">
                            <PlusCircle className="mr-2" />
                            Add Product
                        </Link>
                    </Button>
                </div>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{analytics.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">{analytics.revenueChange} from last period</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{analytics.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">{dateFilterLabels[globalDateFilter]}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products.length}</div>
                        <p className="text-xs text-muted-foreground">Total products in store</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">New Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{analytics.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">{dateFilterLabels[globalDateFilter]}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{coupons.filter(c => c.isActive && !isPast(parseISO(c.expiryDate))).length}</div>
                        <p className="text-xs text-muted-foreground">Total active coupons</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Flash Sale</CardTitle>
                        <CardDescription>
                            {saleConfig.isActive 
                                ? `A sale is currently active and ends on ${new Date(saleConfig.endDate).toLocaleString()}.`
                                : "No active sale."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
                        {saleConfig.isActive ? (
                            <>
                                <Button variant="destructive" onClick={endSale}>
                                    End Sale Now
                                </Button>
                                 <Button variant="outline" onClick={openBulkSaleEmailComposer}>
                                    <Megaphone className="mr-2" /> Notify Users
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="grid w-full sm:w-auto gap-1.5">
                                    <Label htmlFor="duration">Sale Duration (hours)</Label>
                                    <Input 
                                        id="duration" 
                                        type="number" 
                                        value={saleDuration}
                                        onChange={e => {
                                            const value = parseInt(e.target.value, 10);
                                            setSaleDuration(isNaN(value) ? 0 : value);
                                        }}
                                        min="1"
                                        className="w-full sm:w-48"
                                    />
                                </div>
                                <div className="grid w-full flex-1 gap-1.5">
                                    <Label htmlFor="bg-image">Background Image URL</Label>
                                    <Input 
                                        id="bg-image" 
                                        type="url" 
                                        placeholder="https://placehold.co/1920x500.png"
                                        value={saleBackgroundImage}
                                        onChange={e => setSaleBackgroundImage(e.target.value)}
                                    />
                                </div>
                                <Button onClick={() => startSale(saleDuration, saleBackgroundImage)}>
                                    <Zap className="mr-2" /> Start New Sale
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Hero Images</CardTitle>
                        <CardDescription>Add or remove images for the homepage hero slideshow.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                type="url"
                                placeholder="https://placehold.co/1920x1080.png"
                                value={newHeroImageUrl}
                                onChange={(e) => setNewHeroImageUrl(e.target.value)}
                            />
                            <Button onClick={handleAddHeroImage}>Add Image</Button>
                        </div>
                        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                            {heroImages.map((url, index) => (
                                <div key={index} className="flex items-center justify-between gap-2 p-2 bg-muted rounded-md text-sm">
                                    <span className="truncate">{url}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeHeroImage(url)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Presentation /> Manage Showcase</CardTitle>
                    <CardDescription>Edit the category showcases that appear on the homepage.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Accordion type="single" collapsible className="w-full">
                        {showcaseCategories.map(sc => {
                             const currentData = editingShowcases[sc.id] || sc;
                             return (
                                <AccordionItem value={sc.id} key={sc.id}>
                                    <AccordionTrigger>{sc.mainTitle}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-6 p-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`mainTitle-${sc.id}`}>Main Title</Label>
                                                    <Input 
                                                        id={`mainTitle-${sc.id}`} 
                                                        value={currentData.mainTitle}
                                                        onChange={(e) => handleShowcaseChange(sc.id, 'mainTitle', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor={`mainHref-${sc.id}`}>Main Link</Label>
                                                    <Input 
                                                        id={`mainHref-${sc.id}`} 
                                                        value={currentData.mainHref}
                                                        onChange={(e) => handleShowcaseChange(sc.id, 'mainHref', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                {currentData.items.map((item, index) => (
                                                    <div key={index} className="space-y-4 p-4 border rounded-md">
                                                        <h4 className="font-semibold">Item {index + 1}</h4>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`item-title-${sc.id}-${index}`}>Title</Label>
                                                            <Input 
                                                                id={`item-title-${sc.id}-${index}`}
                                                                value={item.title}
                                                                onChange={(e) => handleShowcaseChange(sc.id, 'items', e.target.value, index, 'title')}
                                                            />
                                                        </div>
                                                         <div className="space-y-2">
                                                            <Label htmlFor={`item-productId-${sc.id}-${index}`}>Product ID</Label>
                                                            <Input 
                                                                id={`item-productId-${sc.id}-${index}`}
                                                                value={item.productId || ''}
                                                                onChange={(e) => handleShowcaseChange(sc.id, 'items', e.target.value, index, 'productId')}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`item-image-${sc.id}-${index}`}>Image URL</Label>
                                                            <Input 
                                                                id={`item-image-${sc.id}-${index}`}
                                                                type="url"
                                                                value={item.image}
                                                                onChange={(e) => handleShowcaseChange(sc.id, 'items', e.target.value, index, 'image')}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`item-href-${sc.id}-${index}`}>Link URL (Fallback)</Label>
                                                            <Input 
                                                                id={`item-href-${sc.id}-${index}`}
                                                                value={item.href}
                                                                onChange={(e) => handleShowcaseChange(sc.id, 'items', e.target.value, index, 'href')}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <Button onClick={() => handleSaveShowcase(sc.id)} disabled={!editingShowcases[sc.id]}>
                                                    Save Changes for "{sc.mainTitle}"
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" type="button">Delete Showcase</Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete the "{sc.mainTitle}" showcase. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-destructive hover:bg-destructive/90"
                                                                onClick={() => deleteShowcaseCategory(sc.id)}
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                             </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                             )
                        })}
                     </Accordion>
                </CardContent>
            </Card>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Add New Showcase</CardTitle>
                    <CardDescription>Create a new category showcase for the homepage.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddNewShowcase} className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-sc-title">Main Title</Label>
                                <Input id="new-sc-title" value={newShowcase.mainTitle} onChange={e => handleNewShowcaseChange('mainTitle', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-sc-href">Main Link</Label>
                                <Input id="new-sc-href" value={newShowcase.mainHref} onChange={e => handleNewShowcaseChange('mainHref', e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-sc-order">Order</Label>
                                <Input id="new-sc-order" type="number" value={newShowcase.order} onChange={e => handleNewShowcaseChange('order', Number(e.target.value))} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {newShowcase.items.map((item, index) => (
                                <div key={index} className="space-y-4 p-4 border rounded-md">
                                    <h4 className="font-semibold">Item {index + 1}</h4>
                                     <div className="space-y-2">
                                        <Label htmlFor={`new-item-title-${index}`}>Title</Label>
                                        <Input id={`new-item-title-${index}`} value={item.title} onChange={e => handleNewShowcaseItemChange(index, 'title', e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`new-item-productId-${index}`}>Product ID (Optional)</Label>
                                        <Input id={`new-item-productId-${index}`} value={item.productId || ''} onChange={e => handleNewShowcaseItemChange(index, 'productId', e.target.value)} placeholder="e.g., prod-1" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`new-item-image-${index}`}>Image URL</Label>
                                        <Input id={`new-item-image-${index}`} type="url" value={item.image} onChange={e => handleNewShowcaseItemChange(index, 'image', e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`new-item-href-${index}`}>Link URL (Fallback)</Label>
                                        <Input id={`new-item-href-${index}`} value={item.href} onChange={e => handleNewShowcaseItemChange(index, 'href', e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`new-item-aihint-${index}`}>AI Hint</Label>
                                        <Input id={`new-item-aihint-${index}`} value={item.aiHint} onChange={e => handleNewShowcaseItemChange(index, 'aiHint', e.target.value)} placeholder="e.g., modern sofa" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button type="submit">Add Showcase</Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserCog /> Manage Admins</CardTitle>
                    <CardDescription>Add or remove users who have administrator privileges.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            type="email"
                            placeholder="new.admin@example.com"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                        />
                        <Button onClick={handleAddAdmin}>Add Admin</Button>
                    </div>
                    <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                        {admins.map((email) => (
                            <div key={email} className="flex items-center justify-between gap-2 p-2 bg-muted rounded-md text-sm">
                                <span className="font-medium">{email}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveAdmin(email)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
           
             <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Presentation /> Manage Promo Banners</CardTitle>
                    <CardDescription>Add or remove banners for the promotional carousel on the products page.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">Current Banners</h4>
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                                {promoBanners.map((banner) => (
                                    <div key={banner.id} className="flex items-start justify-between gap-2 p-2 bg-muted rounded-md text-sm">
                                        <div className="flex gap-2 items-start">
                                            <Image src={banner.image} alt={banner.title || 'Promo Banner'} width={48} height={48} className="rounded aspect-square object-cover"/>
                                            <div>
                                                <p className="font-semibold">{banner.title}</p>
                                                <p className="text-muted-foreground text-xs truncate">{banner.description}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => removePromoBanner(banner.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <form onSubmit={handleAddBanner} className="space-y-4">
                             <h4 className="font-semibold">Add New Banner</h4>
                             <div className="space-y-2">
                                <Label htmlFor="banner-title">Title</Label>
                                <Input id="banner-title" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} required/>
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="banner-subtitle">Subtitle</Label>
                                <Input id="banner-subtitle" value={newBanner.subtitle} onChange={e => setNewBanner({...newBanner, subtitle: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="banner-desc">Description</Label>
                                <Textarea id="banner-desc" value={newBanner.description} onChange={e => setNewBanner({...newBanner, description: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="banner-image">Product Image URL</Label>
                                <Input id="banner-image" type="url" placeholder="https://placehold.co/300x300.png" value={newBanner.image} onChange={e => setNewBanner({...newBanner, image: e.target.value})} required/>
                             </div>
                              <div className="space-y-2">
                                <Label htmlFor="banner-bg">Background Image URL</Label>
                                <Input id="banner-bg" type="url" placeholder="https://placehold.co/1200x400.png" value={newBanner.background} onChange={e => setNewBanner({...newBanner, background: e.target.value})} required/>
                             </div>
                             <Button type="submit">Add Banner</Button>
                        </form>
                    </div>
                </CardContent>
             </Card>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Manage Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Image</span>
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Price</TableHead>
                                <TableHead className="hidden md:table-cell">Stock</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            alt={product.name || 'Product Image'}
                                            className="aspect-square rounded-md object-cover"
                                            height="64"
                                            src={product.image || `https://placehold.co/64x64.png`}
                                            width="64"
                                            data-ai-hint={`${product.category} product`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">₹{product.price.toFixed(2)}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                                    <TableCell>
                                      <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                  <Link href={`/admin/products/${product.id}/edit`}><FilePen className="mr-2" /> Edit</Link>
                                                </DropdownMenuItem>
                                                <AlertDialogTrigger asChild>
                                                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                    <Trash2 className="mr-2"/> Delete
                                                  </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This action cannot be undone. This will permanently delete this product.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                                className="bg-destructive hover:bg-destructive/90"
                                                onClick={() => handleDeleteProduct(product)}
                                            >
                                                Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>1-{products.length}</strong> of <strong>{products.length}</strong> products
                    </div>
                </CardFooter>
            </Card>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Manage Coupons</CardTitle>
                    <Button asChild>
                        <Link href="/admin/coupons/new">
                            <PlusCircle className="mr-2" />
                            Create Coupon
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {coupons.map(coupon => {
                            const isExpired = isPast(parseISO(coupon.expiryDate));
                            const isInactive = !coupon.isActive || isExpired;
                            return (
                             <TableRow key={coupon.code} className={cn(isInactive && "text-muted-foreground")}>
                                <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                                <TableCell className="capitalize">{coupon.type}</TableCell>
                                <TableCell>{coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value.toFixed(2)}`}</TableCell>
                                <TableCell>{coupon.timesUsed} / {coupon.usageLimit}</TableCell>
                                <TableCell>{new Date(coupon.expiryDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge variant={isInactive ? 'outline' : 'secondary'}>{isInactive ? 'Inactive' : 'Active'}</Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/coupons/${coupon.code}/edit`}>Edit</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleCouponStatusToggle(coupon.code)}>
                                                {coupon.isActive ? 'Deactivate' : 'Activate'}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                           )})}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{coupons.length}</strong> of <strong>{coupons.length}</strong> coupons
                    </div>
                </CardFooter>
            </Card>

            <Card className="mb-8">
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4">
                    <CardTitle>Manage Orders</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto">
                              Filter by Date <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Date Range</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {(Object.keys(dateFilterLabels) as DateFilter[]).map(filterKey => (
                                <DropdownMenuCheckboxItem 
                                    key={filterKey}
                                    checked={ordersDateFilter === filterKey} 
                                    onCheckedChange={() => setOrdersDateFilter(filterKey)}
                                >
                                    {dateFilterLabels[filterKey]}
                                </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto">
                              Filter by Status <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked={orderStatusFilter === 'all'} onCheckedChange={() => setOrderStatusFilter('all')}>All</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={orderStatusFilter === 'Pending'} onCheckedChange={() => setOrderStatusFilter('Pending')}>Pending</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={orderStatusFilter === 'Shipped'} onCheckedChange={() => setOrderStatusFilter('Shipped')}>Shipped</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={orderStatusFilter === 'Delivered'} onCheckedChange={() => setOrderStatusFilter('Delivered')}>Delivered</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem checked={orderStatusFilter === 'Cancelled'} onCheckedChange={() => setOrderStatusFilter('Cancelled')}>Cancelled</DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="outline" onClick={handleDownloadOrdersPDF}>
                            <FileDown className="mr-2" /> Download PDF
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="hidden md:table-cell">Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Total</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {filteredOrders.map(order => (
                             <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id}</TableCell>
                                <TableCell>{order.customerName}</TableCell>
                                <TableCell className="hidden md:table-cell">{new Date(order.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge className={cn("text-white", statusColors[order.status])}>{order.status}</Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">₹{order.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/orders/${order.id}`}>View Details</Link>
                                            </DropdownMenuItem>
                                            <OrderStatusUpdater
                                                order={order}
                                                onStatusUpdate={handleStatusUpdate}
                                            >
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    Update Status
                                                </DropdownMenuItem>
                                            </OrderStatusUpdater>
                                            <DropdownMenuItem onClick={() => handleDownloadInvoice(order)}>
                                                <FileDown className="mr-2"/> Download Invoice
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                           ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
                    </div>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <CardTitle>Manage Users</CardTitle>
                        <Button variant="outline" onClick={openBulkEmailComposer}>
                            <Mail className="mr-2" /> Email All Users
                        </Button>
                    </div>
                     <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            className="pl-10 w-full md:w-1/3"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead className="hidden sm:table-cell">Status</TableHead>
                                <TableHead className="hidden md:table-cell">Registered</TableHead>
                                <TableHead className="hidden md:table-cell">Total Orders</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {filteredUsers.map(user => (
                             <TableRow key={user.id}>
                                <TableCell>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'}>{user.status}</Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{new Date(user.registrationDate).toLocaleDateString()}</TableCell>
                                <TableCell className="hidden md:table-cell">{user.orderIds.length}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>View Order History</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleUserStatusToggle(user.id)}>
                                                {user.status === 'active' ? <UserX className="mr-2"/> : <UserCheck className="mr-2" />} 
                                                {user.status === 'active' ? 'Block User' : 'Unblock User'}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openEmailComposer(user); }}>
                                                <Mail className="mr-2"/> Send Email
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                           ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

export default withAuth(AdminDashboardPage, 'admin');

    
    
