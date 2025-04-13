import React from "react";
import Image from "next/image";
import { formatDate } from "../lib/utils";
import { Check } from "lucide-react";


const SalesReceipt = ({ selectedSales, onClose, clientName }) => {
  // Group by product to consolidate items
  const groupedItems = selectedSales.reduce((acc, sale) => {
    const key = `${sale.productsdata.name}-${sale.sale_price}`;
    if (!acc[key]) {
      acc[key] = {
        name: sale.productsdata.name,
        price: sale.sale_price,
        quantity: 0,
        total: 0,
      };
    }
    acc[key].quantity += sale.quantity;
    acc[key].total += sale.quantity * sale.sale_price;
    return acc;
  }, {});

  const items = Object.values(groupedItems);
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  const isShortReceipt = selectedSales.length <= 5;
  
  // Get the earliest and latest dates among selected sales
  const dates = selectedSales.map(sale => new Date(sale.sale_date));
  const earliestDate = new Date(Math.min(...dates));
  const latestDate = new Date(Math.max(...dates));
  
  // Format date range for receipt
  const dateDisplay = earliestDate.toLocaleDateString() === latestDate.toLocaleDateString() 
    ? formatDate(earliestDate) 
    : `${formatDate(earliestDate)} to ${formatDate(latestDate)}`;
  
  // Format receipt number using timestamp for uniqueness
  const receiptNumber = `ST-${new Date().getFullYear()}-${String(new Date().getTime()).slice(-6)}`;

  // Handle print action
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-container fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:p-0">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full print:shadow-none print:max-w-none print:w-full print:m-0">
        {/* Print Controls - Hide when printing */}
        <div className="p-4 border-b print:hidden">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-black">Receipt Preview</h3>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded"
              >
                Print Receipt
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800">
            <p className="text-sm font-medium">
              {isShortReceipt
                ? "Please load 9.5 × 5.5 inch paper for short receipt."
                : "Please load 9.5 × 11 inch paper for full receipt."}
            </p>
          </div>
        </div>

        {/* Receipt Content - This is what gets printed */}
        <div className={`receipt-content ${isShortReceipt ? 'p-3 short-receipt' : 'p-6 full-receipt'}`}>
          {/* Receipt Header */}
          {/* Conditional styling based on receipt size */}
          <div className={`flex justify-between items-center ${isShortReceipt ? 'mb-0' : 'mb-2'}`}>
            {/* Company Logo - smaller for short receipt */}
            <div className="flex-shrink-0">
              <Image
                src="/images/syrincalLogo.jpg"
                alt="Syrincal Trading OPC Logo"
                width={isShortReceipt ? 100 : 140}
                height={isShortReceipt ? 46 : 65}
                className="object-contain"
                priority
              />
            </div>
            
            {/* Address - fewer lines for short receipt */}
            <div className="text-right text-black">
              <h3 className="text-lg font-bold">SYRINCAL TRADING OPC</h3>
              {isShortReceipt ? (
                <p className="text-sm">123 Business Ave. • Tel: (123) 456-7890</p>
              ) : (
                <>
                  <p className="text-sm">123 Business Avenue, Your City, State 12345</p>
                  <p className="text-sm">Tel: (123) 456-7890</p>
                  <p className="text-sm">Email: contact@syrincaltrading.com</p>
                </>
              )}
            </div>
          </div>

          {/* Receipt Title - smaller padding for short receipt */}
          <div className={`text-center border-b-2 border-t-2 border-black ${isShortReceipt ? 'py-1 mb-2' : 'py-2 mb-4'}`}>
            <h2 className="text-xl font-bold text-black">DELIVERY RECEIPT</h2>
          </div>

          {/* Receipt Details */}
          <div className="flex justify-between mb-4 text-black">
            <div>
              <p><strong>Client:</strong> {clientName}</p>
              <p><strong>Date:</strong> {dateDisplay}</p>
            </div>
            <div>
              <p><strong>Receipt #:</strong> {receiptNumber}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className={`w-full ${isShortReceipt ? 'mb-3' : 'mb-6'} border-collapse`}>
            <thead>
              <tr className="border-b-2 border-black text-left text-black">
                <th className={`${isShortReceipt ? 'py-1' : 'py-2'} w-[15%]`}>Date</th>
                <th className={`${isShortReceipt ? 'py-1' : 'py-2'} w-[40%]`}>Item Description</th>
                <th className={`${isShortReceipt ? 'py-1' : 'py-2'} w-[15%] text-right`}>Unit Price</th>
                <th className={`${isShortReceipt ? 'py-1' : 'py-2'} w-[10%] text-right`}>Quantity</th>
                <th className={`${isShortReceipt ? 'py-1' : 'py-2'} w-[20%] text-right`}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {selectedSales.map((sale, index) => (
                <tr key={index} className="border-b text-black">
                  <td className={`${isShortReceipt ? 'py-1' : 'py-2'}`}>{formatDate(new Date(sale.sale_date))}</td>
                  <td className={`${isShortReceipt ? 'py-1' : 'py-2'}`}>{sale.productsdata.name}</td>
                  <td className={`${isShortReceipt ? 'py-1' : 'py-2'} text-right`}>₱{sale.sale_price.toFixed(2)}</td>
                  <td className={`${isShortReceipt ? 'py-1' : 'py-2'} text-right`}>{sale.quantity}</td>
                  <td className={`${isShortReceipt ? 'py-1' : 'py-2'} text-right`}>₱{(sale.quantity * sale.sale_price).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="font-bold text-black">
                <td colSpan="4" className={`${isShortReceipt ? 'py-1' : 'py-2'} text-right`}>Total:</td>
                <td className={`${isShortReceipt ? 'py-1' : 'py-2'} text-right`}>₱{totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Signatures Section - even more compact for short receipt */}
          <div className={`flex flex-wrap justify-between ${isShortReceipt ? 'mt-2 pt-0' : 'mt-8 pt-4'} text-black`}>
            <div className="w-1/3 pr-2 mb-4">
              <div className="border-t border-black pt-1">
                <p className={`text-center ${isShortReceipt ? 'text-[10px]' : 'text-sm'}`}>Prepared By</p>
              </div>
            </div>
            <div className="w-1/3 px-2 mb-4">
              <div className="border-t border-black pt-1">
                <p className={`text-center ${isShortReceipt ? 'text-[10px]' : 'text-sm'}`}>Delivered By</p>
              </div>
            </div>
            <div className="w-1/3 pl-2 mb-4">
              <div className="border-t border-black pt-1">
                <p className={`text-center ${isShortReceipt ? 'text-[10px]' : 'text-sm'}`}>Checked By</p>
              </div>
            </div>
          </div>

          <div className={`flex justify-between ${isShortReceipt ? 'mt-1' : 'mt-2'} text-black`}>
            <div className="w-1/2 pr-2">
              <div className="border-t border-black pt-1">
                <p className={`text-center ${isShortReceipt ? 'text-[10px]' : 'text-sm'}`}>Received By / Date</p>
              </div>
            </div>
            <div className="w-1/2 pl-2">
              <div className="border-t border-black pt-1">
                <p className={`text-center ${isShortReceipt ? 'text-[10px]' : 'text-sm'}`}>Authorized Signature</p>
              </div>
            </div>
          </div>

          {/* Official Receipt Statement - even more compact for short receipt */}
          <div className={`${isShortReceipt ? 'mt-4 text-[9px]' : 'mt-6 text-xs'} text-gray-600`}>
            <p className="font-bold">Official Receipt Statement:</p>
            <p>1. This is an official receipt issued by Syrincal Trading OPC. Keep for your records.</p>
            <p>2. Prices are subject to change and may differ from previous or future transactions.</p>
            <p>3. Thank you for your valued business!</p>
          </div>
        </div>
      </div>
      {/* Add this to your global styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: ${isShortReceipt ? '9.5in 5.5in' : '9.5in 11in'};
            margin: 0.25in;
            orientation: landscape;
          }
          
          /* Your existing print styles... */
          body * {
            visibility: hidden;
          }
          .receipt-container,
          .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesReceipt;