'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Search, Menu, X, ChevronLeft, ChevronRight, Heart, Award, Shield, Clock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const products = [
  { id: 1, name: 'Premium Vaccine Vial', price: 15.99, image: '/placeholder.svg?height=200&width=200', category: 'Vaccines', rating: 4.8 },
  { id: 2, name: 'Advanced Antibiotic Solution', price: 24.99, image: '/placeholder.svg?height=200&width=200', category: 'Medications', rating: 4.9 },
  { id: 3, name: 'Precision Syringe Pack', price: 9.99, image: '/placeholder.svg?height=200&width=200', category: 'Supplies', rating: 4.7 },
  { id: 4, name: 'Ultra-Comfort Sterile Gloves', price: 7.99, image: '/placeholder.svg?height=200&width=200', category: 'Supplies', rating: 4.6 },
  { id: 5, name: 'Eco-Friendly Disinfectant Spray', price: 12.99, image: '/placeholder.svg?height=200&width=200', category: 'Cleaning', rating: 4.8 },
  { id: 6, name: 'Quick-Heal Bandage Roll', price: 5.99, image: '/placeholder.svg?height=200&width=200', category: 'Supplies', rating: 4.5 },
  { id: 7, name: 'Vital-Boost Pet Vitamins', price: 18.99, image: '/placeholder.svg?height=200&width=200', category: 'Supplements', rating: 4.7 },
  { id: 8, name: 'Pro-Clean Dental Kit', price: 29.99, image: '/placeholder.svg?height=200&width=200', category: 'Dental', rating: 4.9 }
]

const categories = ['All', 'Vaccines', 'Medications', 'Supplies', 'Cleaning', 'Supplements', 'Dental']

const testimonials = [
  { id: 1, name: 'Dr. Sarah Johnson', role: 'Veterinarian', content: 'VetVials has revolutionized how I stock my clinic. The quality and reliability of their products are unmatched.' },
  { id: 2, name: 'Dr. Michael Chen', role: 'Animal Hospital Director', content: 'The convenience and range of products offered by VetVials have significantly improved our operational efficiency.' },
  { id: 3, name: 'Dr. Emily Rodriguez', role: 'Wildlife Veterinarian', content: 'Even in remote locations, I can count on VetVials for timely delivery of crucial supplies. It\'s a game-changer for wildlife care.' },
]

export default function Home() {
  const [cart, setCart] = useState([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentSlide, setCurrentSlide] = useState(0)

  const addToCart = (productId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prevCart, { id: productId, quantity: 1 }]
    })
  }

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)

  useEffect(() => {
    const filtered = products.filter((product) => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'All' || product.category === selectedCategory)
    )
    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory])

  const featuredProducts = products.slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.h1 
            className="text-3xl font-bold text-blue-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            VetVials
          </motion.h1>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-gray-100 border-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5 text-blue-600" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              {cartItemsCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 bg-red-500">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
            <Button 
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5 text-blue-600" /> : <Menu className="w-5 h-5 text-blue-600" />}
            </Button>
          </div>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav 
              className="md:hidden bg-white"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="py-2 px-4 space-y-2">
                <li>
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full mb-2 bg-gray-100 border-none focus:ring-2 focus:ring-blue-400"
                  />
                </li>
                <li><a href="#" className="block py-2 text-blue-600 hover:text-blue-800">Products</a></li>
                <li><a href="#" className="block py-2 text-blue-600 hover:text-blue-800">About</a></li>
                <li><a href="#" className="block py-2 text-blue-600 hover:text-blue-800">Contact</a></li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-16">
          <motion.h2 
            className="text-4xl font-semibold text-gray-800 mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Empowering Veterinary Excellence
          </motion.h2>
          <div className="relative">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <motion.div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredProducts.map((product) => (
                  <div key={product.id} className="w-full flex-shrink-0">
                    <Card className="relative h-96 border-none">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-3xl font-bold mb-2">{product.name}</h3>
                        <p className="text-xl mb-4">${product.price.toFixed(2)}</p>
                        <Button onClick={() => addToCart(product.id)} className="bg-blue-600 hover:bg-blue-700 text-white">
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </motion.div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? featuredProducts.length - 1 : prev - 1))}
            >
              <ChevronLeft className="w-6 h-6 text-blue-600" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={() => setCurrentSlide((prev) => (prev === featuredProducts.length - 1 ? 0 : prev + 1))}
            >
              <ChevronRight className="w-6 h-6 text-blue-600" />
            </Button>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Why Choose VetVials?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-lg border-none">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Award className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
                <p className="text-gray-600">Our products meet the highest standards in veterinary care.</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg border-none">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Shield className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Trusted by Professionals</h3>
                <p className="text-gray-600">Veterinarians across the country rely on our supplies.</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg border-none">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Clock className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Get what you need, when you need it, with our speedy shipping.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Our Products</h2>
          <Tabs defaultValue="All" className="w-full">
            <TabsList className="mb-8 flex flex-wrap justify-center">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  onClick={() => setSelectedCategory(category)}
                  className="px-4 py-2 m-1 text-blue-600 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="All" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <motion.div 
                    key={product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden transform transition-transform hover:scale-105 border-none shadow-lg">
                      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                      <CardContent className="flex-grow p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                        <p className="text-blue-600 font-bold mb-2">${product.price.toFixed(2)}</p>
                        <div className="flex items-center mb-4">
                          <span className="text-yellow-400 mr-1">★</span>
                          <span className="text-gray-600">{product.rating.toFixed(1)}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button onClick={() => addToCart(product.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          Add to Cart
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-white shadow-lg border-none">
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold text-lg">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{testimonial.name}</p>
                      <p className="text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4">VetVials</h3>
              <p className="text-blue-200">Empowering veterinary professionals with top-quality supplies and exceptional service. Your trusted partner in animal care.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Products</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-blue-200 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-blue-200">Email: support@vetvials.com</p>
              <p className="text-blue-200">Phone: (555) 123-4567</p>
              <p className="text-blue-200 mt-4">123 Veterinary Lane, Animal City, VC 12345</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-blue-800 text-center text-blue-200">
            <p>&copy; 2023 VetVials. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

