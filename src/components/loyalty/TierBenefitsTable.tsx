'use client';

import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

interface MembershipTier {
  name: string;
  pointsRequired: number;
  pointsPerDollar: number;
  price: string;
  monthlyPrice?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  benefits: string[];
}

interface TierBenefitsTableProps {
  membershipTiers: MembershipTier[];
}

const TierBenefitsTable: React.FC<TierBenefitsTableProps> = ({ membershipTiers }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-[#1A1A1A] rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-[#2A2A2A]">
            <th className="text-left p-4 text-white font-semibold">
              Benefits
            </th>
            {membershipTiers.map((tier) => (
              <th key={tier.name} className={`text-center p-4 ${tier.color} font-semibold`}>
                <div>
                  {tier.name}
                  <div className="text-xs font-normal mt-1">
                    {tier.price}
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-[#333333]">
            <td className="p-4 text-white">Points earned per $1 spent</td>
            {membershipTiers.map((tier) => (
              <td key={tier.name} className={`p-4 text-center ${tier.color}`}>
                {tier.pointsPerDollar}x
              </td>
            ))}
          </tr>
          <tr className="border-b border-[#333333]">
            <td className="p-4 text-white">Points required to unlock</td>
            {membershipTiers.map((tier) => (
              <td key={tier.name} className={`p-4 text-center ${tier.color}`}>
                {tier.pointsRequired}+
              </td>
            ))}
          </tr>
          {/* Dynamic benefit rows based on all unique benefits */}
          {Array.from(new Set(membershipTiers.flatMap(tier => tier.benefits))).map((benefit) => (
            <tr key={benefit} className="border-b border-[#333333]">
              <td className="p-4 text-white">{benefit}</td>
              {membershipTiers.map((tier) => (
                <td key={tier.name} className="p-4 text-center">
                  {tier.benefits.includes(benefit) ? (
                    <FaCheck className={`${tier.color} mx-auto`} />
                  ) : (
                    <FaTimes className="text-gray-500 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TierBenefitsTable;
