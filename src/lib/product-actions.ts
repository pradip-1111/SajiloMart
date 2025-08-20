
'use server';

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  DocumentData,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/products';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const productsCollection = collection(db, 'products');

// Helper to extract public ID from a Cloudinary URL
const getPublicIdFromUrl = (url: string) => {
    try {
        const parts = url.split('/');
        const publicIdWithExtension = parts[parts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        return publicId;
    } catch {
        return null;
    }
}

// Helper to convert Firestore doc to Product type
const fromFirestore = (doc: DocumentData): Product => {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        category: data.category,
        price: data.price,
        image: data.image,
        rating: data.rating,
        reviewsCount: data.reviewsCount,
        description: data.description,
        details: data.details,
        tags: data.tags,
        offers: data.offers,
        stock: data.stock,
    };
};


export async function getProducts(count?: number): Promise<Product[]> {
    try {
        const q = count ? query(productsCollection, orderBy("name"), limit(count)) : query(productsCollection, orderBy("name"));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(fromFirestore);
        return products;
    } catch (error) {
        console.error("Error fetching products: ", error);
        return [];
    }
}

export async function getProductById(productId: string): Promise<Product | null> {
    try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return fromFirestore(docSnap);
        } else {
            console.log(`Product with id ${productId} not found!`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching product by ID: ", error);
        return null;
    }
}


export async function addProduct(productData: Omit<Product, 'id' | 'image'>, imageSource: string): Promise<Product | null> {
    try {
        let imageUrl = 'https://placehold.co/600x600.png';
        
        // Upload image if provided (either base64 or a remote URL)
        if (imageSource && imageSource !== imageUrl) {
            const uploadResult = await cloudinary.uploader.upload(imageSource, {
                folder: "sajilomart_products",
                overwrite: true,
            });
            imageUrl = uploadResult.secure_url;
        }

        const docRef = await addDoc(productsCollection, {
            ...productData,
            image: imageUrl,
        });
        
        const newProduct: Product = {
            ...productData,
            id: docRef.id,
            image: imageUrl,
        };

        return newProduct;

    } catch (error) {
        console.error("Error adding product: ", error);
        return null;
    }
}

export async function updateProduct(productId: string, productData: Partial<Omit<Product, 'id'>>, newImageBase64?: string): Promise<Product | null> {
    try {
        const docRef = doc(db, 'products', productId);
        let updatedData: Partial<Product> = { ...productData };

        if (newImageBase64 && newImageBase64.startsWith('data:image')) {
            // Fetch old product to get old image URL for deletion
            const oldDoc = await getDoc(docRef);
            if(oldDoc.exists()) {
                const oldImageUrl = oldDoc.data().image;
                if (oldImageUrl && !oldImageUrl.includes('placehold.co')) {
                    const publicId = getPublicIdFromUrl(oldImageUrl);
                    if (publicId) {
                         await cloudinary.uploader.destroy(`sajilomart_products/${publicId}`);
                    }
                }
            }

            const uploadResult = await cloudinary.uploader.upload(newImageBase64, {
                folder: "sajilomart_products"
            });
            updatedData.image = uploadResult.secure_url;
        }

        await updateDoc(docRef, updatedData);
        
        const finalDoc = await getDoc(docRef);
        if (!finalDoc.exists()) return null;

        return fromFirestore(finalDoc);

    } catch (error) {
        console.error("Error updating product: ", error);
        return null;
    }
}


export async function deleteProduct(productId: string, imageUrl: string): Promise<boolean> {
    try {
        // Delete Firestore document
        await deleteDoc(doc(db, 'products', productId));

        // Delete image from Cloudinary, unless it's a placeholder
        if (imageUrl && !imageUrl.includes('placehold.co')) {
            const publicId = getPublicIdFromUrl(imageUrl);
            if (publicId) {
                await cloudinary.uploader.destroy(`sajilomart_products/${publicId}`);
            }
        }
        
        return true;
    } catch (error) {
        console.error("Error deleting product: ", error);
        return false;
    }
}
