'use client'
import withAuth from "@/components/with-auth";
import ProductForm from "@/components/admin/product-form";
import type { NextPage } from 'next';

const EditProductPage: NextPage = () => {
    // The product data will be fetched inside the ProductForm component
    // based on the id from the URL params.
    return (
        <div>
            <ProductForm />
        </div>
    )
}

export default withAuth(EditProductPage, 'admin');
