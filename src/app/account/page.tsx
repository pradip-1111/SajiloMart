
'use client'

import { redirect } from 'next/navigation'

// This page just redirects to the orders page by default.
export default function AccountPage() {
    redirect('/account/orders')
}
