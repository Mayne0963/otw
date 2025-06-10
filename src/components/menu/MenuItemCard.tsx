'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FaStar, FaFire, FaLeaf, FaShoppingBag } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  popular?: boolean
  new?: boolean
  infused?: boolean
  dietary?: {
    vegetarian?: boolean
    vegan?: boolean
    glutenFree?: boolean
    dairyFree?: boolean
  }
}

interface MenuItemProps {
  item: MenuItem
}

const MenuItemCard: React.FC<MenuItemProps> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const handleOrderNow = () => {
    // Navigate to checkout with item information
    const itemData = encodeURIComponent(JSON.stringify({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      description: item.description,
    }));
    router.push(`/checkout?item=${itemData}`);
  };

  return (
    <>
      <div className="menu-card overflow-hidden">
        <div className="relative h-48 w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
          {item.image ? (
            <Image src={item.image || '/placeholder.svg'} alt={item.name} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-otw-black-800 text-white/60">No Image</div>
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
            {item.popular && (
              <div className="badge bg-gold-foil text-black text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <FaStar /> POPULAR
              </div>
            )}
            {item.new && (
              <div className="badge bg-blood-red text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <FaFire /> NEW
              </div>
            )}
            {item.infused && (
              <div className="badge bg-emerald-green text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <FaLeaf /> INFUSED
              </div>
            )}
          </div>

          {/* Category Tag */}
          <div className="absolute bottom-2 left-2 z-20">
            <span className="text-xs bg-black bg-opacity-70 text-white px-2 py-1 rounded">{item.category}</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-white">{item.name}</h3>
            <span className="text-gold-foil font-bold">${item.price.toFixed(2)}</span>
          </div>

          <p className={`text-white/70 text-sm mb-4 ${isExpanded ? '' : 'line-clamp-2'}`}>{item.description}</p>

          {item.description.length > 100 && (
            <button className="text-gold-foil text-xs mb-4 hover:underline" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}

          {/* Dietary Icons */}
          {item.dietary && Object.values(item.dietary).some(Boolean) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.dietary.vegetarian && (
                <span className="text-xs bg-[#333333] text-white px-2 py-1 rounded">Vegetarian</span>
              )}
              {item.dietary.vegan && <span className="text-xs bg-[#333333] text-white px-2 py-1 rounded">Vegan</span>}
              {item.dietary.glutenFree && (
                <span className="text-xs bg-[#333333] text-white px-2 py-1 rounded">Gluten Free</span>
              )}
              {item.dietary.dairyFree && (
                <span className="text-xs bg-[#333333] text-white px-2 py-1 rounded">Dairy Free</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button onClick={handleOrderNow} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FaShoppingBag size={14} /> Order Now
            </button>
          </div>
        </div>
      </div>


    </>
  );
};

export default MenuItemCard;
