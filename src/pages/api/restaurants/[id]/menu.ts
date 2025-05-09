import type { NextApiRequest, NextApiResponse } from 'next'

const sampleMenus: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Sample Restaurant',
    menu: [
      { id: 'm1', name: 'Burger', price: 9.99, description: 'Juicy beef burger with cheese.' },
      { id: 'm2', name: 'Fries', price: 3.99, description: 'Crispy golden fries.' },
      { id: 'm3', name: 'Salad', price: 6.99, description: 'Fresh garden salad.' },
    ],
  },
  '2': {
    id: '2',
    name: 'Another Restaurant',
    menu: [
      { id: 'm1', name: 'Pizza', price: 12.99, description: 'Cheesy pepperoni pizza.' },
      { id: 'm2', name: 'Wings', price: 8.99, description: 'Spicy chicken wings.' },
    ],
  },
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const menu = sampleMenus[id as string]
  if (menu) {
    res.status(200).json(menu)
  } else {
    res.status(404).json({ error: 'Menu not found' })
  }
} 