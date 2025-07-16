import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const LoginForm = ({ onLogin, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const adminCredentials = {
    username: 'admin',
    password: 'admin123'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (formData.username === adminCredentials.username && 
          formData.password === adminCredentials.password) {
        onLogin(true);
        toast({
          title: "Login Berhasil! 🎉",
          description: "Selamat datang, Admin!",
        });
        onClose();
      } else {
        toast({
          title: "Login Gagal! ❌",
          description: "Username atau password salah",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DialogContent className="max-w-md bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500">
      <DialogHeader>
        <DialogTitle className="text-white flex items-center gap-2 justify-center">
          <Lock className="w-5 h-5" />
          Login Admin
        </DialogTitle>
      </DialogHeader>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-purple-200">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Masukkan username"
                className="pl-10 bg-white/10 border-purple-300 text-white placeholder:text-purple-300"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-purple-200">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Masukkan password"
                className="pl-10 pr-10 bg-white/10 border-purple-300 text-white placeholder:text-purple-300"
                required
              />
              <Button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto bg-transparent hover:bg-transparent"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-purple-400" />
                ) : (
                  <Eye className="w-4 h-4 text-purple-400" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="border-red-300 text-red-100 hover:bg-red-800"
            disabled={isLoading}
          >
            Batal
          </Button>
          
          <Button
            type="submit"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="spinner"></div>
                Login...
              </div>
            ) : (
              'Login'
            )}
          </Button>
        </div>
      </motion.form>
    </DialogContent>
  );
};

export default LoginForm;
