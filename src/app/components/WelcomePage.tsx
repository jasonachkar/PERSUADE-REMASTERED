import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';


export default function WelcomePage() {

    const features = [
        {
            icon: CheckCircle2,
            title: 'Scenario-Based Training',
            description: 'Practice with AI-powered simulations of real customer interactions across various industries.'
        },
        {
            icon: CheckCircle2,
            title: 'Real-Time Feedback',
            description: 'Receive instant feedback on your communication skills, sales techniques, and customer handling.'
        },
        {
            icon: CheckCircle2,
            title: 'Performance Analytics',
            description: 'Track your progress with detailed metrics and identify areas for improvement in your sales approach.'
        }
    ];

    return (
        <div className='bg-white container mx-auto px-4 py-16'>
            {/* Hero Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                {/* 
    Use flex and flex-col for mobile (stacked),
    and switch to flex-row on medium screens and up (side by side).
  */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

                    {/* Left Column: Logo, Heading, Text */}
                    <div className="md:w-1/2">
                        <div className="flex items-center mb-6">
                            <Image
                                src="/logo.svg"
                                alt="Persuade"
                                width={100}
                                height={100}
                                className="w-10 h-10 mr-4"
                            />
                            <label className="text-2xl font-bold text-gray-900">PERSUADE</label>
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
                            Master Sales Calls,
                            <br />
                            <span className="text-blue-600">Risk-Free</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Practice sales and customer service calls with our AI-powered voice simulator.
                            Perfect your pitch, handle objections, and boost your confidence in a safe environment.
                        </p>
                    </div>

                    {/* Right Column: Hero Image */}
                    <div className="md:w-1/2">
                        <Image
                            src="/hero-image.svg"
                            alt="Hero Image" width={1000} height={1000}
                            className="max-w-full h-auto"
                        />
                    </div>
                </div>
            </section>


            {/* Features Section */}
            <section className='py-24'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {features.map((feature) => (
                        <div key={feature.title} className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100
                                    hover:border-blue-600 hover:shadow-md transition-all duration-300'>
                            <feature.icon className="w-12 h-12 text-blue-600 mb-6" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            {/*Demo Section*/}
            <section className='py-24'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    <div className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100'>
                        <h3 className='text-xl font-semibold text-gray-900 mb-3'>Demo</h3>
                        <p>
                            Watch a demo of the platform in action.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
