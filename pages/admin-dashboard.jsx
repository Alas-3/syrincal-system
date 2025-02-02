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
  Sun,
  Moon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
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

// Wrap your app with the Toaster component
<Toaster
  position="top-center"
  toastOptions={{
    className: "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200",
  }}
/>;

// ProductForm Component
const ProductForm = ({ product, onSubmit, buttonText, onCancel }) => {
  const initialDate =
    product?.purchase_date || new Date().toISOString().split("T")[0];
  const formRef = React.useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
    toast.success(
      buttonText === "Add Product" ? "Product Added" : "Product Updated"
    );
    e.target.reset();
  };

  const handleClear = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm relative"
    >
      {/* Clear Button */}
      <button
        type="button"
        onClick={handleClear}
        className="absolute top-2 right-2 p-1 text-gray-500 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Product Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-md font-bold text-gray-700 dark:text-gray-200 mb-1"
        >
          Product Name
        </label>
        <Input
          id="name"
          name="name"
          placeholder="Enter Product Name"
          defaultValue={product?.name}
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Selling Price */}
      <div>
        <label
          htmlFor="vetsprice"
          className="block text-md font-bold text-gray-700 dark:text-gray-200 mb-1"
        >
          Selling Price
        </label>
        <Input
          id="vetsprice"
          name="vetsprice"
          type="number"
          step="0.01"
          placeholder="Enter Selling Price"
          defaultValue={product?.vetsprice}
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Acquisition Price */}
      <div>
        <label
          htmlFor="acq_price_new"
          className="block text-md font-bold text-gray-700 dark:text-gray-200 mb-1"
        >
          Acquisition Price
        </label>
        <Input
          id="acq_price_new"
          name="acq_price_new"
          type="number"
          step="0.01"
          placeholder="Enter Acquisition Price"
          defaultValue={product?.acq_price_new}
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Quantity */}
      <div>
        <label
          htmlFor="purchase_qty"
          className="block text-md font-bold text-gray-700 dark:text-gray-200 mb-1"
        >
          Quantity
        </label>
        <Input
          id="purchase_qty"
          name="purchase_qty"
          type="number"
          placeholder="Enter Quantity"
          defaultValue={product?.remaining} // Use remaining stock instead of purchase_qty
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Purchase Date */}
      <div>
        <label
          htmlFor="purchase_date"
          className="block text-md font-bold text-gray-700 dark:text-gray-200 mb-1"
        >
          Purchase Date
        </label>
        <Input
          id="purchase_date"
          name="purchase_date"
          type="date"
          defaultValue={initialDate}
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Supplier */}
      <div>
        <label
          htmlFor="suppliername"
          className="block text-md font-bold text-gray-700 dark:text-gray-200 mb-1"
        >
          Supplier
        </label>
        <Input
          id="suppliername"
          name="suppliername"
          placeholder="Enter Supplier Name"
          defaultValue={product?.suppliername}
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="flex gap-2">
        <Button
          type="submit"
          className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white"
        >
          {buttonText}
        </Button>
        {/* Show Cancel button only in edit mode */}
        {onCancel && (
          <Button
            type="button"
            className="w-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

// SaleForm Component
const SaleForm = ({ products, onSubmit, sale, onCancel }) => {
  const [selectedProduct, setSelectedProduct] = useState(
    sale?.product_id || ""
  );
  const [customPrice, setCustomPrice] = useState(sale?.sale_price || "");
  const [saleDate, setSaleDate] = useState(
    sale?.sale_date || new Date().toISOString().split("T")[0]
  );
  const formRef = React.useRef(null);

  useEffect(() => {
    if (sale) {
      setSelectedProduct(sale.product_id);
      setCustomPrice(sale.sale_price);
      setSaleDate(sale.sale_date || new Date().toISOString().split("T")[0]);
    }
  }, [sale]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e, !!sale);
    toast.success(sale ? "Sale Updated" : "Sale Recorded");
    e.target.reset();
    setSelectedProduct("");
    setCustomPrice("");
    setSaleDate(new Date().toISOString().split("T")[0]); // Reset date to today
  };

  const handleClear = () => {
    if (formRef.current) {
      formRef.current.reset();
      setSelectedProduct("");
      setCustomPrice("");
      setSaleDate(new Date().toISOString().split("T")[0]);
    }
  };

  const product = products.find((p) => p.id === selectedProduct) || {
    remaining: 0,
    vetsprice: 0,
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm relative"
    >
      {/* Clear Button */}
      <button
        type="button"
        onClick={handleClear}
        className="absolute top-2 right-2 p-1 text-gray-500 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Product Selection */}
      <div>
        <label
          htmlFor="product_id"
          className="block text-md font-bold text-gray-700 dark:text-gray-200 mb-1"
        >
          Select Product
        </label>
        <Select
          onValueChange={setSelectedProduct}
          required
          name="product_id"
          value={selectedProduct}
        >
          <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
            {products
              .filter((p) => p.remaining > 0)
              .map((p) => (
                <SelectItem
                  key={p.id}
                  value={p.id}
                  className="dark:hover:bg-gray-600 dark:text-white"
                >
                  {p.name} (Stock: {p.remaining}) @ ₱{p.vetsprice} - Added on:{" "}
                  {new Date(p.purchase_date).toLocaleDateString()}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Client Name */}
      <div>
        <label
          htmlFor="client_name"
          className="block text-md font-bold text-gray-700 dark:text-gray-200 mb-1"
        >
          Client Name
        </label>
        <Input
          id="client_name"
          name="client_name"
          placeholder="Enter Client Name"
          defaultValue={sale?.client_name}
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Quantity */}
      <div>
        <label
          htmlFor="quantity"
          className="block text-md font-bold text-gray-700 dark:text-gray-200 mb-1"
        >
          Quantity
        </label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          placeholder="Enter Quantity"
          defaultValue={sale?.quantity}
          max={product.remaining}
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Sale Date */}
      <div>
        <label
          htmlFor="sale_date"
          className="block text-md font-bold text-gray-700 dark:text-gray-200 mb-1"
        >
          Sale Date
        </label>
        <Input
          id="sale_date"
          name="sale_date"
          type="date"
          value={saleDate} // Use value instead of defaultValue
          onChange={(e) => setSaleDate(e.target.value)} // Update state on change
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Custom Selling Price */}
      <div>
        <label
          htmlFor="custom_price"
          className="block text-md font-bold text-gray-700 dark:text-gray-200 mb-1"
        >
          Custom Selling Price (Optional)
        </label>
        <Input
          id="custom_price"
          name="custom_price"
          type="number"
          step="0.01"
          placeholder="Enter Custom Selling Price"
          value={customPrice}
          onChange={(e) => setCustomPrice(e.target.value)}
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button
          type="submit"
          className="w-full bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white"
        >
          {sale ? "Update Sale" : "Record Sale"}
        </Button>
        {/* Show Cancel button only in edit mode */}
        {onCancel && (
          <Button
            type="button"
            className="w-full bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </div>
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
  const [editingSale, setEditingSale] = useState(null);
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
      remaining: parseInt(formData.get("purchase_qty"), 10), // Use the same value for remaining
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

  const handleEditSale = async (e, isEditing) => {
    if (e === null) {
      // Cancel edit
      setEditingSale(null);
      return;
    }

    e.preventDefault();
    const formData = new FormData(e.target);
    const saleData = {
      product_id: formData.get("product_id"),
      client_name: formData.get("client_name"),
      quantity: parseInt(formData.get("quantity"), 10),
      sale_date: formData.get("sale_date"),
      sale_price:
        parseFloat(formData.get("custom_price")) ||
        products.find((p) => p.id === formData.get("product_id")).vetsprice,
    };

    if (isEditing) {
      const { error } = await supabase
        .from("salesdata")
        .update(saleData)
        .eq("id", editingSale.id);

      if (!error) {
        await fetchSales();
        setEditingSale(null);
      }
    }
  };

  const handleDeleteSale = async (saleId) => {
    try {
      // Fetch the sale data to get the product ID and quantity
      const { data: sale, error: saleError } = await supabase
        .from("salesdata")
        .select("*")
        .eq("id", saleId)
        .single();

      if (saleError) throw saleError;

      // Fetch the product data to get the current stock
      const { data: product, error: productError } = await supabase
        .from("productsdata")
        .select("*")
        .eq("id", sale.product_id)
        .single();

      if (productError) throw productError;

      // Calculate the new stock by adding back the sold quantity
      const newStock = product.remaining + sale.quantity;

      // Update the product's stock in the database
      const { error: updateError } = await supabase
        .from("productsdata")
        .update({ remaining: newStock })
        .eq("id", product.id);

      if (updateError) throw updateError;

      // Delete the sale from the database
      const { error: deleteError } = await supabase
        .from("salesdata")
        .delete()
        .eq("id", saleId);

      if (deleteError) throw deleteError;

      // Refresh the sales and products data
      await Promise.all([fetchSales(), fetchProducts()]);

      toast.success("Sale deleted successfully, and stock has been restored.");
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Failed to delete sale. Please try again.");
    }
  };

  // Update handleDeleteProduct function
  const handleDeleteProduct = async (id) => {
    const { error } = await supabase.from("productsdata").delete().eq("id", id);

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

    const customPrice = parseFloat(formData.get("custom_price"));
    const salePrice = customPrice || product.vetsprice; // Use custom price if provided, otherwise use the product's selling price

    const saleData = {
      product_id: formData.get("product_id"),
      client_name: formData.get("client_name"),
      sale_price: salePrice, // Use the custom or default price
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
        // Include purchase date in the key
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
          sellingPrice: sale.sale_price, // Selling price per piece
          acquisitionPrice: sale.productsdata.acq_price_new, // Cost per piece
          totalSales: 0,
          totalRevenue: 0,
          totalCost: 0, // Total cost for all pieces sold
          totalProfit: 0,
        };
      }
      performance[key].totalSales += sale.quantity;
      performance[key].totalRevenue += sale.quantity * sale.sale_price;
      performance[key].totalCost +=
        sale.quantity * sale.productsdata.acq_price_new; // Total cost
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="flex items-center justify-between py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            <span>Syrincal Trading OPC</span>
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => document.documentElement.classList.toggle("dark")}
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Sun className="h-5 w-5 block dark:hidden" />
            <Moon className="h-5 w-5 hidden dark:block" />
          </Button>
        </header>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            setEditingProduct(null); // Clear product edit form
            setEditingSale(null); // Clear sale edit form
          }}
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full md:w-[550px] mb-6 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <Pill className="h-4 w-4 mr-2" /> Products
            </TabsTrigger>
            <TabsTrigger
              value="sales"
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <ShoppingCart className="h-4 w-4 mr-2" /> Sales
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <Warehouse className="h-4 w-4 mr-2" /> Inventory
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <ClipboardList className="h-4 w-4 mr-2" /> Reports
            </TabsTrigger>
          </TabsList>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Products Tab - Updated Layout */}
            <TabsContent value="products" className="space-y-6">
              <Card className="bg-white dark:bg-gray-800 shadow-sm dark:border-neutral-400">
                <CardHeader className="border-b border-gray-200 dark:border-neutral-400">
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <ProductForm
                    product={editingProduct}
                    onSubmit={(e) => handleProductSubmit(e, !!editingProduct)}
                    buttonText={
                      editingProduct ? "Update Product" : "Add Product"
                    }
                    onCancel={
                      editingProduct ? () => setEditingProduct(null) : undefined
                    } // Only pass onCancel in edit mode
                  />
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800  dark:border-neutral-400 shadow-sm">
                <CardHeader className="border-b border-gray-200 dark:border-neutral-400">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Product List
                    </CardTitle>
                    <div className="flex gap-2">
                      <Select
                        value={selectedProductYear}
                        onValueChange={setSelectedProductYear}
                      >
                        <SelectTrigger className="w-[120px] bg-white dark:bg-gray-700 dark:border-neutral-400">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          {getYears().map((year) => (
                            <SelectItem
                              key={year}
                              value={year}
                              className="dark:hover:bg-gray-600"
                            >
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedProductMonth}
                        onValueChange={setSelectedProductMonth}
                      >
                        <SelectTrigger className="w-[120px] bg-white dark:bg-gray-700 dark:border-neutral-400">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          {getMonths().map((month) => (
                            <SelectItem
                              key={month}
                              value={month}
                              className="dark:hover:bg-gray-600"
                            >
                              {new Date(2023, month - 1).toLocaleString(
                                "default",
                                {
                                  month: "long",
                                }
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <Table className="min-w-[600px]">
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
                            const purchaseDate = new Date(
                              product.purchase_date
                            );
                            return (
                              purchaseDate.getFullYear() ===
                                selectedProductYear &&
                              purchaseDate.getMonth() + 1 ===
                                selectedProductMonth
                            );
                          })
                          .map((product) => (
                            <TableRow key={product.id}>
                              <TableCell className="font-medium">
                                {product.name}
                              </TableCell>
                              <TableCell>
                                ₱{product.vetsprice.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                ₱{product.acq_price_new.toFixed(2)}
                              </TableCell>
                              <TableCell>{product.remaining}</TableCell>
                              <TableCell>{product.suppliername}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    className="dark:bg-neutral-300 text-black"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingProduct(product)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sales Tab - Updated Layout */}
            <TabsContent value="sales" className="space-y-6">
              {editingSale ? (
                <Card className="bg-white dark:bg-gray-800 dark:border-neutral-400 shadow-sm">
                  <CardHeader className="border-b border-gray-200 dark:border-neutral-400">
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Edit Sale
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <SaleForm
                      products={products}
                      onSubmit={handleEditSale}
                      sale={editingSale}
                      onCancel={
                        editingSale ? () => setEditingSale(null) : undefined
                      } // Only pass onCancel in edit mode
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white dark:bg-gray-800 dark:border-neutral-400 shadow-sm">
                  <CardHeader className="border-b border-gray-200 dark:border-neutral-400">
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Record New Sale
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <SaleForm products={products} onSubmit={handleSaleSubmit} />
                  </CardContent>
                </Card>
              )}

              {/* Sales History Card */}
              <Card className="bg-white dark:bg-gray-800 dark:border-neutral-400 shadow-sm">
                <CardHeader className="border-b border-gray-200 dark:border-neutral-400">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Sales History
                    </CardTitle>
                    {/* Month/Year Filter */}
                    <div className="flex gap-2">
                      <Select
                        value={selectedYear}
                        onValueChange={setSelectedYear}
                      >
                        <SelectTrigger className="w-[120px] bg-white dark:bg-gray-700 dark:border-neutral-400">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          {getYears().map((year) => (
                            <SelectItem
                              key={year}
                              value={year}
                              className="dark:hover:bg-gray-600"
                            >
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedMonth}
                        onValueChange={setSelectedMonth}
                      >
                        <SelectTrigger className="w-[120px] bg-white dark:bg-gray-700 dark:border-neutral-400">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          {getMonths().map((month) => (
                            <SelectItem
                              key={month}
                              value={month}
                              className="dark:hover:bg-gray-600"
                            >
                              {new Date(2023, month - 1).toLocaleString(
                                "default",
                                {
                                  month: "long",
                                }
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <Table className="min-w-[600px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date Sold</TableHead>
                          <TableHead>Client Name</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Price per Piece</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sales
                          .filter((sale) => {
                            const saleDate = new Date(sale.sale_date);
                            return (
                              saleDate.getFullYear() === selectedYear &&
                              saleDate.getMonth() + 1 === selectedMonth
                            );
                          })
                          .map((sale) => (
                            <TableRow key={sale.id}>
                              <TableCell>
                                {new Date(sale.sale_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{sale.client_name}</TableCell>
                              <TableCell>{sale.productsdata?.name}</TableCell>
                              <TableCell>{sale.quantity}</TableCell>
                              <TableCell>
                                ₱{sale.sale_price.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-green-600">
                                ₱{(sale.sale_price * sale.quantity).toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="dark:bg-neutral-300 text-black"
                                    variant="outline"
                                    onClick={() => setEditingSale(sale)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteSale(sale.id)} // Call the delete function
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Tab - Updated Layout */}
            <TabsContent value="inventory">
              <Card className="bg-white dark:bg-gray-800 dark:border-neutral-400 shadow-sm">
                <CardHeader className="border-b border-gray-200 dark:border-neutral-400">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Inventory Overview
                    </CardTitle>
                    <div className="flex gap-2">
                      <Select
                        value={selectedYear}
                        onValueChange={setSelectedYear}
                      >
                        <SelectTrigger className="w-[120px] bg-white dark:bg-gray-700 dark:border-neutral-400">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          {getYears().map((year) => (
                            <SelectItem
                              key={year}
                              value={year}
                              className="dark:hover:bg-gray-600"
                            >
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedMonth}
                        onValueChange={setSelectedMonth}
                      >
                        <SelectTrigger className="w-[120px] bg-white dark:bg-gray-700 dark:border-neutral-400">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          {getMonths().map((month) => (
                            <SelectItem
                              key={month}
                              value={month}
                              className="dark:hover:bg-gray-600"
                            >
                              {new Date(2023, month - 1).toLocaleString(
                                "default",
                                {
                                  month: "long",
                                }
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <Table className="min-w-[800px]">
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
                          <TableRow
                            key={`${batch.name}-${batch.acq_price}-${batch.batches[0].purchase_date}`}
                          >
                            <TableCell className="font-medium">
                              {batch.name}
                            </TableCell>
                            <TableCell>₱{batch.acq_price.toFixed(2)}</TableCell>
                            <TableCell>
                              ₱{batch.sell_price.toFixed(2)}
                            </TableCell>
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
                                  <div
                                    key={i}
                                    className="text-sm text-gray-500"
                                  >
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab - Updated Layout */}
            <TabsContent value="reports">
              <Card className="bg-white dark:bg-gray-800 dark:border-neutral-400 shadow-sm">
                <CardHeader className="border-b border-gray-200 dark:border-neutral-400">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Financial Reports
                    </CardTitle>
                    <div className="flex gap-2">
                      <Select
                        value={selectedYear}
                        onValueChange={setSelectedYear}
                      >
                        <SelectTrigger className="w-[120px] bg-white dark:bg-gray-700 dark:border-neutral-400">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          {getYears().map((year) => (
                            <SelectItem
                              key={year}
                              value={year}
                              className="dark:hover:bg-gray-600"
                            >
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedMonth}
                        onValueChange={setSelectedMonth}
                      >
                        <SelectTrigger className="w-[120px] bg-white dark:bg-gray-700 dark:border-neutral-400">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          {getMonths().map((month) => (
                            <SelectItem
                              key={month}
                              value={month}
                              className="dark:hover:bg-gray-600"
                            >
                              {new Date(2023, month - 1).toLocaleString(
                                "default",
                                {
                                  month: "long",
                                }
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Current Stock Count */}
                    <Card className="bg-white dark:bg-gray-800 dark:border-neutral-400 shadow-sm">
                      <CardHeader className="flex items-center gap-2">
                        <Warehouse className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Current Stock
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {products.reduce(
                            (acc, product) => acc + product.remaining,
                            0
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Total items in inventory
                        </p>
                      </CardContent>
                    </Card>

                    {/* Revenue in Inventory */}
                    <Card className="bg-white dark:bg-gray-800 dark:border-neutral-400 shadow-sm">
                      <CardHeader className="flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Revenue in Inventory
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ₱
                          {products
                            .reduce(
                              (acc, product) =>
                                acc + product.vetsprice * product.remaining,
                              0
                            )
                            .toFixed(2)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Potential revenue from unsold items
                        </p>
                      </CardContent>
                    </Card>

                    {/* Total Items Sold */}
                    <Card className="bg-white dark:bg-gray-800 dark:border-neutral-400 shadow-sm">
                      <CardHeader className="flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Items Sold
                        </CardTitle>
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Items sold this month
                        </p>
                      </CardContent>
                    </Card>

                    {/* Gross Income for the Month */}
                    <Card className="bg-white dark:bg-gray-800 dark:border-neutral-400 shadow-sm">
                      <CardHeader className="flex items-center gap-2">
                        <ClipboardList className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Gross Income
                        </CardTitle>
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
                                acc + sale.quantity * sale.sale_price,
                              0
                            )
                            .toFixed(2)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Revenue this month
                        </p>
                      </CardContent>
                    </Card>

                    {/* Total Profit for the Month */}
                    <Card className="bg-white dark:bg-gray-800 dark:border-neutral-400 shadow-sm">
                      <CardHeader className="flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Total Profit
                        </CardTitle>
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
                                (sale.sale_price -
                                  sale.productsdata.acq_price_new) *
                                  sale.quantity,
                              0
                            )
                            .toFixed(2)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Profit this month
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sales Performance Table */}
                  <Card className="bg-white dark:bg-gray-800 dark:border-neutral-400 shadow-sm">
                    <CardHeader className="border-b border-gray-200 dark:border-neutral-400">
                      <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Sales Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="overflow-x-auto">
                        <Table className="min-w-[800px]">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>Selling Price Per Piece</TableHead>
                              <TableHead>Cost Per Piece</TableHead>
                              <TableHead>Total Sales</TableHead>
                              <TableHead>Total Revenue</TableHead>
                              <TableHead>Total Cost</TableHead>
                              <TableHead>Total Profit</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getSalesPerformance().map((performance) => (
                              <TableRow
                                key={`${performance.name}-${performance.sellingPrice}`}
                              >
                                <TableCell>{performance.name}</TableCell>
                                <TableCell>
                                  ₱{performance.sellingPrice?.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  ₱{performance.acquisitionPrice?.toFixed(2)}
                                </TableCell>
                                <TableCell>{performance.totalSales}</TableCell>
                                <TableCell>
                                  ₱{performance.totalRevenue.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  ₱{performance.totalCost.toFixed(2)}
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
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
