'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bento } from '../../lib/types';
import { v4 as uuidv4 } from 'uuid';
import { Dice1 } from 'lucide-react';

const sampleBentos: (Omit<Bento, 'id' | 'timestamp'> & { title: string })[] = [
    {
        title: "Acme Corp - B2B Widgets",
        businessDescription: "Acme Corp specializes in high-quality industrial widgets.",
        businessModel: "B2B sales to manufacturing and technology sectors.",
        customerChallenge: "Our customers need reliable parts for their complex machinery.",
        productService: "We provide durable widgets and custom solutions.",
        positioning: "The most reliable widget provider for mission-critical applications.",
        whyWeExist: "To ensure machinery runs without failure due to subpar components.",
        competitors: [{ name: "GloboTech", domain: "globotech.com" }],
    },
    {
        title: "InnovateU - EdTech Platform",
        businessDescription: "InnovateU is an online platform for aspiring entrepreneurs.",
        businessModel: "Subscription-based access to courses and mentorship.",
        customerChallenge: "New founders struggle to find reliable guidance and resources.",
        productService: "We offer a curriculum, mentor network, and community support.",
        positioning: "The all-in-one platform to turn an idea into a business.",
        whyWeExist: "To democratize entrepreneurship for the next generation.",
        competitors: [{ name: "FounderSchool", domain: "founderschool.com" }],
    },
    {
        title: "GreenLeaf Organics - D2C Produce",
        businessDescription: "GreenLeaf Organics delivers fresh, organic produce to consumers.",
        businessModel: "Direct-to-consumer subscription boxes.",
        customerChallenge: "Consumers want convenient access to healthy, sustainable food.",
        productService: "We provide weekly boxes of fresh, locally-sourced organic produce.",
        positioning: "The easiest way to eat healthy and support local farms.",
        whyWeExist: "To connect people with the source of their food.",
        competitors: [{ name: "FarmFresh", domain: "farmfresh.com" }],
    }
];

export default function StartPage() {
    const router = useRouter();

    const handleSelectBento = (bentoData: Omit<Bento, 'id' | 'timestamp'>) => {
        const newBento: Bento = {
            ...bentoData,
            id: uuidv4(),
            timestamp: Date.now(),
        };
        localStorage.setItem('bento', JSON.stringify(newBento));
        router.push('/swipe');
    };

    const handleRandomBento = () => {
        const randomIndex = Math.floor(Math.random() * sampleBentos.length);
        handleSelectBento(sampleBentos[randomIndex]);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800">Start a New Persona</h1>
                <p className="text-lg text-gray-600 mt-2">
                    Select a sample brand brief to begin the assessment.
                </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full">
                <div
                    onClick={handleRandomBento}
                    className="bg-black text-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border flex flex-col items-center justify-center text-center"
                >
                    <Dice1 size={32} className="mb-4" />
                    <h2 className="text-xl font-bold">Random Business</h2>
                    <p className="mt-4 text-sm text-gray-300">Click to try a random business idea</p>
                </div>
                {sampleBentos.map((bento, index) => (
                    <div
                        key={index}
                        onClick={() => handleSelectBento(bento)}
                        className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border"
                    >
                        <h2 className="text-xl font-bold text-gray-800">{bento.title}</h2>
                        <p className="mt-4 text-gray-600 text-sm">{bento.businessDescription}</p>
                    </div>
                ))}
            </div>
        </div>
    );
} 