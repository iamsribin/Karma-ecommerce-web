const Order = require("../../models/userModels/orderModel");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit-table");
const csv = require("csv");
const stringify = csv.stringify;

// Helper function to safely access nested properties
const safeGet = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || 'N/A';
};

// Generating Excel sheet for orders
const generateOrderExcel = async (req, res) => {
  const { startingDate, endingDate } = req.body;
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    worksheet.columns = [
      { header: "Order ID", key: "orderId", width: 15 },
      { header: "User ID", key: "userId", width: 30 },
      { header: "User Name", key: "userName", width: 20 },
      { header: "Number", key: "phoneNumber", width: 20 },
      { header: "User Email", key: "userEmail", width: 30 },
      { header: "Address", key: "address", width: 30 },
      { header: "District", key: "district", width: 15 },
      { header: "Products", key: "products", width: 55 },
      { header: "Subtotal", key: "subTotal", width: 15 },
      { header: "Shipping", key: "shipping", width: 15 },
      { header: "Discount", key: "discount", width: 15 },
      { header: "Total Price", key: "totalPrice", width: 15 },
    ];

    const filter = {};
    if (startingDate) filter.createdAt = { $gte: new Date(startingDate) };
    if (endingDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endingDate) };

    const orders = await Order.find(filter).populate([
      { path: "userId", select: "name email" },
      "address",
      { path: "products.productId", select: "name" },
    ]);

    orders.forEach((item) => {
      const row = {
        orderId: safeGet(item, 'orderId'),
        userId: safeGet(item, 'userId._id'),
        userName: safeGet(item, 'userId.name'),
        phoneNumber: safeGet(item, 'address.phoneNumber'),
        userEmail: safeGet(item, 'userId.email'),
        address: safeGet(item, 'address.address'),
        district: safeGet(item, 'address.district'),
        products: item.products.map(product => 
          `${safeGet(product, 'productId.name')} (${product.quantity} units, ₹${product.price} each)`
        ).join("\n"),
        subTotal: item.subTotal || 'N/A',
        shipping: "free",
        discount: item.discount || 'N/A',
        totalPrice: item.totalPrice || 'N/A',
      };

      worksheet.addRow(row);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    console.error("Excel generation error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Generating CSV for orders
const generateOrderCSV = async (req, res) => {
  const { startingDate, endingDate } = req.body;

  try {
    const filter = {};
    if (startingDate) filter.createdAt = { $gte: new Date(startingDate) };
    if (endingDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endingDate) };

    const orders = await Order.find(filter).populate([
      { path: "userId", select: "name email" },
      "address",
      { path: "products.productId", select: "name" },
    ]);

    const csvData = [
      [
        "Order ID", "User ID", "User Name", "Number", "User Email", "Address",
        "District", "Products", "Subtotal", "Shipping", "Discount", "Total Price"
      ]
    ];

    orders.forEach((item) => {
      const productsDetails = item.products
        .map((product) => `${safeGet(product, 'productId.name')} (${product.quantity} units, rs:${product.price} each)`)
        .join("; ");

      const row = [
        safeGet(item, 'orderId'),
        safeGet(item, 'userId._id'),
        safeGet(item, 'userId.name'),
        safeGet(item, 'address.phoneNumber'),
        safeGet(item, 'userId.email'),
        safeGet(item, 'address.address'),
        safeGet(item, 'address.district'),
        productsDetails,
        item.subTotal || 'N/A',
        "free",
        item.discount || 'N/A',
        item.totalPrice || 'N/A',
      ];

      csvData.push(row);
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=orders.csv");

    stringify(csvData, { quoted: true }, (err, output) => {
      if (err) {
        return res.status(500).json({ error: "Failed to generate CSV" });
      }
      res.send(output);
    });
  } catch (error) {
    console.error("CSV generation error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Generating PDF for orders
const generateOrderPDF = async (req, res) => {
  const { startingDate, endingDate } = req.body;

  try {
    const filter = {};
    if (startingDate) filter.createdAt = { $gte: new Date(startingDate) };
    if (endingDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endingDate) };

    const orders = await Order.find(filter).populate([
      { path: "userId", select: "name email" },
      "address",
      { path: "products.productId", select: "name" },
    ]);

    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=orders.pdf");

    doc.pipe(res);

    doc.fontSize(16).text('Sales Report', { align: 'center' });
    doc.moveDown();

    const tableData = {
      title: "Orders",
      headers: [
        "Order ID", "Customer Name", "Email", "Phone", "Address", "Products", 
        "Subtotal", "Discount", "Total Price", "Payment Method", "Order Date"
      ],
      rows: orders.map(order => [
        safeGet(order, 'orderId'),
        safeGet(order, 'userId.name'),
        safeGet(order, 'userId.email'),
        safeGet(order, 'address.phoneNumber'),
        safeGet(order, 'address.address'),
        order.products.map(product => 
          `${safeGet(product, 'productId.name')} (${product.quantity})`
        ).join(", "),
        order.subTotal || 'N/A',
        order.discount || 'N/A',
        order.totalPrice || 'N/A',
        safeGet(order, 'paymentMethod'),
        safeGet(order, 'createdAt').toLocaleDateString()
      ])
    };

    // Set some styling options
    const tableOptions = {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
      prepareRow: (row, indexColumn, indexRow, rectRow) => {
        doc.font('Helvetica').fontSize(8);
        indexColumn === 0 && doc.addBackground(rectRow, indexRow % 2 ? 'white' : 'lightgray', 0.15);
      },
    };

    // Draw the table
    doc.table(tableData, tableOptions);

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  generateOrderExcel,
  generateOrderCSV,
  generateOrderPDF,
};