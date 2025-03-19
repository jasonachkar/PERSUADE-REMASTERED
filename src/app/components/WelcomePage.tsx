import React from 'react';
import {ArrowRight,CheckCircle2} from 'lucide-react';


export default function WelcomePage (){
    
    const features = [
        {
            icon: CheckCircle2,
            title: 'Scenario-Based Training',
            description: 'Practice with AI-powered simulations of real customer interactions across various industries.'
        },
        {
            icon:CheckCircle2,
            title: 'Real-Time Feedback',
            description: 'Receive instant feedback on your communication skills, sales techniques, and customer handling.'
        },
        {
            icon:CheckCircle2,
            title: 'Performance Analytics',
            description: 'Track your progress with detailed metrics and identify areas for improvement in your sales approach.'
        }
    ];
    
    return (
            <div className='container mx-auto px-4 py-16'>
                <h1 className='text-4xl font-bold mb-6'>Master Sales Calls, Risk-Free</h1>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {features.map((feature)=>(
                    <div key={feature.title} className='bg-white p-8 rounded-2xl shadow-sm border border-gray-100
                                hover:border-blue-600 hover:shadow-md transition-all duration-300'>
                        <feature.icon className="w-12 h-12 text-blue-600 mb-6" />
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                    </div>
                ))}
                </div>
            </div>
    );
}
