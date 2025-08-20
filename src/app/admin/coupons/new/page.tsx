
'use client'

import CouponForm from "@/components/admin/coupon-form";
import withAuth from "@/components/with-auth";

function NewCouponPage() {
    return (
        <div>
            <CouponForm />
        </div>
    )
}

export default withAuth(NewCouponPage, 'admin');
