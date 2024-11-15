'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import supabase from '@/lib/supabaseClient'

const ProductForm = ({ product, onSubmit, buttonText }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <Input name="name" placeholder="Product Name" defaultValue={product?.name} required />
    <Input name="vetsprice" type="number" step="0.01" placeholder="Vets Price" defaultValue={product?.vetsprice} required />
    <Input name="edgel" type="number" step="0.01" placeholder="Edgel Price" defaultValue={product?.edgel} required />
    <Input name="jerwinamy" type="number" step="0.01" placeholder="Jerwin/Amy Price" defaultValue={product?.jerwinamy} required />
    <Input name="lacosta" type="number" step="0.01" placeholder="Lacosta Price" defaultValue={product?.lacosta} required />
    <Input name="marilynlisa" type="number" step="0.01" placeholder="Marilyn/Lisa Price" defaultValue={product?.marilynlisa} required />
    <Input name="mitchee" type="number" step="0.01" placeholder="Mitchee Price" defaultValue={product?.mitchee} required />
    <Input name="acqpriceafterdeal" type="number" step="0.01" placeholder="Acquisition Price After Deal" defaultValue={product?.acqafterdeal} required />
    <Input name="deal" type="number" step="0.01" placeholder="Deal" defaultValue={product?.deal} required />
    <Input name="suppliername" placeholder="Supplier Name" defaultValue={product?.suppliername} />
    <Input name="acq_price_new" type="number" step="0.01" placeholder="Acquisition Price (New)" defaultValue={product?.acq_price_new} required />
    <Input name="purchase_qty" type="number" placeholder="Purchase Quantity" defaultValue={product?.purchase_qty} required />
    <Input name="purchase_date" type="date" placeholder="Date of Purchase" defaultValue={product?.purchase_date} required />
    <Button type="submit">{buttonText}</Button>
  </form>
)

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

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
    productData.vetsprice = parseFloat(productData.vetsprice)
    productData.edgel = parseFloat(productData.edgel)
    productData.jerwinamy = parseFloat(productData.jerwinamy)
    productData.lacosta = parseFloat(productData.lacosta)
    productData.marilynlisa = parseFloat(productData.marilynlisa)
    productData.mitchee = parseFloat(productData.mitchee)
    productData.acqpriceafterdeal = parseFloat(productData.acqpriceafterdeal)
    productData.deal = parseFloat(productData.deal)
    productData.acq_price_new = parseFloat(productData.acq_price_new)
    productData.purchase_qty = parseInt(productData.purchase_qty, 10)
    productData.suppliername = productData.suppliername // No parsing needed for string fields
    productData.purchase_date = productData.purchase_date // Leave as string from the input field
  
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
  
    // Ensure the UI reflects the updated data after insert/update
  if (Array.isArray(responseData)) {
    setProducts(prevProducts => [...prevProducts, ...responseData])  // Updating state with new data
  } else {
    console.error('Unexpected response data:', responseData)
  }

  // Optionally fetch the updated list of products again
  const { data: refreshedProducts, error: fetchError } = await supabase.from('products').select('*')
  if (fetchError) {
    console.error('Error fetching updated products:', fetchError.message)
    return
  }
  setProducts(refreshedProducts)  // Update the state with the latest data
  
    e.target.reset()
  }
  
  

  const handleDelete = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) console.error('Error deleting product:', error)
    else setProducts(products.filter(p => p.id !== id))
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Card className="flex-1 m-8">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="view">
            <TabsList>
              <TabsTrigger value="view" className="data-[state=active]:bg-black data-[state=active]:text-white px-4 py-2 rounded-lg">
                View Products
              </TabsTrigger>
              <TabsTrigger value="add" className="data-[state=active]:bg-black data-[state=active]:text-white px-4 py-2 rounded-lg">
                Add Product
              </TabsTrigger>
            </TabsList>
            <TabsContent value="view">
              <div className="mb-4 flex items-center">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mr-2"
                />
                <Button><Search size={20} /></Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Vets Price</TableHead>
                    <TableHead>Edgel</TableHead>
                    <TableHead>Jerwin/Amy</TableHead>
                    <TableHead>Lacosta</TableHead>
                    <TableHead>Marilyn/Lisa</TableHead>
                    <TableHead>Mitchee</TableHead>
                    <TableHead>Acq. Price (After Deal)</TableHead>
                    <TableHead>Acq. Price (New)</TableHead>
                    <TableHead>Deal</TableHead>
                    <TableHead>Purchase Qty</TableHead>
                    <TableHead>Date of Purchase</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
  {filteredProducts.map((product) => (
    <TableRow key={product.id}>
      <TableCell>{product.name}</TableCell>
      <TableCell>{(product.vetsprice || 0).toFixed(2)}</TableCell>
      <TableCell>{(product.edgel || 0).toFixed(2)}</TableCell>
      <TableCell>{(product.jerwinamy || 0).toFixed(2)}</TableCell>
      <TableCell>{(product.lacosta || 0).toFixed(2)}</TableCell>
      <TableCell>{(product.marilynlisa || 0).toFixed(2)}</TableCell>
      <TableCell>{(product.mitchee || 0).toFixed(2)}</TableCell>
      <TableCell>{(product.acqpriceafterdeal || 0).toFixed(2)}</TableCell>
      <TableCell>{(product.acq_price_new || 0).toFixed(2)}</TableCell>
      <TableCell>{(product.deal || 0).toFixed(2)}</TableCell>
      <TableCell>{product.purchase_qty || 0}</TableCell>
      <TableCell>{product.purchase_date || 'N/A'}</TableCell>
      <TableCell>
        <Button variant="ghost" onClick={() => setEditingProduct(product)}>
          <Edit size={18} />
        </Button>
        <Button variant="ghost" onClick={() => handleDelete(product.id)}>
          <Trash2 size={18} />
        </Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>


              </Table>
            </TabsContent>
            <TabsContent value="add">
              <ProductForm onSubmit={handleSubmit} buttonText="Add Product" />
            </TabsContent>
          </Tabs>
          {editingProduct && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Edit Product</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductForm product={editingProduct} onSubmit={(e) => handleSubmit(e, true)} buttonText="Update Product" />
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
