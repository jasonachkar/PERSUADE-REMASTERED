import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart2, LucideTimer, PhoneCall } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    return (
        <div className='bg-gradient-to-b from-white to-gray-50 container mx-auto px-4 py-16'>
            <div className="max-w-3xl mx-auto text-center mb-12 space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium tracking-wider mb-2 animate-fade-in">
                    DASHBOARD OVERVIEW
                </div>

                <h1 className='text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 animate-slide-up'>
                    Persuade
                </h1>

                <p className='text-gray-600 text-lg max-w-xl mx-auto leading-relaxed animate-slide-up-delayed'>
                    Your AI-powered training platform for professional development.
                    Track your progress and improve your skills with our advanced simulations.
                </p>

                <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
            </div>

            {/* Card Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                {/*Total Simulations*/}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-none rounded-2xl overflow-hidden group animate-fade-in-delayed">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-base font-semibold text-gray-800">Total Simulations</CardTitle>
                        <div className="p-3 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                            <PhoneCall className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">0</div>
                        <p className="text-sm text-gray-500 mt-1">
                            No simulations yet
                        </p>
                    </CardContent>
                </Card>

                {/*Total Training Time*/}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-none rounded-2xl overflow-hidden group animate-fade-in-delayed-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-base font-semibold text-gray-800">Total Training Time</CardTitle>
                        <div className="p-3 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                            <LucideTimer className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">0h</div>
                        <p className="text-sm text-gray-500 mt-1">
                            No training time logged
                        </p>
                    </CardContent>
                </Card>

                {/*Average Score*/}
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-none rounded-2xl overflow-hidden group animate-fade-in-delayed-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-base font-semibold text-gray-800">Average Score</CardTitle>
                        <div className="p-3 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                            <BarChart2 className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">--</div>
                        <p className="text-sm text-gray-500 mt-1">
                            No scores recorded
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-center mt-12">
                <Link href="/simulation">
                    <button className="relative overflow-hidden group bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium px-8 py-3 rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0">
                        <span className="relative z-10 flex items-center gap-2">
                            <span>Start Simulation</span>
                            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                            </svg>
                        </span>
                        <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                    </button>
                </Link>
            </div>
        </div>
    )
}