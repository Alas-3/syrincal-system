"use client";

import React, { useState, useEffect, useRef } from "react";
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

// Add these functions before the InventoryManager component

// Utility function to determine expiration status
const getExpirationStatus = (expirationDate) => {
  if (!expirationDate) return { status: "none", color: "" };
  
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffMonths = (expDate - today) / (1000 * 60 * 60 * 24 * 30.5); // Approximate months
  
  if (diffMonths <= 12) {
    return { 
      status: "critical", 
      color: "bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200" 
    };
  } else if (diffMonths <= 18) {
    return { 
      status: "warning", 
      color: "bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200" 
    };
  } else {
    return { 
      status: "good", 
      color: "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200" 
    };
  }
};

// Utility function to get expiration status text
const getExpirationText = (expirationDate) => {
  if (!expirationDate) return "No expiration date";
  
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffDays = Math.floor((expDate - today) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `Expired ${Math.abs(diffDays)} days ago`;
  } else if (diffDays === 0) {
    return "Expires today!";
  } else if (diffDays <= 30) {
    return `Expires in ${diffDays} days`;
  } else if (diffDays <= 365) {
    const months = Math.floor(diffDays / 30);
    return `Expires in ${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    return `Expires in ${years} year${years > 1 ? 's' : ''}${remainingMonths ? ` and ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''}`;
  }
};

// Update the getExpiringCounts function to accept products as a parameter
const getExpiringCounts = (products = []) => {
  const critical = products.filter(p => {
    if (!p.expiration_date || p.remaining <= 0) return false;
    return getExpirationStatus(p.expiration_date).status === "critical";
  }).length;
  
  const warning = products.filter(p => {
    if (!p.expiration_date || p.remaining <= 0) return false;
    return getExpirationStatus(p.expiration_date).status === "warning";
  }).length;
  
  return { critical, warning };
};

// ProductForm Component
const ProductForm = ({ product, onSubmit, buttonText, onCancel }) => {
  // Initialize state for purchase date
  const [purchaseDate, setPurchaseDate] = React.useState("");
  // Initialize state for expiration date
  const [expirationDate, setExpirationDate] = React.useState("");

  // Add these new states for autocomplete
  const [productName, setProductName] = useState(product?.name || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);

  // Fetch product names for suggestions
  useEffect(() => {
    const fetchProductNames = async () => {
      const { data, error } = await supabase
        .from("productsdata")
        .select("name")
        .order("name");

      if (!error && data) {
        // Extract unique product names
        const uniqueNames = [...new Set(data.map((item) => item.name))];
        setSuggestions(uniqueNames);
      }
    };

    fetchProductNames();
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (productName) {
      const filtered = suggestions.filter((name) =>
        name.toLowerCase().includes(productName.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [productName, suggestions]);

  // Sync state with product.purchase_date whenever the product changes
  React.useEffect(() => {
    if (product && product.purchase_date) {
      const formattedDate = new Date(product.purchase_date)
        .toISOString()
        .split("T")[0];
      setPurchaseDate(formattedDate);
    } else {
      // Default to today's date if no product or purchase_date exists
      setPurchaseDate(new Date().toISOString().split("T")[0]);
    }
  }, [product]);

  // Sync state with product.expiration_date whenever the product changes
  React.useEffect(() => {
    if (product?.expiration_date) {
      const formattedDate = new Date(product.expiration_date)
        .toISOString()
        .split("T")[0];
      setExpirationDate(formattedDate);
    } else {
      setExpirationDate("");
    }
  }, [product]);

  // Initialize product name when product changes
  React.useEffect(() => {
    if (product?.name) {
      setProductName(product.name);
    }
  }, [product]);

  const formRef = React.useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
    toast.success(
      buttonText === "Add Product" ? "Product Added" : "Product Updated"
    );
    if (buttonText === "Add Product") {
      setProductName("");
      e.target.reset();
    }
  };

  const handleClear = () => {
    if (formRef.current) {
      formRef.current.reset();
      setProductName("");
    }
  };

  const handleSuggestionClick = (name) => {
    setProductName(name);
    setShowSuggestions(false);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      {/* Product Name with Autocomplete */}
      <div ref={inputRef} className="relative">
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
          value={productName}
          onChange={(e) => {
            setProductName(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <ul className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md mt-1 shadow-lg">
            {filteredSuggestions.map((name, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(name)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
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
          placeholder="Enter Quantity Purchased"
          defaultValue={product?.remaining} // Use remaining stock instead of purchase_qty
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Purchase Date (controlled) */}
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
          value={purchaseDate} // Controlled value
          onChange={(e) => setPurchaseDate(e.target.value)}
          required
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Expiration Date (Optional) */}
      <div>
        <label
          htmlFor="expiration_date"
          className="block text-md font-bold text-gray-700 dark:text-gray-200 mb-1"
        >
          Expiration Date (Optional)
        </label>
        <Input
          id="expiration_date"
          name="expiration_date"
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
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
    setSelectedProduct(""); // Reset product selection
    setSaleDate(""); // Reset sale date
    setCustomPrice(""); // Reset custom price
    formRef.current.reset(); // Reset the form fields
  };

  const handleCancel = () => {
    handleClear(); // Call handleClear to reset everything
    if (onCancel) onCancel(); // Execute additional onCancel logic if provided
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
          placeholder="Enter Quantity Sold"
          defaultValue={sale?.quantity}
          max={
            selectedProduct
              ? products.find((p) => p.id === selectedProduct)?.remaining
              : ""
          }
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
          value={saleDate}
          onChange={(e) => setSaleDate(e.target.value)}
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
            onClick={handleCancel}
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
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [editingSale, setEditingSale] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("all");
  // Add these state variables at the top of the component
  const [selectedProductYear, setSelectedProductYear] = useState("all");
  const [selectedProductMonth, setSelectedProductMonth] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [selectedClient, setSelectedClient] = useState("all");

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
      expiration_date: formData.get("expiration_date") || null,
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
        const yearMatch =
          selectedYear === "all" ||
          purchaseDate.getFullYear() === parseInt(selectedYear);
        const monthMatch =
          selectedMonth === "all" ||
          purchaseDate.getMonth() + 1 === parseInt(selectedMonth);
        return yearMatch && monthMatch;
      })
      .forEach((product) => {
        const key = `${product.id}-${product.name}-${product.acq_price_new}-${product.vetsprice}-${product.purchase_date}-${product.expiration_date}`;
        if (!batches[key]) {
          batches[key] = {
            name: product.name,
            acq_price: product.acq_price_new,
            sell_price: product.vetsprice,
            expiration_date: product.expiration_date,
            total_stock: 0,
            batches: [],
          };
        }
        batches[key].total_stock += product.remaining;
        batches[key].batches.push({
          id: product.id,
          purchase_date: product.purchase_date,
          expiration_date: product.expiration_date,
          quantity: product.remaining,
          supplier: product.suppliername,
        });
      });
    return Object.values(batches);
  };

  const filterData = (year, month) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const getFilteredSales = () => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.sale_date);
      const yearMatch =
        selectedYear === "all" ||
        saleDate.getFullYear() === parseInt(selectedYear);
      const monthMatch =
        selectedMonth === "all" ||
        saleDate.getMonth() + 1 === parseInt(selectedMonth);
      return yearMatch && monthMatch;
    });
  };

  const getSalesPerformance = () => {
    const performance = {};
    getFilteredSales()
      .filter((sale) => {
        const clientMatch =
          selectedClient === "all" || sale.client_name === selectedClient;
        const productMatch =
          selectedProduct === "all" ||
          sale.productsdata.name === selectedProduct;
        return clientMatch && productMatch;
      })
      .forEach((sale) => {
        const key = `${sale.productsdata.name}-${sale.sale_price}`;
        if (!performance[key]) {
          performance[key] = {
            name: sale.productsdata.name,
            sellingPrice: sale.sale_price,
            acquisitionPrice: sale.productsdata.acq_price_new,
            totalSales: 0,
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
          };
        }
        performance[key].totalSales += sale.quantity;
        performance[key].totalRevenue += sale.quantity * sale.sale_price;
        performance[key].totalCost +=
          sale.quantity * sale.productsdata.acq_price_new;
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
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full md:w-[680px] mb-6 bg-gray-100 dark:bg-gray-800">
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
              value="expiring"
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-white relative"
            >
              <Calendar className="h-4 w-4 mr-2" /> Expiring
              {getExpiringCounts(products).critical > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {getExpiringCounts(products).critical}
                </Badge>
              )}
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
            <TabsContent value="products" className="space-y-6 pb-10">
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

              <Card className="bg-white dark:bg-gray-800 dark:border-neutral-400 shadow-sm">
                <CardHeader className="border-b border-gray-200 dark:border-neutral-400">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Product List
                    </CardTitle>
                    <div className="flex gap-2">
                      <Select
                        value={selectedSupplier}
                        onValueChange={setSelectedSupplier}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Suppliers</SelectItem>
                          {[
                            ...new Set(
                              products
                                .map((p) => p.suppliername)
                                .filter(Boolean)
                            ),
                          ].map((supplier) => (
                            <SelectItem key={supplier} value={supplier}>
                              {supplier}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedProductYear}
                        onValueChange={setSelectedProductYear}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          {getYears().map((year) => (
                            <SelectItem key={year} value={year.toString()}>
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
                          <SelectItem value="all">All Months</SelectItem>
                          {getMonths().map((month) => (
                            <SelectItem key={month} value={month.toString()}>
                              {new Date(0, month - 1).toLocaleString("en", {
                                month: "long",
                              })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <Table className="min-w-[600px] table-fixed">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/5">Product Name</TableHead>
                          <TableHead className="w-[10%]">Price</TableHead>
                          <TableHead className="w-[10%]">Cost</TableHead>
                          <TableHead className="w-[8%]">Stock</TableHead>
                          <TableHead className="w-[12%]">Supplier</TableHead>
                          <TableHead className="w-[12%]">Purchase Date</TableHead>
                          <TableHead className="w-[15%]">Expiration Date</TableHead>
                          <TableHead className="w-[10%]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products
                          .filter((product) => {
                            const purchaseDate = new Date(
                              product.purchase_date
                            );
                            const yearMatch =
                              selectedProductYear === "all" ||
                              purchaseDate.getFullYear() ===
                                parseInt(selectedProductYear);
                            const monthMatch =
                              selectedProductMonth === "all" ||
                              purchaseDate.getMonth() + 1 ===
                                parseInt(selectedProductMonth);
                            const supplierMatch =
                              selectedSupplier === "all" ||
                              product.suppliername === selectedSupplier;
                            return yearMatch && monthMatch && supplierMatch;
                          })

                          .map((product) => (
                            <TableRow 
                              key={product.id}
                              className={getExpirationStatus(product.expiration_date).color}
                            >
                              <TableCell className="font-medium">
                                {product.name}
                              </TableCell>
                              <TableCell>₱{product.vetsprice.toFixed(2)}</TableCell>
                              <TableCell>₱{product.acq_price_new.toFixed(2)}</TableCell>
                              <TableCell>{product.remaining}</TableCell>
                              <TableCell>{product.suppliername}</TableCell>
                              <TableCell>
                                {new Date(product.purchase_date).toLocaleDateString()} 
                              </TableCell>
                              <TableCell className="py-2">
                                {product.expiration_date
                                  ? (
                                    <div className="flex flex-col">
                                      <div className="text-sm font-medium">
                                        {new Date(product.expiration_date).toLocaleDateString()}
                                      </div>
                                      {getExpirationStatus(product.expiration_date).status !== "none" && (
                                        <Badge 
                                          variant={getExpirationStatus(product.expiration_date).status === "critical" ? "destructive" : 
                                                  getExpirationStatus(product.expiration_date).status === "warning" ? "warning" : "outline"}
                                          className="mt-1.5 w-fit text-xs px-2 py-0 h-5"
                                        >
                                          {getExpirationText(product.expiration_date)}
                                        </Badge>
                                      )}
                                    </div>
                                  )
                                  : "N/A"}
                              </TableCell>
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
            <TabsContent value="sales" className="space-y-6 pb-10">
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
                        value={selectedClient}
                        onValueChange={setSelectedClient}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Clients</SelectItem>
                          {[
                            ...new Set(
                              sales.map((s) => s.client_name).filter(Boolean)
                            ),
                          ].map((client) => (
                            <SelectItem key={client} value={client}>
                              {client}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedProductYear}
                        onValueChange={setSelectedProductYear}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Years</SelectItem>
                          {getYears().map((year) => (
                            <SelectItem key={year} value={year.toString()}>
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
                          <SelectItem value="all">All Months</SelectItem>
                          {getMonths().map((month) => (
                            <SelectItem key={month} value={month.toString()}>
                              {new Date(0, month - 1).toLocaleString("en", {
                                month: "long",
                              })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <Table className="min-w-[600px] table-fixed">
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
                            const yearMatch =
                              selectedYear === "all" ||
                              saleDate.getFullYear() === parseInt(selectedYear);
                            const monthMatch =
                              selectedMonth === "all" ||
                              saleDate.getMonth() + 1 ===
                                parseInt(selectedMonth);
                            const clientMatch =
                              selectedClient === "all" ||
                              sale.client_name === selectedClient;
                            return yearMatch && monthMatch && clientMatch;
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
                        value={selectedClient}
                        onValueChange={setSelectedClient}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Filter Client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Clients</SelectItem>
                          {[
                            ...new Set(
                              sales.map((s) => s.client_name).filter(Boolean)
                            ),
                          ].map((client) => (
                            <SelectItem key={client} value={client}>
                              {client}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedYear}
                        onValueChange={(value) => {
                          setSelectedYear(value);
                          filterData(value, selectedMonth);
                        }}
                      >
                        <SelectTrigger className="w-[120px] bg-white dark:bg-gray-700 dark:border-neutral-400">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          <SelectItem
                            value="all"
                            className="dark:hover:bg-gray-600"
                          >
                            All Years
                          </SelectItem>
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
                        onValueChange={(value) => {
                          setSelectedMonth(value);
                          filterData(selectedYear, value);
                        }}
                      >
                        <SelectTrigger className="w-[120px] bg-white dark:bg-gray-700 dark:border-neutral-400">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          <SelectItem
                            value="all"
                            className="dark:hover:bg-gray-600"
                          >
                            All Months
                          </SelectItem>
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
                    <Table className="min-w-[800px] table-fixed">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Acquisition Price</TableHead>
                          <TableHead>Selling Price</TableHead>
                          <TableHead>Remaining Stock</TableHead>
                          <TableHead>Potential Profit</TableHead>
                          <TableHead>Expiration Date</TableHead>
                          <TableHead>Purchase Batches</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupInventoryBatches().map((batch) => (
                          <TableRow
                            key={`${batch.name}-${batch.acq_price}-${batch.batches[0].purchase_date}`}
                            className={batch.expiration_date ? getExpirationStatus(batch.expiration_date).color : ""}
                          >
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
                            <TableCell className="py-2">
                              <div className="flex flex-col gap-2">
                                {batch.batches.map((b, i) => (
                                  <div
                                    key={i}
                                    className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-2 last:pb-0"
                                  >
                                    {b.expiration_date
                                      ? (
                                        <div className="flex flex-col">
                                          <div className="text-sm font-medium">
                                            {new Date(b.expiration_date).toLocaleDateString()}
                                          </div>
                                          <Badge
                                            variant={getExpirationStatus(b.expiration_date).status === "critical" ? "destructive" : 
                                                   getExpirationStatus(b.expiration_date).status === "warning" ? "warning" : "outline"}
                                            className="mt-1 w-fit text-xs px-2 py-0 h-5"
                                          >
                                            {getExpirationText(b.expiration_date)}
                                          </Badge>
                                        </div>
                                      )
                                      : "N/A"}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {batch.batches.map((b, i) => (
                                  <div
                                    key={i}
                                    className="text-sm text-gray-500"
                                  >
                                    {b.quantity} units ({b.purchase_date}) {b.supplier && `- ${b.supplier}`}
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

            {/* Expiring Products Tab */}
            <TabsContent value="expiring" className="space-y-6 pb-10">
              <Card className="bg-white dark:bg-gray-800 dark:border-neutral-400 shadow-sm">
                <CardHeader className="border-b border-gray-200 dark:border-neutral-400">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      Expiring Products
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 dark:bg-red-600 border border-red-600 dark:border-red-500"></div>
                        <span className="text-sm">Expiring within 1 year</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-amber-500 dark:bg-amber-600 border border-amber-600 dark:border-amber-500"></div>
                        <span className="text-sm">Expiring within 1.5 years</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500 dark:bg-green-600 border border-green-600 dark:border-green-500"></div>
                        <span className="text-sm">Expiring after 2+ years</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <Table className="min-w-[800px] table-fixed">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[20%]">Product Name</TableHead>
                          <TableHead className="w-[15%]">Expiration Date</TableHead>
                          <TableHead className="w-[10%]">Remaining Stock</TableHead>
                          <TableHead className="w-[25%]">Expiration Status</TableHead>
                          <TableHead className="w-[15%]">Supplier</TableHead>
                          <TableHead className="w-[15%]">Purchase Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products
                          .filter(product => product.expiration_date && product.remaining > 0)
                          .sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date))
                          .map(product => {
                            const { color, status } = getExpirationStatus(product.expiration_date);
                            return (
                              <TableRow 
                                key={product.id} 
                                className={color}
                              >
                                <TableCell className="font-medium py-3">{product.name}</TableCell>
                                <TableCell className="py-3">
                                  {product.expiration_date 
                                    ? new Date(product.expiration_date).toLocaleDateString()
                                    : "N/A"}
                                </TableCell>
                                <TableCell className="py-3">{product.remaining}</TableCell>
                                <TableCell className="py-3">
                                  <div className="flex flex-col">
                                    <Badge 
                                      variant={status === "critical" ? "destructive" : 
                                              status === "warning" ? "warning" : "outline"}
                                      className="w-fit mb-1 px-2 py-0 h-5"
                                    >
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </Badge>
                                    <span className="text-xs mt-1">
                                      {getExpirationText(product.expiration_date)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-3">{product.suppliername || "N/A"}</TableCell>
                                <TableCell className="py-3">
                                  {new Date(product.purchase_date).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            );
                          })}
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
                          <SelectItem
                            value="all"
                            className="dark:hover:bg-gray-600"
                          >
                            All Years
                          </SelectItem>
                          {getYears().map((year) => (
                            <SelectItem
                              key={year}
                              value={year.toString()}
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
                          <SelectItem
                            value="all"
                            className="dark:hover:bg-gray-600"
                          >
                            All Months
                          </SelectItem>
                          {getMonths().map((month) => (
                            <SelectItem
                              key={month}
                              value={month.toString()}
                              className="dark:hover:bg-gray-600"
                            >
                              {new Date(0, month - 1).toLocaleString("en", {
                                month: "long",
                              })}
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
                              const yearMatch =
                                selectedYear === "all" ||
                                saleDate.getFullYear() ===
                                  parseInt(selectedYear);
                              const monthMatch =
                                selectedMonth === "all" ||
                                saleDate.getMonth() + 1 ===
                                  parseInt(selectedMonth);
                              return yearMatch && monthMatch;
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
                              const yearMatch =
                                selectedYear === "all" ||
                                saleDate.getFullYear() ===
                                  parseInt(selectedYear);
                              const monthMatch =
                                selectedMonth === "all" ||
                                saleDate.getMonth() + 1 ===
                                  parseInt(selectedMonth);
                              return yearMatch && monthMatch;
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
                              const yearMatch =
                                selectedYear === "all" ||
                                saleDate.getFullYear() ===
                                  parseInt(selectedYear);
                              const monthMatch =
                                selectedMonth === "all" ||
                                saleDate.getMonth() + 1 ===
                                  parseInt(selectedMonth);
                              return yearMatch && monthMatch;
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
                  {/* Sales Performance Table */}
                  <Card className="bg-white dark:bg-gray-800 dark:border-neutral-400 shadow-sm">
                    <CardHeader className="border-b border-gray-200 dark:border-neutral-400">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          Sales Performance
                        </CardTitle>
                        <Select
                          value={selectedProduct}
                          onValueChange={setSelectedProduct}
                        >
                          <SelectTrigger className="w-[200px] bg-white dark:bg-gray-700 dark:border-neutral-400">
                            <SelectValue placeholder="Filter by product" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-700">
                            <SelectItem
                              value="all"
                              className="dark:hover:bg-gray-600"
                            >
                              None (Show All)
                            </SelectItem>
                            {[
                              ...new Set(
                                getFilteredSales().map(
                                  (sale) => sale.productsdata.name
                                )
                              ),
                            ]
                              .sort()
                              .map((name) => (
                                <SelectItem
                                  key={name}
                                  value={name}
                                  className="dark:hover:bg-gray-600"
                                >
                                  {name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <div className="overflow-x-auto">
                        <Table className="min-w-[800px] table-fixed">
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
