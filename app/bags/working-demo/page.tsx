'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { PageContainer } from "@/components/templates/PageContainer";
import Image from 'next/image';

interface SimpleBag {
  id: string;
  name: string;
  items: SimpleBagItem[];
  totalAmount: number;
}

interface SimpleBagItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function BagPage() {
  const [bags, setBags] = useState<SimpleBag[]>([]);
  const [currentBag, setCurrentBag] = useState<SimpleBag | null>(null);
  const [newBagName, setNewBagName] = useState('');

  // Sample products
  const sampleProducts = [
    { id: '1', name: 'Fresh Bananas', price: 2.99, image: '/banana.avif' },
    { id: '2', name: 'Organic Apples', price: 4.99, image: '/placeholder.svg' },
    { id: '3', name: 'Green Lettuce', price: 1.99, image: '/placeholder.svg' },
    { id: '4', name: 'Tomatoes', price: 3.49, image: '/placeholder.svg' },
  ];

  // Initialize with a default bag
  useEffect(() => {
    const defaultBag: SimpleBag = {
      id: 'default-bag',
      name: 'My Shopping Bag',
      items: [],
      totalAmount: 0
    };
    setBags([defaultBag]);
    setCurrentBag(defaultBag);
  }, []);

  const createBag = () => {
    if (!newBagName.trim()) return;
    
    const newBag: SimpleBag = {
      id: `bag-${Date.now()}`,
      name: newBagName,
      items: [],
      totalAmount: 0
    };
    
    setBags(prev => [...prev, newBag]);
    setCurrentBag(newBag);
    setNewBagName('');
  };

  const addToBag = (product: typeof sampleProducts[0]) => {
    if (!currentBag) return;

    const updatedBags = bags.map(bag => {
      if (bag.id === currentBag.id) {
        const existingItem = bag.items.find(item => item.id === product.id);
        
        let updatedItems;
        if (existingItem) {
          updatedItems = bag.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          updatedItems = [
            ...bag.items,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
              image: product.image
            }
          ];
        }
        
        const totalAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const updatedBag = { ...bag, items: updatedItems, totalAmount };
        
        if (currentBag.id === bag.id) {
          setCurrentBag(updatedBag);
        }
        
        return updatedBag;
      }
      return bag;
    });
    
    setBags(updatedBags);
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (!currentBag) return;

    const updatedBags = bags.map(bag => {
      if (bag.id === currentBag.id) {
        const updatedItems = newQuantity <= 0
          ? bag.items.filter(item => item.id !== itemId)
          : bag.items.map(item =>
              item.id === itemId
                ? { ...item, quantity: newQuantity }
                : item
            );
        
        const totalAmount = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const updatedBag = { ...bag, items: updatedItems, totalAmount };
        
        if (currentBag.id === bag.id) {
          setCurrentBag(updatedBag);
        }
        
        return updatedBag;
      }
      return bag;
    });
    
    setBags(updatedBags);
  };

  const removeFromBag = (itemId: string) => {
    updateItemQuantity(itemId, 0);
  };

  const deleteBag = (bagId: string) => {
    const updatedBags = bags.filter(bag => bag.id !== bagId);
    setBags(updatedBags);
    
    if (currentBag?.id === bagId) {
      setCurrentBag(updatedBags.length > 0 ? updatedBags[0] : null);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Bags</h1>
          <p className="text-lg text-gray-600">Create and manage your shopping bags</p>
        </div>

        {/* Create New Bag */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Create New Bag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="text"
                value={newBagName}
                onChange={(e) => setNewBagName(e.target.value)}
                placeholder="Enter bag name (e.g., Weekly Groceries)"
                className="flex-1"
              />
              <Button 
                onClick={createBag}
                disabled={!newBagName.trim()}
              >
                Create Bag
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bags List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Bags ({bags.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {bags.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bags created yet</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bags.map((bag) => (
                  <Card
                    key={bag.id}
                    className={`cursor-pointer transition-all ${
                      currentBag?.id === bag.id
                        ? 'ring-2 ring-blue-500 border-blue-500'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setCurrentBag(bag)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{bag.name}</h3>
                        {bag.id !== 'default-bag' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBag(bag.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {bag.items.length} items
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        Rs {bag.totalAmount.toFixed(2)}
                      </p>
                      {currentBag?.id === bag.id && (
                        <Badge variant="secondary" className="mt-2">
                          Current
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle>Available Products</CardTitle>
            <CardDescription>
              Click &quot;Add to Bag&quot; to add items to your current bag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {sampleProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={128}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-lg font-bold text-green-600 mb-3">
                      Rs {product.price}
                    </p>
                    <Button
                      onClick={() => addToBag(product)}
                      disabled={!currentBag}
                      className="w-full"
                      size="sm"
                    >
                      Add to Bag
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Bag Details */}
        {currentBag && (
          <Card>
              <CardHeader>
              <CardTitle>
                {currentBag.name} - Rs {currentBag.totalAmount.toFixed(2)}
              </CardTitle>
              <CardDescription>
                {currentBag.items.length} {currentBag.items.length === 1 ? 'item' : 'items'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentBag.items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No items in this bag yet. Add some products above!
                </p>
              ) : (
                <div className="space-y-4">
                  {currentBag.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            Rs {item.price} each
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            Rs {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromBag(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">
                        Rs {currentBag.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <Button className="w-full mt-4" size="lg">
                      Proceed to Checkout
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
