'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ShoppingCart, Search, Menu, X } from 'lucide-react'

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Function to determine the pricing column based on email
  const getPriceColumn = (email) => {
    const username = email?.split('@')[0];
    const pricingColumns = ['edgel', 'jerwinamy', 'lacosta', 'marilynlisa', 'mitchee'];
    return pricingColumns.includes(username) ? username : 'vetsprice';
  };

  // Function to fetch products
  const fetchProducts = async (email) => {
    const priceColumn = getPriceColumn(email);

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`name, ${priceColumn}`);

      if (error) {
        throw error;
      }

      // Map the fetched data into an array of product objects with names and prices
      return data.map((item) => ({
        name: item.name,
        price: item[priceColumn],  // Dynamically use the price column based on the email
      }));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again later.');
      return [];
    }
  };

  // Fetch products on page load
  useEffect(() => {
    const fetchAndSetProducts = async () => {
      setLoading(true);

      try {
        // Get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          setError('User not logged in.');
          setLoading(false);
          return;
        }

        const email = sessionData.session.user.email;
        const fetchedProducts = await fetchProducts(email);

        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching user or products:', err);
        setError('Failed to fetch user or products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetProducts();
  }, []);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.name === product.name);
      if (existingItem) {
        return prevCart.map((item) =>
          item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render loading, error, or product list
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 mt-4">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">VetVials</h1>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="text-gray-600 hover:text-blue-600 transition-colors">
              <Search className="w-6 h-6" />
            </button>
            <button className="text-gray-600 hover:text-blue-600 transition-colors relative">
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
            <button 
              className="text-gray-600 hover:text-blue-600 transition-colors md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <nav className="md:hidden bg-white">
            <ul className="py-2 px-4 space-y-2">
              <li>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </li>
              <li><a href="#" className="block py-2 text-gray-600 hover:text-blue-600">Products</a></li>
              <li><a href="#" className="block py-2 text-gray-600 hover:text-blue-600">About</a></li>
              <li><a href="#" className="block py-2 text-gray-600 hover:text-blue-600">Contact</a></li>
            </ul>
          </nav>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.name} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">
                  ₱{isNaN(product.price) ? 'Price unavailable' : Number(product.price).toFixed(2)}
                </p>
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-300"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About VetVials</h3>
              <p className="text-gray-400">Providing quality veterinary supplies for your practice.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Products</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-gray-400">Email: info@vetvials.com</p>
              <p className="text-gray-400">Phone: (555) 123-4567</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; 2023 VetVials. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

