"use client"

import React from 'react'
import { MenuItem } from '../../lib/firestoreModels'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface MenuGridProps {
  items: MenuItem[]
}

export default function MenuGrid({ items }: MenuGridProps) {
  if (!items.length) {
    return <div className="text-center py-12 text-gray-500">No menu items found.</div>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {items.map((item, i) => (
        <motion.div
          key={item.id || item.name + i}
          whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(212,175,55,0.15)' }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Card className="flex flex-col h-full bg-otw-black-900 border-otw-gold-600/20 shadow-otw-md hover:border-otw-gold-600 transition-all">
            {item.image && (
              <Image
                src={item.image}
                alt={item.name}
                width={200} // Placeholder, adjust as needed
                height={150} // Placeholder, adjust as needed
                className="w-full h-48 object-cover rounded-t-md"
                priority={false} // Equivalent to loading="lazy"
              />
            )}
            <div className="flex-1 flex flex-col p-4">
              <h3 className="font-bold text-lg text-otw-gold-600 mb-1">{item.name}</h3>
              <p className="text-gray-300 text-sm mb-2 flex-1">{item.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold text-xl text-otw-gold-500">${item.price.toFixed(2)}</span>
                <Button size="sm" variant="primary" className="bg-otw-gold-600 hover:bg-otw-gold-700 text-otw-black-950">
                  Add to Cart
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}