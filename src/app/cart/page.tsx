"use client";

import { mockCart } from "@/data/mock-cart";
import { useState } from "react";

const licenseOptions = ["Personal Use", "Commercial Use", "Extended"];

export default function CartPage() {
    const [licenses, setLicenses] = useState<Record<number, string>>(
        Object.fromEntries(mockCart.map((item) => [item.id, "Personal Use"]))
    );

    const handleLicenseChange = (id: number, value: string) => {
        setLicenses((prev) => ({ ...prev, [id]: value }));
    };

    const total = mockCart.reduce((sum, product) => {
        return sum + parseFloat(product.price);
    }, 0);

    return (
        <main className="w-full min-h-screen flex flex-col items-center bg-[#0F1213] p-4">
            {/* Table headers – desktop only */}
            <div className="hidden md:flex w-full max-w-[1440px] bg-[#1B1F22] px-4">
                <div className="flex-[5] py-4 text-sl font-semibold text-[#818181]">PRODUCT</div>
                <div className="flex-[3] py-4 text-sl font-semibold text-[#818181]">LICENSE</div>
                <div className="flex-[2] py-4 text-sl font-semibold text-[#818181]">PRICE</div>
            </div>

            {/* Product list */}
            <div className="w-full max-w-[1440px] space-y-2 mt-1 bg">
                {mockCart.map((product) => (
                    <div
                        key={product.id}
                        className="bg-[#131618] rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center px-4 py-4"
                    >
                        {/* Column 1 – Image + info */}
                        <div className="flex items-center gap-4 flex-[5] w-full pb-3 md:pb-0">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-[80px] h-[80px] object-cover rounded"
                            />
                            <div>
                                <span className="block font-semibold text-white">{product.name}</span>
                                <span className="text-sm text-gray-500">by {product.creator.name}</span>
                            </div>
                        </div>

                        {/* Column 2 + 3 – Licence + Price */}
                        <div className="flex w-full md:flex-[5] md:w-auto gap-4">
                            <div className="w-1/2 md:flex-[3]">
                                <select
                                    className="border border-gray-600 rounded px-2 py-1 text-sm bg-[#1B1F22] text-white md:w-[160px]"
                                    value={licenses[product.id]}
                                    onChange={(e) => handleLicenseChange(product.id, e.target.value)}
                                >
                                    {licenseOptions.map((option) => (
                                        <option key={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="w-1/2 md:flex-[2] font-bold text-xl text-[#F4F4F4] text-right md:text-left pr-2">
                                {product.price} €
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total row */}
            <div className="w-full max-w-[1440px] mt-6 bg-[#1B1F22] px-4 py-4 flex flex-col md:flex-row items-start md:items-center rounded gap-4">
                {/* Colonne 1 – Total (pleine largeur en mobile) */}
                <div className="flex-[5] w-full">
                    <span className="text-sl font-semibold text-[#F4F4F4]">TOTAL</span>
                </div>

                {/* Colonne 2 + 3 – En ligne en mobile */}
                <div className="flex w-full md:flex-[5] md:w-auto gap-4">
                    {/* Col 2 – Promo info */}
                    <div className="w-1/2 md:flex-[3]">
                        <span className="text-sl font-semibold text-[#F4F4F4]">Including promo code</span>
                    </div>

                    {/* Col 3 – Prix total */}
                    <div className="w-1/2 md:flex-[2] font-bold text-xl text-[#8AE232] text-end md:text-left pr-2">
                        {total.toFixed(2)} €
                    </div>
                </div>
            </div>

        </main>
    );
}
