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
    <Input name="vetsPrice" type="number" step="0.01" placeholder="Vets Price" defaultValue={product?.vetsPrice} required />
    <Input name="edgel" type="number" step="0.01" placeholder="Edgel Price" defaultValue={product?.edgel} required />
    <Input name="jerwinAmy" type="number" step="0.01" placeholder="Jerwin/Amy Price" defaultValue={product?.jerwinAmy} required />
    <Input name="lacosta" type="number" step="0.01" placeholder="Lacosta Price" defaultValue={product?.lacosta} required />
    <Input name="marilynLisa" type="number" step="0.01" placeholder="Marilyn/Lisa Price" defaultValue={product?.marilynLisa} required />
    <Input name="mitchee" type="number" step="0.01" placeholder="Mitchee Price" defaultValue={product?.mitchee} required />
    <Input name="acqPriceAfterDeal" type="number" step="0.01" placeholder="Acquisition Price After Deal" defaultValue={product?.acqPriceAfterDeal} required />
    <Input name="deal" type="number" step="0.01" placeholder="Deal" defaultValue={product?.deal} required />
    <Input name="supplierName" placeholder="Supplier Name" defaultValue={product?.supplierName} />
    <Input name="acqPriceNew" type="number" step="0.01" placeholder="Acquisition Price (New)" defaultValue={product?.acqPriceNew} required />
    <Input name="purchaseQty" type="number" placeholder="Purchase Quantity" defaultValue={product?.purchaseQty} required />
    <Input name="dateOfPurchase" type="date" placeholder="Date of Purchase" defaultValue={product?.dateOfPurchase} required />
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

    productData.vetsPrice = parseFloat(productData.vetsPrice)
    productData.edgel = parseFloat(productData.edgel)
    productData.jerwinAmy = parseFloat(productData.jerwinAmy)
    productData.lacosta = parseFloat(productData.lacosta)
    productData.marilynLisa = parseFloat(productData.marilynLisa)
    productData.mitchee = parseFloat(productData.mitchee)
    productData.acqPriceAfterDeal = parseFloat(productData.acqPriceAfterDeal)
    productData.deal = parseFloat(productData.deal)
    productData.acqPriceNew = parseFloat(productData.acqPriceNew)
    productData.purchaseQty = parseInt(productData.purchaseQty, 10)

    if (isEditing) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id)

      if (error) console.error('Error updating product:', error)
      else {
        setProducts(products.map(p => (p.id === editingProduct.id ? { ...p, ...productData } : p)))
        setEditingProduct(null)
      }
    } else {
      const { data, error } = await supabase.from('products').insert([productData])
      if (error) console.error('Error adding product:', error)
      else setProducts([...products, ...data])
    }
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
                      <TableCell>{product.vetsPrice.toFixed(2)}</TableCell>
                      <TableCell>{product.edgel.toFixed(2)}</TableCell>
                      <TableCell>{product.jerwinAmy.toFixed(2)}</TableCell>
                      <TableCell>{product.lacosta.toFixed(2)}</TableCell>
                      <TableCell>{product.marilynLisa.toFixed(2)}</TableCell>
                      <TableCell>{product.mitchee.toFixed(2)}</TableCell>
                      <TableCell>{product.acqPriceAfterDeal.toFixed(2)}</TableCell>
                      <TableCell>{product.acqPriceNew.toFixed(2)}</TableCell>
                      <TableCell>{product.deal.toFixed(2)}</TableCell>
                      <TableCell>{product.purchaseQty}</TableCell>
                      <TableCell>{product.dateOfPurchase}</TableCell>
                      <TableCell>
                        <Button variant="ghost" onClick={() => setEditingProduct(product)}><Edit size={18} /></Button>
                        <Button variant="ghost" onClick={() => handleDelete(product.id)}><Trash2 size={18} /></Button>
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
