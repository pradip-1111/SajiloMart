
'use client'

import { useState, useEffect, type ChangeEvent } from 'react'
import { useRouter, useParams, notFound } from 'next/navigation'
import { Product, products as initialProducts, categories } from '@/lib/products'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { X, ChevronLeft, Link as LinkIcon, Upload, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { addProduct, updateProduct, getProducts } from '@/lib/product-actions'

interface ProductFormProps {
  product?: Product;
}

const DEFAULT_PLACEHOLDER = 'https://placehold.co/600x600.png';

export default function ProductForm({ product: initialProduct }: ProductFormProps) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | undefined>(initialProduct);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(25); // Default stock
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  useEffect(() => {
    // If we're editing, fetch the product data
    if (params.id && !initialProduct) {
        setLoading(true);
        getProducts().then(allProducts => {
            const foundProduct = allProducts.find(p => p.id === params.id);
            if (foundProduct) {
                setProduct(foundProduct);
            } else {
                notFound();
            }
            setLoading(false);
        });
    } else {
        setProduct(initialProduct);
        setLoading(false);
    }
  }, [params.id, initialProduct]);

  useEffect(() => {
    if (product) {
        setName(product.name || '');
        setDescription(product.description || '');
        setPrice(product.price || '');
        setCategory(product.category || '');
        setTags(product.tags || []);
        setStock(product.stock ?? 0); // Use ?? to handle 0 correctly
        
        const isPlaceholder = !product.image || product.image.includes('placehold.co');
        const isDataUri = product.image?.startsWith('data:image');
        
        if (!isPlaceholder && !isDataUri) {
            setImageUrlInput(product.image);
            setActiveTab('url');
        } else if (isDataUri) {
            setImageBase64(product.image);
            setActiveTab('upload');
        } else {
            // Reset image inputs if product has a placeholder or no image
            setImageBase64('');
            setImageUrlInput('');
            setActiveTab('upload');
        }
    }
  }, [product]);

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };
  
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageBase64(result);
        setImageUrlInput('');
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrlInput(url);
    if (url) {
        setImageBase64('');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name || !description || price === '' || stock === '' || !category) {
        toast({
            title: 'Missing Fields',
            description: 'Please fill out all required fields.',
            variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
    }
    
    const productData = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        tags,
        rating: product?.rating || Math.random() * 2 + 3,
        reviewsCount: product?.reviewsCount || Math.floor(Math.random() * 100),
        details: product?.details || [description.substring(0, 50)],
        offers: product?.offers || [],
    };
    
    let result: Product | null = null;
    if (product) {
        // Update existing product
        const imageSource = activeTab === 'upload' ? imageBase64 : imageUrlInput;
        result = await updateProduct(product.id, productData, imageSource || undefined);
    } else {
        // Add new product
        const imageSource = activeTab === 'upload' ? imageBase64 : imageUrlInput;
        result = await addProduct(productData, imageSource || DEFAULT_PLACEHOLDER);
    }
    
    setIsSubmitting(false);
    
    if (result) {
        toast({
            title: product ? 'Product Updated' : 'Product Created',
            description: `The product "${name}" has been successfully saved.`
        });
        router.push('/admin');
        router.refresh(); // To show the updated list
    } else {
         toast({
            title: 'Error',
            description: 'There was an error saving the product.',
            variant: 'destructive',
        });
    }
  };

  if (loading) {
      return <div>Loading form...</div>
  }

  // Derive the preview source directly to avoid state inconsistencies.
  const currentImagePreview = activeTab === 'upload' 
    ? (imageBase64 || DEFAULT_PLACEHOLDER)
    : (imageUrlInput || DEFAULT_PLACEHOLDER);

  return (
    <div className="container mx-auto px-4 py-12">
        <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-4 mb-8">
                <Button type="button" variant="outline" size="icon" onClick={() => router.back()}>
                    <ChevronLeft/>
                </Button>
                <h1 className="font-headline text-3xl font-bold">{product ? 'Edit Product' : 'Create New Product'}</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Media</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="upload"><Upload className="mr-2"/> Upload</TabsTrigger>
                                    <TabsTrigger value="url"><LinkIcon className="mr-2"/> Add from URL</TabsTrigger>
                                </TabsList>
                                <TabsContent value="upload">
                                    <div className="pt-4">
                                        <Label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-lg p-6 hover:bg-muted/50 transition-colors">
                                            <Upload className="h-10 w-10 text-muted-foreground" />
                                            <span className="mt-2 text-sm font-medium text-muted-foreground">Click to upload an image</span>
                                            <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</span>
                                        </Label>
                                        <Input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </div>
                                </TabsContent>
                                <TabsContent value="url">
                                     <div className="space-y-4 pt-4">
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                            <Input 
                                            id="imageUrl" 
                                            type="url" 
                                            placeholder="https://example.com/image.png" 
                                            value={imageUrlInput}
                                            onChange={handleImageUrlChange}
                                            className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                            <div className="mt-4">
                                <Label>Image Preview</Label>
                                <Image
                                    src={currentImagePreview}
                                    width={160}
                                    height={160}
                                    alt={name || "Product Image Preview"}
                                    className="rounded-md object-cover aspect-square border mt-2"
                                    onError={() => {
                                        // This is a fallback in case the URL is invalid on the network level
                                        if (activeTab === 'url') setImageUrlInput('');
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing & Inventory</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input id="price" type="number" step="0.01" value={price} onChange={e => {
                                    const val = parseFloat(e.target.value);
                                    setPrice(isNaN(val) ? '' : val);
                                }} required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock Quantity</Label>
                                <Input id="stock" type="number" value={stock} onChange={e => {
                                    const val = parseInt(e.target.value);
                                    setStock(isNaN(val) ? '' : val);
                                }} required/>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Product Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={category} onValueChange={setCategory} required>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags</Label>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="ml-1.5">
                                                <X className="w-3 h-3"/>
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <Input id="tags" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Add a tag and press Enter"/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="visibility">Visibility</Label>
                                <Switch id="visibility" defaultChecked={true} />
                            </div>
                             <div className="flex items-center justify-between">
                                <Label htmlFor="featured">Featured Product</Label>
                                <Switch id="featured" defaultChecked={false} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.push('/admin')} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                           {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                           {isSubmitting ? 'Saving...' : (product ? 'Save Changes' : 'Create Product')}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    </div>
  )
}
