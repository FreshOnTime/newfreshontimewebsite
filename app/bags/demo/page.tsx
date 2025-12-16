'use client';

import { useState, useEffect } from 'react';
import { BagProvider, useBag } from '@/contexts/BagContext';
import { Product } from '@/models/product';

function BagDemo() {
  const {
    bags,
    currentBag,
    loading,
    error,
    createBag,
    addToBag,
    removeFromBag
  } = useBag();

  const [products, setProducts] = useState<Product[]>([]);
  const [newBagName, setNewBagName] = useState('');

  type Priceable = { price?: number };

  // Mock products for demo
  useEffect(() => {
    setProducts([
      {
        _id: '1',
        name: 'Fresh Bananas',
        description: 'Sweet and ripe bananas',
        price: 2.99,
        images: [{ url: '/banana.avif', alt: 'Bananas' }],
        category: 'fruits',
        stock: 50,
        unit: 'kg',
        isActive: true,
        tags: ['fresh', 'organic']
      },
      {
        _id: '2',
        name: 'Organic Apples',
        description: 'Crisp red apples',
        price: 4.99,
        images: [{ url: '/placeholder.svg', alt: 'Apples' }],
        category: 'fruits',
        stock: 30,
        unit: 'kg',
        isActive: true,
        tags: ['fresh', 'organic']
      }
    ] as unknown as Product[]);
  }, []);

  const handleCreateBag = async () => {
    if (newBagName.trim()) {
      await createBag(newBagName.trim());
      setNewBagName('');
    }
  };

  const handleAddToBag = async (product: Product) => {
    if (currentBag) {
      await addToBag(currentBag.id, product, 1);
    } else {
      alert('Please create a bag first');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Bag Management Demo</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Create Bag Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Create New Bag</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newBagName}
            onChange={(e) => setNewBagName(e.target.value)}
            placeholder="Enter bag name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreateBag}
            disabled={loading || !newBagName.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Create Bag
          </button>
        </div>
      </div>

      {/* Bags List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Bags ({bags.length})</h2>
        {loading && <p>Loading...</p>}
        {bags.length === 0 ? (
          <p className="text-gray-500">No bags created yet</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bags.map((bag) => (
              <div
                key={bag.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${currentBag?.id === bag.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <h3 className="font-semibold">{bag.name}</h3>
                <p className="text-sm text-gray-600">
                  {bag.items.length} items
                </p>
                <p className="text-sm font-medium">
                  Total: Rs {bag.items.reduce((sum, item) => sum + (((item.product as Priceable).price || 0) * item.quantity), 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Products Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product._id} className="border border-gray-200 rounded-lg p-4">
              <img
                src={(product as unknown as { images?: Array<{ url?: string }> }).images?.[0]?.url || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-32 object-cover rounded-md mb-3"
              />
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              <p className="text-lg font-bold mb-3">Rs {(product as Priceable).price}</p>
              <button
                onClick={() => handleAddToBag(product)}
                disabled={loading || !currentBag}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Add to Current Bag
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Current Bag Details */}
      {currentBag && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Current Bag: {currentBag.name}
          </h2>
          {currentBag.items.length === 0 ? (
            <p className="text-gray-500">No items in this bag</p>
          ) : (
            <div className="space-y-3">
              {currentBag.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.product.images?.[0]?.url || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">
                        Rs {(item.product as Priceable).price} x {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      Rs {(((item.product as Priceable).price || 0) * item.quantity).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromBag(currentBag.id, item.product._id || '')}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total:</span>
                  <span>
                    Rs {currentBag.items.reduce((sum, item) => sum + (((item.product as Priceable).price || 0) * item.quantity), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BagPage() {
  return (
    <BagProvider>
      <BagDemo />
    </BagProvider>
  );
}
