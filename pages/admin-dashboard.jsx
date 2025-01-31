"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
  Pill,
  Stethoscope,
  Warehouse,
  ShoppingCart,
  ClipboardList,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "../lib/supabaseClient";

const ProductForm = ({ product, onSubmit, buttonText }) => {
  const initialDate =
    product?.purchase_date || new Date().toISOString().split("T")[0];
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-white p-6 rounded-lg shadow-md"
    >
      <Input
        name="name"
        placeholder="Product Name"
        defaultValue={product?.name}
        required
      />
      <Input
        name="vetsprice"
        type="number"
        step="0.01"
        placeholder="Selling Price"
        defaultValue={product?.vetsprice}
        required
      />
      <Input
        name="acq_price_new"
        type="number"
        step="0.01"
        placeholder="Acquisition Price"
        defaultValue={product?.acq_price_new}
        required
      />
      <Input
        name="purchase_qty"
        type="number"
        placeholder="Quantity"
        defaultValue={product?.purchase_qty}
        required
      />
      <Input
        name="purchase_date"
        type="date"
        defaultValue={initialDate}
        required
      />
      <Input
        name="suppliername"
        placeholder="Supplier"
        defaultValue={product?.suppliername}
      />
      <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600">
        {buttonText}
      </Button>
    </form>
  );
};

const SaleForm = ({ products, onSubmit }) => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const product = products.find((p) => p.id === selectedProduct) || {
    remaining: 0,
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 bg-white p-6 rounded-lg shadow-md"
    >
      <Select onValueChange={setSelectedProduct} required name="product_id">
        <SelectTrigger>
          <SelectValue placeholder="Select Product" />
        </SelectTrigger>
        <SelectContent>
          {products
            .filter((p) => p.remaining > 0)
            .map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} (Stock: {p.remaining}) @ ₱{p.vetsprice}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Input name="client_name" placeholder="Client Name" required />
      <Input
        name="quantity"
        type="number"
        placeholder="Quantity"
        max={product.remaining}
        required
      />
      <Input
        name="sale_date"
        type="date"
        defaultValue={new Date().toISOString().split("T")[0]}
        required
      />
      <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600">
        Record Sale
      </Button>
    </form>
  );
};

export default function InventoryManager() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  // Add these state variables at the top of the component
  const [selectedProductYear, setSelectedProductYear] = useState(
    new Date().getFullYear()
  );
  const [selectedProductMonth, setSelectedProductMonth] = useState(
    new Date().getMonth() + 1
  );

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("productsdata")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProducts(data);
  };

  const fetchSales = async () => {
    const { data, error } = await supabase
      .from("salesdata")
      .select("*, productsdata(name, vetsprice, acq_price_new)") // Add acq_price_new
      .order("created_at", { ascending: false });

    if (!error) setSales(data);
  };

  const handleProductSubmit = async (e, isEditing) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = {
      name: formData.get("name"),
      vetsprice: parseFloat(formData.get("vetsprice")),
      acq_price_new: parseFloat(formData.get("acq_price_new")),
      purchase_qty: parseInt(formData.get("purchase_qty"), 10),
      remaining: parseInt(formData.get("purchase_qty"), 10),
      purchase_date: formData.get("purchase_date"),
      suppliername: formData.get("suppliername"),
    };

    if (isEditing) {
      const { error } = await supabase
        .from("productsdata")
        .update(productData)
        .eq("id", editingProduct.id);

      if (!error) {
        await fetchProducts();
        setEditingProduct(null);
      }
    } else {
      const { error } = await supabase
        .from("productsdata")
        .insert([productData]);

      if (!error) await fetchProducts();
    }
  };

  // Update handleDeleteProduct function
