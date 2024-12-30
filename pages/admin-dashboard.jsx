'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, Filter, Search, Pill, Stethoscope } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import supabase from '@/lib/supabaseClient'

const ProductForm = ({ product, onSubmit, buttonText }) => (
  <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
    <Input name="name" placeholder="Product Name" defaultValue={product?.name} required className="border-teal-300 focus:border-teal-500" />
    <Input name="vetsprice" step="0.01" placeholder="Vets Price" defaultValue={product?.vetsprice} className="border-teal-300 focus:border-teal-500" />
    <Input name="edgel" step="0.01" placeholder="Edgel Price" defaultValue={product?.edgel} className="border-teal-300 focus:border-teal-500" />
    <Input name="jerwinamy" step="0.01" placeholder="Jerwin/Amy Price" defaultValue={product?.jerwinamy} className="border-teal-300 focus:border-teal-500" />
    <Input name="lacosta" step="0.01" placeholder="Lacosta Price" defaultValue={product?.lacosta} className="border-teal-300 focus:border-teal-500" />
    <Input name="marilynlisa" step="0.01" placeholder="Marilyn/Lisa Price" defaultValue={product?.marilynlisa} className="border-teal-300 focus:border-teal-500" />
    <Input name="mitchee" step="0.01" placeholder="Mitchee Price" defaultValue={product?.mitchee} className="border-teal-300 focus:border-teal-500" />
    <Input name="acqpriceafterdeal" step="0.01" placeholder="Acquisition Price After Deal" defaultValue={product?.acqpriceafterdeal} className="border-teal-300 focus:border-teal-500" />
    <Input name="acq_price_new" step="0.01" placeholder="Acquisition Price (New)" defaultValue={product?.acq_price_new} className="border-teal-300 focus:border-teal-500" />
    <Input name="deal" step="0.01" placeholder="Deal" defaultValue={product?.deal} className="border-teal-300 focus:border-teal-500" />
    <Input name="purchase_qty" type="number" placeholder="Purchase Quantity" defaultValue={product?.purchase_qty} className="border-teal-300 focus:border-teal-500" />
    <Input name="purchase_date" type="date" placeholder="Date of Purchase" defaultValue={product?.purchase_date} className="border-teal-300 focus:border-teal-500" />
    <Input name="suppliername" placeholder="Supplier Name" defaultValue={product?.suppliername} className="border-teal-300 focus:border-teal-500" />
    <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white">{buttonText}</Button>
  </form>
)

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPromo, setFilterPromo] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*')
    if (error) console.error('Error fetching products:', error)
    else setProducts(data)
  }

  const handleSubmit = async (e, isEditing = false) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const productData = Object.fromEntries(formData.entries())
  
    // Parse numeric fields
    productData.vetsprice = parseFloat(productData.vetsprice) || null
    productData.edgel = parseFloat(productData.edgel) || null
    productData.jerwinamy = parseFloat(productData.jerwinamy) || null
    productData.lacosta = parseFloat(productData.lacosta) || null
    productData.marilynlisa = parseFloat(productData.marilynlisa) || null
    productData.mitchee = parseFloat(productData.mitchee) || null
    productData.acqpriceafterdeal = parseFloat(productData.acqpriceafterdeal) || null
    productData.deal = parseFloat(productData.deal) || null
    productData.acq_price_new = parseFloat(productData.acq_price_new) || null
    productData.purchase_qty = parseInt(productData.purchase_qty, 10) || null
    productData.suppliername = productData.suppliername || null
    productData.purchase_date = productData.purchase_date || null
  
    let responseData, error
  
    if (isEditing) {
      const result = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id)
      
      error = result.error
      responseData = result.data
    } else {
      const result = await supabase.from('products').insert([productData])
  
      error = result.error
      responseData = result.data
    }
  
    if (error) {
      console.error('Error:', error.message)
      console.error('Details:', error.details)
      return
    }
  
    if (Array.isArray(responseData)) {
      setProducts(prevProducts => [...prevProducts, ...responseData])
    } else {
      console.error('Unexpected response data:', responseData)
    }

    const { data: refreshedProducts, error: fetchError } = await supabase.from('products').select('*')
    if (fetchError) {
      console.error('Error fetching updated products:', fetchError.message)
      return
    }
    setProducts(refreshedProducts)
  
    e.target.reset()
    setEditingProduct(null)
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) console.error('Error deleting product:', error)
    else setProducts(products.filter(p => p.id !== id))
  }

  const filteredProducts = products.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const promoMatch = filterPromo
      ? /(promo|promo only)/i.test(product.name) || 
        /(promo|promo only)/i.test(product.acq_price_new) || 
        /(promo|promo only)/i.test(product.vetsprice) || 
        /(promo|promo only)/i.test(product.edgel) || 
        /(promo|promo only)/i.test(product.jerwinamy) ||
        /(promo|promo only)/i.test(product.lacosta) ||
        /(promo|promo only)/i.test(product.marilynlisa) ||
        /(promo|promo only)/i.test(product.mitchee)
      : true
    return nameMatch && promoMatch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-blue-100">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-teal-800 flex items-center">
            <Stethoscope className="mr-2" /> Syrincal System Management
          </h1>
        </header>
        <Card className="bg-white shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-teal-500 text-white">
            <CardTitle className="text-2xl">Product Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="view" className="mt-4">
              <TabsList className="bg-teal-100 p-1 rounded-lg">
                <TabsTrigger value="view" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white px-4 py-2 rounded-md transition-all">
                  View Products
                </TabsTrigger>
                <TabsTrigger value="add" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white px-4 py-2 rounded-md transition-all">
                  Add Product
                </TabsTrigger>
              </TabsList>
              <TabsContent value="view">
                <div className="mb-4 flex items-center space-x-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border-teal-300 focus:border-teal-500 rounded-md"
                    />
                  </div>
                  <Button
                    onClick={() => setFilterPromo(!filterPromo)}
                    className={`flex items-center ${filterPromo ? 'bg-teal-500 text-white' : 'bg-white text-teal-500 border border-teal-500'} hover:bg-teal-600 hover:text-white transition-colors`}
                  >
                    <Filter className="mr-2" size={16} />
                    {filterPromo ? 'Show All' : 'Promo Only'}
                  </Button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader className="bg-teal-50">
                      <TableRow>
                        <TableHead className="font-semibold text-teal-800">Product</TableHead>
                        <TableHead className="font-semibold text-teal-800">Vets Price</TableHead>
                        <TableHead className="font-semibold text-teal-800">Edgel</TableHead>
                        <TableHead className="font-semibold text-teal-800">Jerwin/Amy</TableHead>
                        <TableHead className="font-semibold text-teal-800">Lacosta</TableHead>
                        <TableHead className="font-semibold text-teal-800">Marilyn/Lisa</TableHead>
                        <TableHead className="font-semibold text-teal-800">Mitchee</TableHead>
                        <TableHead className="font-semibold text-teal-800">Acq. Price (After Deal)</TableHead>
                        <TableHead className="font-semibold text-teal-800">Acq. Price (New)</TableHead>
                        <TableHead className="font-semibold text-teal-800">Deal</TableHead>
                        <TableHead className="font-semibold text-teal-800">Quantity</TableHead>
                        <TableHead className="font-semibold text-teal-800">Purchase Date</TableHead>
                        <TableHead className="font-semibold text-teal-800">Supplier</TableHead>
                        <TableHead className="font-semibold text-teal-800">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id} className="hover:bg-teal-50 transition-colors">
                          {editingProduct?.id === product.id ? (
                            <TableCell colSpan={14}>
                              <ProductForm
                                product={product}
                                onSubmit={(e) => handleSubmit(e, true)}
                                buttonText="Save Changes"
                              />
                            </TableCell>
                          ) : (
                            <>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>{product.vetsprice}</TableCell>
                              <TableCell>{product.edgel}</TableCell>
                              <TableCell>{product.jerwinamy}</TableCell>
                              <TableCell>{product.lacosta}</TableCell>
                              <TableCell>{product.marilynlisa}</TableCell>
                              <TableCell>{product.mitchee}</TableCell>
                              <TableCell>{product.acqpriceafterdeal}</TableCell>
                              <TableCell>{product.acq_price_new}</TableCell>
                              <TableCell>{product.deal}</TableCell>
                              <TableCell>{product.purchase_qty}</TableCell>
                              <TableCell>{product.purchase_date}</TableCell>
                              <TableCell>{product.suppliername}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button onClick={() => setEditingProduct(product)} variant="outline" size="sm" className="bg-teal-100 hover:bg-teal-200 text-teal-700">
                                    <Edit size={16} className="mr-1" /> Edit
                                  </Button>
                                  <Button onClick={() => handleDelete(product.id)} variant="outline" size="sm" className="bg-red-100 hover:bg-red-200 text-red-700">
                                    <Trash2 size={16} className="mr-1" /> Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="add">
                <div className="bg-teal-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-teal-800 mb-4 flex items-center">
                    <Pill className="mr-2" /> Add New Product
                  </h3>
                  <ProductForm onSubmit={handleSubmit} buttonText="Add Product" />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}