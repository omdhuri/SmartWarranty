import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertCircle, Wrench, CheckCircle2, Clock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ClaimItem {
    id: string;
    title: string;
    amount: string;
    status: 'authorized' | 'pending' | 'declined';
    description: string;
    cause: string;
    correction: string;
    parts: { number: string; name: string; qty: number; cost: string }[];
    labor: { description: string; hours: number; rate: string; total: string }[];
}

const DUMMY_CLAIMS: ClaimItem[] = [
    {
        id: '1',
        title: 'Engine Overheating',
        amount: '$240.00',
        status: 'pending',
        description: 'The car engine overheats after driving for a short distance.',
        cause: 'Low coolant levels or malfunctioning radiator.',
        correction: 'Refill coolant and inspect the radiator for leaks or malfunctions.',
        parts: [
            { number: '12345678AA', name: 'Radiator', qty: 1, cost: '$150.00' },
            { number: '87654321BB', name: 'Coolant', qty: 3, cost: '$30.00' }
        ],
        labor: [
            { description: "Senior Engineer's Labor", hours: 4, rate: '$60.00', total: '$240.00' }
        ]
    },
    {
        id: '2',
        title: 'Brake System Issue',
        amount: '$450.00',
        status: 'authorized',
        description: 'Squeaking noise when braking at high speeds.',
        cause: 'Worn brake pads and rotors.',
        correction: 'Replace front brake pads and resurface rotors.',
        parts: [
            { number: 'BRK-992-X', name: 'Ceramic Brake Pads', qty: 1, cost: '$89.00' }
        ],
        labor: [
            { description: "Standard Labor", hours: 2, rate: '$50.00', total: '$100.00' }
        ]
    }
];

const ClaimsList: React.FC = () => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="space-y-4 max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Claims</h2>

            <div className="space-y-3">
                {DUMMY_CLAIMS.map((claim) => (
                    <motion.div
                        key={claim.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                        {/* Header */}
                        <motion.div
                            layout="position"
                            onClick={() => toggleExpand(claim.id)}
                            className="p-4 flex items-center justify-between cursor-pointer bg-white z-10 relative"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    expandedId === claim.id ? "bg-slate-100 text-slate-900" : "bg-white text-slate-400"
                                )}>
                                    {/* Rotating Chevron */}
                                    <motion.div
                                        animate={{ rotate: expandedId === claim.id ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown size={20} />
                                    </motion.div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-900">{claim.title}</h3>
                                    <p className={cn(
                                        "text-sm font-medium",
                                        claim.status === 'authorized' ? "text-green-600" :
                                            claim.status === 'pending' ? "text-amber-600" : "text-red-600"
                                    )}>
                                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)} • {claim.amount}
                                    </p>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="hidden sm:block">
                                {claim.status === 'authorized' && <CheckCircle2 className="text-green-500" />}
                                {claim.status === 'pending' && <Clock className="text-amber-500" />}
                            </div>
                        </motion.div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {expandedId === claim.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                    className="overflow-hidden bg-slate-50 border-t border-slate-100"
                                >
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Left Column: Description */}
                                        <div className="md:col-span-2 space-y-6">

                                            <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Complaint</h4>
                                                <p className="text-slate-700 leading-relaxed">{claim.description}</p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Cause</h4>
                                                    <p className="text-sm text-slate-600">{claim.cause}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Correction</h4>
                                                    <p className="text-sm text-slate-600">{claim.correction}</p>
                                                </div>
                                            </div>

                                            {/* Parts Table */}
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Parts</h4>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="text-xs text-slate-500 uppercase bg-slate-100">
                                                            <tr>
                                                                <th className="px-4 py-2 rounded-l-md">Part No.</th>
                                                                <th className="px-4 py-2">Name</th>
                                                                <th className="px-4 py-2">Qty</th>
                                                                <th className="px-4 py-2 rounded-r-md text-right">Cost</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {claim.parts.map((part, idx) => (
                                                                <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                                                    <td className="px-4 py-3 font-medium text-slate-700">{part.number}</td>
                                                                    <td className="px-4 py-3 text-slate-600">{part.name}</td>
                                                                    <td className="px-4 py-3 text-slate-600">{part.qty}</td>
                                                                    <td className="px-4 py-3 text-slate-900 font-semibold text-right">{part.cost}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Actions / Meta */}
                                        <div className="md:col-span-1 space-y-4">
                                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm sticky top-4">
                                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                        DJ
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">David Jackson</p>
                                                        <p className="text-xs text-slate-500">Service Advisor</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mb-6">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500">Parts Total</span>
                                                        <span className="font-medium text-slate-900">$180.00</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500">Labor Total</span>
                                                        <span className="font-medium text-slate-900">$240.00</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500">Tax (10%)</span>
                                                        <span className="font-medium text-slate-900">$42.00</span>
                                                    </div>
                                                    <div className="pt-3 border-t border-slate-100 flex justify-between">
                                                        <span className="font-bold text-slate-900">Total</span>
                                                        <span className="font-bold text-indigo-600 text-lg">$462.00</span>
                                                    </div>
                                                </div>

                                                <button className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 duration-200">
                                                    View Invoice
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ClaimsList;
