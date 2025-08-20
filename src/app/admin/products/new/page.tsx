'use client'

import ProductForm from "@/components/admin/product-form";
import withAuth from "@/components/with-auth";

function NewProductPage() {
    return (
        <div>
            <ProductForm />
        </div>
    )
}

export default withAuth(NewProductPage, 'admin');
