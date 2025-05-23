import type { NextApiRequest, NextApiResponse } from "next";

const sampleGroceries: Record<string, any> = {
  walmart: {
    store: "Walmart",
    items: [
      {
        id: "g1",
        name: "Milk",
        price: 2.99,
        description: "1 gallon whole milk.",
      },
      { id: "g2", name: "Eggs", price: 1.99, description: "Dozen large eggs." },
      {
        id: "g3",
        name: "Bread",
        price: 2.49,
        description: "Whole wheat bread.",
      },
    ],
  },
  kroger: {
    store: "Kroger",
    items: [
      { id: "g1", name: "Bananas", price: 0.59, description: "Per pound." },
      {
        id: "g2",
        name: "Chicken Breast",
        price: 4.99,
        description: "Boneless, skinless.",
      },
      { id: "g3", name: "Orange Juice", price: 3.99, description: "1 gallon." },
    ],
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { store } = req.query;
  const groceries = sampleGroceries[(store as string).toLowerCase()];
  if (groceries) {
    res.status(200).json(groceries);
  } else {
    res.status(404).json({ error: "Store not found" });
  }
}
