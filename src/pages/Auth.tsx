import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Building, Mail, Lock, UserPlus, LogIn } from 'lucide-react';

interface AuthProps {
  onLogin: (user: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    employeeId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email: formData.email,
      name: formData.name || formData.email.split('@')[0],
      employeeId: formData.employeeId || `EMP${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      avatar: formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
    };
    localStorage.setItem('user', JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building className="text-purple-600" size={32} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              TeamSync Pro
            </h1>
          </div>
          <CardTitle className="text-xl">
            {isLogin ? 'Welcome Back' : 'Join TeamSync'}
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {isLogin ? 'Sign in to your workspace' : 'Create your account to start collaborating'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" placeholder="Enter your full name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required={!isLogin} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID (Optional)</Label>
                  <Input id="employeeId" type="text" placeholder="Your employee ID" value={formData.employeeId} onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))} />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input id="email" type="email" placeholder="Enter your email" className="pl-10" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input id="password" type="password" placeholder="Enter your password" className="pl-10" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
              {isLogin ? (<><LogIn className="mr-2 h-4 w-4" />Sign In</>) : (<><UserPlus className="mr-2 h-4 w-4" />Create Account</>)}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">Demo: Use any email/password to login</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
