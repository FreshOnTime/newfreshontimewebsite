"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserCog, CheckCircle, AlertCircle } from "lucide-react";
import { AdminOverview } from "@/components/admin/AdminOverview";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [userId, setUserId] = useState('');

  const handleMakeAdmin = async () => {
    if (!userId.trim()) {
      setMessage('Please enter a User ID');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId.trim() }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage(`Successfully made ${data.data?.firstName || userId} an admin!`);
        setMessageType('success');
        setUserId('');
      } else {
        setMessage(data.message || 'Failed to make user admin');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      setMessage('Error making user admin');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Seed flow removed

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6">Overview of your store performance and key metrics</p>
        <AdminOverview />
      </div>

      {/* Admin Tools Section */}
      <div className="border-t pt-6">
        <h2 className="text-2xl font-bold mb-4">Admin Tools</h2>
        
        {message && (
          <Alert className={`mb-6 ${messageType === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            {messageType === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription className={messageType === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

  <div className="grid gap-6 md:grid-cols-2">
          {/* Make User Admin Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Make User Admin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  placeholder="Enter user ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button 
                onClick={handleMakeAdmin} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Making Admin...
                  </>
                ) : (
                  'Make Admin'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* (Removed Seed Database tool) */}
        </div>
      </div>
    </div>
  );
}
