
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/use-translation";

export default function ProfilePage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    
    // In a real app, you'd have state and handlers to update these values.
    const displayName = user?.displayName || "";
    const [firstName, lastName] = displayName.split(" ");

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('account.profileTitle')}</CardTitle>
                <CardDescription>{t('account.profileDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                            <Input id="firstName" defaultValue={firstName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                            <Input id="lastName" defaultValue={lastName} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">{t('auth.email')}</Label>
                        <Input id="email" type="email" defaultValue={user?.email || ''} disabled />
                    </div>
                    <Button>{t('account.updateProfile')}</Button>
                </div>
                <Separator/>
                 <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('account.changePassword')}</h3>
                    <div className="space-y-2">
                        <Label htmlFor="current-password">{t('account.currentPassword')}</Label>
                        <Input id="current-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-password">{t('account.newPassword')}</Label>
                        <Input id="new-password" type="password" />
                    </div>
                    <Button>{t('account.changePassword')}</Button>
                </div>
            </CardContent>
        </Card>
    );
}

