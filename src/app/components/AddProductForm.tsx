'use client';

import { useState } from 'react';

export default function AddProductForm() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        if (image) formData.append('image', image);

        try {
            const res = await fetch('/api/submit', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const { error } = await res.json();
                setError(`Error: ${error}`);
                return;
            }

            const data = await res.json();
            console.log('Product added successfully:', data);
            setSuccess(true);

            // Reset form
            setName('');
            setDescription('');
            setPrice('');
            setImage(null);

        } catch (error) {
            console.error('Error adding product:', error);
            setError('Failed to add product. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full px-4 py-12 bg-gradient-to-b from-white to-gray-50 animate-fade-in">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium tracking-wider mb-3">
                        PRODUCT DETAILS
                    </div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Add New Product
                    </h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-8 max-w-4xl mx-auto animate-fade-in">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                            </svg>
                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-8 max-w-4xl mx-auto animate-fade-in">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            <p>Product added successfully!</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group col-span-2 md:col-span-1">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                            Product Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50"
                            required
                            placeholder="Enter product name"
                        />
                    </div>

                    <div className="group col-span-2 md:col-span-1">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                            Price ($)
                        </label>
                        <input
                            type="number"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50"
                            min="0"
                            step="0.01"
                            required
                            placeholder="0.00"
                        />
                    </div>

                    <div className="group col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50"
                            rows={4}
                            required
                            placeholder="Enter product description"
                        />
                    </div>

                    <div className="group col-span-2">
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600">
                            Product Image
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                id="image"
                                onChange={handleImageChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                                accept="image/*"
                            />
                        </div>
                        {image && (
                            <p className="mt-2 text-sm text-indigo-600">
                                File selected: {image.name}
                            </p>
                        )}
                    </div>

                    <div className="col-span-2 mt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full relative overflow-hidden group bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium px-8 py-3 rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Adding Product...
                                    </>
                                ) : (
                                    <>
                                        Add Product
                                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                        </svg>
                                    </>
                                )}
                            </span>
                            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}