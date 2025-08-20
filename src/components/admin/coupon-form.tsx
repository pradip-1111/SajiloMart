
'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { useCoupons } from '@/hooks/use-coupons';
import type { Coupon } from '@/lib/coupons';

interface CouponFormProps {
    coupon?: Coupon;
}

export default function CouponForm({ coupon }: CouponFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { addCoupon } = useCoupons();

    const [code, setCode] = useState('');
    const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
    const [value, setValue] = useState<number | ''>('');
    const [usageLimit, setUsageLimit] = useState<number | ''>('');
    const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (coupon) {
            setCode(coupon.code);
            setType(coupon.type);
            setValue(coupon.value);
            setUsageLimit(coupon.usageLimit);
            setExpiryDate(new Date(coupon.expiryDate));
            setIsActive(coupon.isActive);
        }
    }, [coupon]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!code || !type || value === '' || usageLimit === '' || !expiryDate) {
            toast({
                title: 'Missing Fields',
                description: 'Please fill out all required fields for the coupon.',
                variant: 'destructive',
            });
            return;
        }

        const newCoupon: Coupon = {
            code: code.toUpperCase(),
            type: type,
            value: Number(value),
            usageLimit: Number(usageLimit),
            timesUsed: coupon?.timesUsed || 0,
            expiryDate: expiryDate.toISOString(),
            applicableScope: 'all', // Simplified for now
            applicableIds: [],      // Simplified for now
            isActive: isActive,
        };

        addCoupon(newCoupon);

        toast({
            title: coupon ? 'Coupon Updated' : 'Coupon Created',
            description: `The coupon "${newCoupon.code}" has been successfully saved.`,
        });
        router.push('/admin');
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-4 mb-8">
                    <Button type="button" variant="outline" size="icon" onClick={() => router.back()}>
                        <ChevronLeft />
                    </Button>
                    <h1 className="font-headline text-3xl font-bold">{coupon ? 'Edit Coupon' : 'Create New Coupon'}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Coupon Details</CardTitle>
                                <CardDescription>Enter the core details of the coupon.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Coupon Code</Label>
                                    <Input 
                                        id="code" 
                                        value={code} 
                                        onChange={e => setCode(e.target.value.toUpperCase())}
                                        placeholder="E.g., SUMMER20"
                                        required 
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Discount Type</Label>
                                        <Select value={type} onValueChange={(v: 'percentage' | 'fixed') => setType(v)} required>
                                            <SelectTrigger id="type">
                                                <SelectValue placeholder="Select a type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="value">Value</Label>
                                        <Input 
                                            id="value" 
                                            type="number"
                                            value={value}
                                            onChange={e => setValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                            placeholder={type === 'percentage' ? "20" : "10"}
                                            required 
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="usageLimit">Usage Limit</Label>
                                    <Input 
                                        id="usageLimit"
                                        type="number" 
                                        value={usageLimit}
                                        onChange={e => setUsageLimit(e.target.value === '' ? '' : parseInt(e.target.value))}
                                        placeholder="100"
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                     <Label htmlFor="expiryDate">Expiry Date</Label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !expiryDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={expiryDate}
                                            onSelect={setExpiryDate}
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <Label htmlFor="isActive">Active</Label>
                                    <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => router.push('/admin')}>Cancel</Button>
                            <Button type="submit">{coupon ? 'Save Changes' : 'Create Coupon'}</Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