const handleDeleteProduct = async (id) => {
  const { error } = await supabase
    .from("productsdata")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete error:", error);
    alert("Error deleting product: " + error.message);
  } else {
    await fetchProducts();
    alert("Product deleted successfully");
  }
};

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = products.find((p) => p.id === formData.get("product_id"));

    const saleData = {
      product_id: formData.get("product_id"),
      client_name: formData.get("client_name"),
      sale_price: product.vetsprice,
      quantity: parseInt(formData.get("quantity"), 10),
      sale_date: formData.get("sale_date"),
    };

    const newStock = product.remaining - saleData.quantity;

    const { error } = await supabase.from("salesdata").insert([saleData]);

    if (!error) {
      await supabase
        .from("productsdata")
        .update({ remaining: newStock })
        .eq("id", product.id);

      await Promise.all([fetchProducts(), fetchSales()]);
    }
  };

  const getInventorySummary = () => {
    // Inventory Metrics
    const inventorySummary = products.reduce(
      (acc, product) => {
        acc.totalItems += product.remaining; // Current stock count
        acc.revenueInInventory += product.vetsprice * product.remaining; // Revenue in inventory
        return acc;
      },
      { totalItems: 0, revenueInInventory: 0 }
    );
  
    // Sales Metrics (filtered by selected month/year)
    const salesSummary = sales
      .filter((sale) => {
        const saleDate = new Date(sale.sale_date);
        return (
          saleDate.getFullYear() === selectedYear &&
          saleDate.getMonth() + 1 === selectedMonth
        );
      })
      .reduce(
        (acc, sale) => {
          acc.totalSoldItems += sale.quantity; // Total items sold
          acc.grossIncome += sale.quantity * sale.sale_price; // Gross income for the month
          return acc;
        },
        { totalSoldItems: 0, grossIncome: 0 }
      );
  
    return { ...inventorySummary, ...salesSummary };
  };

  // Update the groupInventoryBatches function
  const groupInventoryBatches = () => {
    const batches = {};
    products
      .filter((product) => {
        const purchaseDate = new Date(product.purchase_date);
        return (
          purchaseDate.getFullYear() === selectedYear &&
          purchaseDate.getMonth() + 1 === selectedMonth
        );
      })
      .forEach((product) => {
        // Include purchase_date in the key to ensure uniqueness
        const key = `${product.id}-${product.name}-${product.acq_price_new}-${product.vetsprice}-${product.purchase_date}`;
        if (!batches[key]) {
          batches[key] = {
            name: product.name,
            acq_price: product.acq_price_new,
            sell_price: product.vetsprice,
            total_stock: 0,
            batches: [],
          };
        }
        batches[key].total_stock += product.remaining;
        batches[key].batches.push({
          id: product.id,
          purchase_date: product.purchase_date,
          quantity: product.remaining,
          supplier: product.suppliername,
        });
      });
    return Object.values(batches);
  };

  const getFilteredSales = () => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.sale_date);
      return (
        saleDate.getFullYear() === selectedYear &&
        saleDate.getMonth() + 1 === selectedMonth
      );
    });
  };

  const getSalesPerformance = () => {
    const performance = {};
    getFilteredSales().forEach((sale) => {
      // Use both name and selling price as the key
      const key = `${sale.productsdata.name}-${sale.sale_price}`;
      if (!performance[key]) {
        performance[key] = {
          name: sale.productsdata.name,
          sellingPrice: sale.sale_price, // Include selling price
          totalSales: 0,
          totalRevenue: 0,
          totalProfit: 0,
        };
      }
      performance[key].totalSales += sale.quantity;
      performance[key].totalRevenue += sale.quantity * sale.sale_price;
      performance[key].totalProfit +=
        (sale.sale_price - sale.productsdata.acq_price_new) * sale.quantity;
    });
    return Object.values(performance);
  };

  const getYears = () => {
    const years = new Set(
      [...products, ...sales].map((item) =>
        new Date(item.purchase_date || item.sale_date).getFullYear()
      )
    );
    return Array.from(years).sort((a, b) => b - a);
  };

  const getMonths = () => {
    return Array.from({ length: 12 }, (_, i) => i + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
          <Stethoscope className="h-8 w-8" /> Syrincal Trading OPC
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-[550px] mb-6">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ProductForm
                  product={editingProduct}
                  onSubmit={(e) => handleProductSubmit(e, !!editingProduct)}
                  buttonText={editingProduct ? "Update Product" : "Add Product"}
                />
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader className="border-b">
                <CardTitle>Product List</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-2 mb-4">
                  <Select
                    value={selectedProductYear}
                    onValueChange={setSelectedProductYear}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {getYears().map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedProductMonth}
                    onValueChange={setSelectedProductMonth}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {getMonths().map((month) => (
                        <SelectItem key={month} value={month}>
                          {new Date(2023, month - 1).toLocaleString("default", {
                            month: "long",
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products
                      .filter((product) => {
                        const purchaseDate = new Date(product.purchase_date);
                        return (
                          purchaseDate.getFullYear() === selectedProductYear &&
                          purchaseDate.getMonth() + 1 === selectedProductMonth
                        );
                      })
                      .map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.name}
                          </TableCell>
                          <TableCell>₱{product.vetsprice.toFixed(2)}</TableCell>
                          <TableCell>
                            ₱{product.acq_price_new.toFixed(2)}
                          </TableCell>
                          <TableCell>{product.remaining}</TableCell>
                          <TableCell>{product.suppliername}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Record New Sale</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <SaleForm products={products} onSubmit={handleSaleSubmit} />
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader className="border-b">
                <CardTitle>Sales History</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date Sold</TableHead>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          {new Date(sale.sale_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{sale.client_name}</TableCell>
                        <TableCell>{sale.productsdata?.name}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>
                          ₱{(sale.sale_price * sale.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Inventory Overview</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-2 mb-4">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {getYears().map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {getMonths().map((month) => (
                        <SelectItem key={month} value={month}>
                          {new Date(2023, month - 1).toLocaleString("default", {
                            month: "long",
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Acquisition Price</TableHead>
                      <TableHead>Selling Price</TableHead>
                      <TableHead>Remaining Stock</TableHead>
                      <TableHead>Potential Profit</TableHead>
                      <TableHead>Purchase Batches</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupInventoryBatches().map((batch) => (
                      <TableRow key={`${batch.name}-${batch.acq_price}`}>
                        <TableCell className="font-medium">
                          {batch.name}
                        </TableCell>
                        <TableCell>₱{batch.acq_price.toFixed(2)}</TableCell>
                        <TableCell>₱{batch.sell_price.toFixed(2)}</TableCell>
                        <TableCell>{batch.total_stock}</TableCell>
                        <TableCell className="text-green-600">
                          ₱
                          {(
                            (batch.sell_price - batch.acq_price) *
                            batch.total_stock
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {batch.batches.map((b, i) => (
                              <div key={i} className="text-sm text-gray-500">
                                {b.quantity} units ({b.purchase_date}){" "}
                                {b.supplier && `- ${b.supplier}`}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
  <Card>
    <CardHeader className="border-b">
      <CardTitle>Financial Reports</CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      {/* Month/Year Filter */}
      <div className="flex gap-2 mb-6">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {getYears().map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {getMonths().map((month) => (
              <SelectItem key={month} value={month}>
                {new Date(2023, month - 1).toLocaleString("default", {
                  month: "long",
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {/* Current Stock Count */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <Warehouse className="h-6 w-6" />
            <CardTitle>Current Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((acc, product) => acc + product.remaining, 0)}
            </div>
            <p className="text-sm text-gray-500">Total items in inventory</p>
          </CardContent>
        </Card>

        {/* Revenue in Inventory */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            <CardTitle>Revenue in Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱
              {products
                .reduce(
                  (acc, product) => acc + product.vetsprice * product.remaining,
                  0
                )
                .toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">
              Potential revenue from unsold items
            </p>
          </CardContent>
        </Card>

        {/* Total Items Sold */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            <CardTitle>Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sales
                .filter((sale) => {
                  const saleDate = new Date(sale.sale_date);
                  return (
                    saleDate.getFullYear() === selectedYear &&
                    saleDate.getMonth() + 1 === selectedMonth
                  );
                })
                .reduce((acc, sale) => acc + sale.quantity, 0)}
            </div>
            <p className="text-sm text-gray-500">Items sold this month</p>
          </CardContent>
        </Card>

        {/* Gross Income for the Month */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            <CardTitle>Gross Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₱
              {sales
                .filter((sale) => {
                  const saleDate = new Date(sale.sale_date);
                  return (
                    saleDate.getFullYear() === selectedYear &&
                    saleDate.getMonth() + 1 === selectedMonth
                  );
                })
                .reduce((acc, sale) => acc + sale.quantity * sale.sale_price, 0)
                .toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">Revenue this month</p>
          </CardContent>
        </Card>

        {/* Total Profit for the Month */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            <CardTitle>Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₱
              {sales
                .filter((sale) => {
                  const saleDate = new Date(sale.sale_date);
                  return (
                    saleDate.getFullYear() === selectedYear &&
                    saleDate.getMonth() + 1 === selectedMonth
                  );
                })
                .reduce(
                  (acc, sale) =>
                    acc +
                    (sale.sale_price - sale.productsdata.acq_price_new) *
                      sale.quantity,
                  0
                )
                .toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">Profit this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Performance Table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Sales Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Total Profit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSalesPerformance().map((performance) => (
                <TableRow key={`${performance.name}-${performance.sellingPrice}`}>
                  <TableCell>{performance.name}</TableCell>
                  <TableCell>₱{performance.sellingPrice?.toFixed(2)}</TableCell>
                  <TableCell>{performance.totalSales}</TableCell>
                  <TableCell>
                    ₱{performance.totalRevenue.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={
                      performance.totalProfit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    ₱{performance.totalProfit.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </CardContent>
  </Card>
</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
