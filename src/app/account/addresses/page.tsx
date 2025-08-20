
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Address } from '@/lib/orders';
import { MapPin, PlusCircle, Trash2 } from 'lucide-react';
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
import { useTranslation } from '@/hooks/use-translation';


const initialAddresses: Address[] = [
    { street: '123 Tech Ave', city: 'Innovateville', zip: '98765' },
    { street: '456 Style St', city: 'Fashionburg', zip: '12345' },
];

type FormState = {
    mode: 'adding' | 'editing';
    address: Address;
    index?: number;
} | null;

export default function AddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
    const [formState, setFormState] = useState<FormState>(null);
    const { toast } = useToast();
    const { t } = useTranslation();

    const handleFormChange = (field: keyof Address, value: string) => {
        if (!formState) return;
        setFormState({
            ...formState,
            address: { ...formState.address, [field]: value }
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState) return;

        const { address, mode, index } = formState;

        if (!address.street || !address.city || !address.zip) {
            toast({ title: "All fields are required.", variant: 'destructive'});
            return;
        }

        if (mode === 'adding') {
            setAddresses(prev => [address, ...prev]);
            toast({ title: "Address Added!" });
        } else if (mode === 'editing' && index !== undefined) {
            setAddresses(prev => {
                const newAddresses = [...prev];
                newAddresses[index] = address;
                return newAddresses;
            });
            toast({ title: "Address Updated!" });
        }

        setFormState(null);
    }
    
    const openEditForm = (address: Address, index: number) => {
        setFormState({ mode: 'editing', address: { ...address }, index });
    }
    
    const openAddForm = () => {
         setFormState({ mode: 'adding', address: { street: '', city: '', zip: '' }});
    }

    const handleDeleteAddress = (indexToDelete: number) => {
        setAddresses(prev => prev.filter((_, index) => index !== indexToDelete));
        toast({ title: "Address Deleted" });
    }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('account.addressesTitle')}</CardTitle>
          <CardDescription>{t('account.addressesDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {addresses.map((address, index) => (
                <Card key={index} className="p-4 flex justify-between items-center">
                    <div className="flex items-start gap-4">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                            <p className="font-medium">{address.street}</p>
                            <p className="text-sm text-muted-foreground">{address.city}, {address.zip}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditForm(address, index)}>Edit</Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4"/>
                                 </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('account.deleteAddressConfirmation')}
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>{t('account.cancel')}</AlertDialogCancel>
                                <AlertDialogAction 
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleDeleteAddress(index)}
                                >
                                    {t('account.delete')}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                    </div>
                </Card>
            ))}
        </CardContent>
        <CardFooter>
             {!formState && (
                <Button onClick={openAddForm}>
                    <PlusCircle className="mr-2"/>
                    {t('account.addNewAddress')}
                </Button>
            )}
        </CardFooter>
      </Card>
      
      {formState && (
         <Card>
            <CardHeader>
              <CardTitle>{formState.mode === 'adding' ? t('account.addAddressTitle') : t('account.editAddressTitle')}</CardTitle>
              <CardDescription>{t('account.addressFormDescription')}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="street">{t('account.streetAddress')}</Label>
                        <Input id="street" value={formState.address.street} onChange={e => handleFormChange('street', e.target.value)} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="city">{t('account.city')}</Label>
                            <Input id="city" value={formState.address.city} onChange={e => handleFormChange('city', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="zip">{t('account.zipCode')}</Label>
                            <Input id="zip" value={formState.address.zip} onChange={e => handleFormChange('zip', e.target.value)} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="gap-2">
                    <Button type="submit">{t('account.saveAddress')}</Button>
                    <Button type="button" variant="outline" onClick={() => setFormState(null)}>{t('account.cancel')}</Button>
                </CardFooter>
            </form>
         </Card>
      )}
    </div>
  );
}

