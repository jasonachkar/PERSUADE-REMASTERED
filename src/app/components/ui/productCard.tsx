'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './card';
import { Pencil, Trash2, X, Check, Eye, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
}

interface ProductCardProps {
    product: Product;
    onProductUpdated: () => void;
}

export function ProductCard({ product, onProductUpdated }: ProductCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isViewingDetails, setIsViewingDetails] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(product.name);
    const [description, setDescription] = useState(product.description);
    const [price, setPrice] = useState(product.price.toString());
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(product.image);
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Reset image error state when product changes
        setImageError(false);
        setPreviewUrl(product.image);
    }, [product.image]);

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImageError(false);

            // Create preview URL
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('id', product.id.toString());
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);
            if (image) {
                formData.append('image', image);
            }
            formData.append('_method', 'PUT'); // For method spoofing on the server

            const response = await fetch('/api/submit', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to update product');
            }

            setIsEditing(false);
            onProductUpdated();
        } catch (error) {
            console.error('Error updating product:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle product deletion
    const handleDelete = async () => {
        setLoading(true);

        try {
            console.log('Attempting to delete product:', product.id);

            const response = await fetch(`/api/submit?id=${product.id}`, {
                method: 'DELETE',
            });

            console.log('Delete response status:', response.status);
            const data = await response.json();
            console.log('Delete response data:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete product');
            }

            // Only call onProductUpdated and close dialog if deletion was successful
            if (data.success) {
                console.log('Product deleted successfully');
                onProductUpdated();
                setIsDeleting(false);
            } else {
                throw new Error('Delete operation did not return success');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Cancel editing
    const handleCancel = () => {
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price.toString());
        setPreviewUrl(product.image);
        setImage(null);
        setIsEditing(false);
    };

    // Handle view details
    const handleViewDetails = (e: React.MouseEvent) => {
        // Don't open details if we're clicking on the edit or delete buttons
        if ((e.target as HTMLElement).closest('.edit-btn, .delete-btn')) {
            return;
        }

        setIsViewingDetails(true);
    };

    // Handle image error
    const handleImageError = () => {
        console.error("Image failed to load:", product.image);
        setImageError(true);
        setPreviewUrl(null);
    };

    // Validate image URL
    const isValidImageUrl = (url: string | null): boolean => {
        if (!url) return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    // Image display component to reuse
    const ProductImage = ({ src, alt, className }: { src: string | null, alt: string, className?: string }) => {
        if (!src || !isValidImageUrl(src) || imageError) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <ImageIcon size={48} className="text-gray-300 transition-transform duration-300 group-hover:scale-110" />
                </div>
            );
        }

        return (
            <div className="relative w-full h-full">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover ${className || ''}`}
                    onError={handleImageError}
                    priority={false}
                    unoptimized
                />
            </div>
        );
    };

    return (
        <Card
            className={`relative group overflow-hidden bg-white/90 backdrop-blur-sm shadow-md hover:shadow-xl border-none rounded-xl animate-scale-up stagger-item cursor-pointer transition-all duration-500 ease-in-out ${isHovered ? 'transform -translate-y-2 scale-[1.02]' : ''}`}
            onClick={!isEditing && !isDeleting ? handleViewDetails : undefined}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Edit & Delete Buttons */}
            {!isEditing && !isDeleting && !isViewingDetails && (
                <div
                    className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out transform translate-y-2 group-hover:translate-y-0 z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 bg-white rounded-full shadow-md hover:bg-indigo-50 transition-transform duration-300 hover:scale-110 edit-btn"
                        aria-label="Edit product"
                    >
                        <Pencil size={16} className="text-indigo-600" />
                    </button>
                    <button
                        onClick={() => setIsDeleting(true)}
                        className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-transform duration-300 hover:scale-110 delete-btn"
                        aria-label="Delete product"
                    >
                        <Trash2 size={16} className="text-red-500" />
                    </button>
                </div>
            )}

            {/* Confirm Delete Dialog */}
            {isDeleting && (
                <div
                    className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="animate-scale-up transition-all duration-300">
                        <p className="font-medium text-gray-800 mb-4 text-center">Are you sure you want to delete this product?</p>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </button>
                            <button
                                onClick={() => setIsDeleting(false)}
                                disabled={loading}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Details View */}
            {isViewingDetails && (
                <div
                    className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col p-6 z-10 animate-fade-in overflow-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => setIsViewingDetails(false)}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all duration-200 transform hover:scale-110 active:scale-95"
                        aria-label="Close details"
                    >
                        <X size={16} className="text-gray-600" />
                    </button>

                    <div className="mb-6 animate-slide-up">
                        <ProductImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-48 mx-auto rounded-lg overflow-hidden mb-4 bg-gray-100 transform transition-transform duration-500 hover:scale-[1.03]"
                        />

                        <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-slide-up" style={{ animationDelay: '50ms' }}>
                            {product.name}
                        </h2>
                        <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
                            ${parseFloat(product.price.toString()).toFixed(2)}
                        </p>
                        <h3 className="text-md font-semibold text-gray-700 mb-2 animate-slide-up" style={{ animationDelay: '150ms' }}>
                            Description
                        </h3>
                        <p className="text-gray-600 animate-slide-up" style={{ animationDelay: '200ms' }}>
                            {product.description}
                        </p>
                    </div>

                    <div className="mt-auto animate-slide-up" style={{ animationDelay: '250ms' }}>
                        <button
                            onClick={() => setIsViewingDetails(false)}
                            className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] active:scale-98 text-sm font-medium flex items-center justify-center"
                        >
                            <X size={16} className="mr-1" /> Close
                        </button>
                    </div>
                </div>
            )}

            {isEditing ? (
                // Edit Form
                <form
                    onSubmit={handleSubmit}
                    className="p-4 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mb-4 animate-slide-up">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            required
                        />
                    </div>

                    <div className="mb-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="mb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>

                    <div className="mb-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                        <div className="relative">
                            <input
                                type="file"
                                onChange={handleImageChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all duration-200"
                                accept="image/*"
                            />
                        </div>

                        <div className="mt-2 relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                            <ProductImage
                                src={previewUrl}
                                alt="Preview"
                                className="transition-transform duration-500 ease-in-out hover:scale-105"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center"
                            disabled={loading}
                        >
                            <X size={16} className="mr-1" /> Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center"
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Check size={16} className="mr-1" /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                // Product Display
                <>
                    <div className="w-full h-48 relative overflow-hidden bg-gray-100">
                        <ProductImage
                            src={product.image}
                            alt={product.name}
                            className="transition-transform duration-700 ease-in-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    <CardHeader className="pb-2">
                        <h3 className="text-xl font-semibold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors duration-300">
                            {product.name}
                        </h3>
                    </CardHeader>

                    <CardContent>
                        <p className="text-gray-600 mb-2 line-clamp-3 text-sm group-hover:text-gray-700 transition-colors duration-300">
                            {product.description}
                        </p>
                        <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 group-hover:scale-105 transform origin-left">
                            ${parseFloat(product.price.toString()).toFixed(2)}
                        </p>
                    </CardContent>

                    <CardFooter className="pt-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsViewingDetails(true);
                            }}
                            className="w-full py-2 px-4 bg-gray-50 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-300 transform group-hover:translate-y-0 group-hover:shadow-md text-sm font-medium flex items-center justify-center"
                        >
                            <Eye size={16} className="mr-1 transition-transform duration-300 group-hover:scale-110" />
                            <span className="transition-transform duration-300 group-hover:translate-x-1">View Details</span>
                        </button>
                    </CardFooter>
                </>
            )}
        </Card>
    );
}
