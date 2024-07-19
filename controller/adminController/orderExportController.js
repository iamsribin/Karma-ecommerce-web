const Order = require("../../models/userModels/orderModel");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const csv = require("csv");
const stringify = csv.stringify;

// Generating Excel sheet for orders.
const generateOrderExcel = async (req, res) => {
  const { startingDate, endingDate } = req.body;
  console.log("start end",startingDate, endingDate );
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    worksheet.columns = [
      { header: "Order ID", key: "orderId"},
      { header: "User ID", key: "user._id", width: 30 },
      { header: "User Name", key: "user.firstName",width: 20},
      { header: "Number", key: "address.phoneNumber",width: 20},
      { header: "User Email", key: "user.email",width: 30 },
      { header: "Address", key: "address.address", width: 30 },
      { header: "District", key: "address.district" },
      { header: "Products", key: "products", width: 55},
      { header: "Subtotal", key: "subTotal" },
      { header: "Shipping", key: "shipping" },
      { header: "discount", key: "discount" },
      { header: "Total Price", key: "totalPrice" },
    ];

    // Filtering based on dates. If they are provided along the URL as query
    const filter = {};
    if (startingDate) {
      const date = new Date(startingDate);
      filter.createdAt = { $gte: date };
    }
    if (endingDate) {
      const date = new Date(endingDate);
      filter.createdAt = { ...filter.createdAt, $lte: date };
    }

    // Fetching all the orders
    const orders = await Order.find(filter).populate([
      "userId",
      "address",
      "products.statusHistory",
      "products",
      "products.productId",
    ]);
console.log("order",orders);

    orders.map((item) => {
      const productsDetails = item.products
        .map((product) => {
          return `${product.productId.name} (${product.quantity} units, ₹${product.price} each)`;
        })
        .join("\n");

      const row = {
        orderId: item.orderId.toString(),
        "user._id": item.userId._id.toString(),
        "user.firstName": item.userId.name ,
        "address.phoneNumber": item.address.phoneNumber,
        "user.email": item.userId.email,
        "address.address": item.address.address,
        "address.district": item.address.district,
        products: productsDetails,
        subTotal: item.subTotal,
        shipping: "free",
        discount: item.discount,
        totalPrice: item.totalPrice,
      };

      worksheet.addRow(row);
    });

    // Set headers for the response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");

    const buffer = await workbook.xlsx.writeBuffer();

    res.send(buffer);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

// Generating CSV for orders
const generateOrderCSV = async (req, res) => {
  const { startingDate, endingDate } = req.body;

  try {
    // Filtering based on dates. If they are provided along the URL as query
    const filter = {};
    if (startingDate) {
      const date = new Date(startingDate);
      filter.createdAt = { $gte: date };
    }
    if (endingDate) {
      const date = new Date(endingDate);
      filter.createdAt = { ...filter.createdAt, $lte: date };
    }

    // Fetching all the orders
    const orders = await Order.find(filter).populate([
        "userId",
        "address",
        "products.statusHistory",
        "products",
        "products.productId",
    ]);

    const csvData = [];

    // Headers
    const headers = [
      "Order ID",
      "User ID",
      "User Name",
      "Number",
      "User Email",
      "Address",
      "District",
      "Products",
      "Subtotal",
      "Shipping",
      "Discount",
      "Total Price",
    ];

    csvData.push(headers);

    orders.forEach((item) => {
      const productsDetails = item.products
        .map((product) => {
          return `${product.productId.name} (${product.quantity} units, rs:${product.price} each)`;
        })
        .join("\n");

      const row = [
        item.orderId.toString(),
        item.userId._id.toString(),
        item.userId.name, 
        item.address.phoneNumber,
        item.userId.email,
        item.address.address,
        item.address.district,,
        productsDetails,
        item.subTotal,
        "free",
        item.discount,
        item.totalPrice,
      ];

      csvData.push(row);
    });

    // Set headers for the response
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=orders.csv");

    // Convert the CSV data to a string and send it in the response
    stringify(csvData, { quoted: true }, (err, output) => {
      if (err) {
        return res.status(500).json({ error: "Failed to generate CSV" });
      }

      res.send(output);
    });
  } catch (error) {console.log(error);
    res.status(400).json({ error: error.message });
  }
};

//Generate PDF function

const generatePDF = (orders) => {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          let pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
  
        // Add content to the PDF
        orders.forEach(order => {
          doc.fontSize(18).text(`Order ID: ${order.orderId}`, {underline: true});
          doc.fontSize(12).text(`Customer: ${order.customerName} (${order.customerEmail})`);
          doc.text(`Address: ${order.address}`);
          doc.text(`Order Date: ${order.orderDate}`);
          doc.text(`Delivery Date: ${order.deliveryDate}`);
          doc.text(`Payment Method: ${order.paymentMethod}`);
          doc.moveDown();
          
          doc.text('Products:');
          order.products.forEach(product => {
            doc.text(`- ${product.name} (Size: ${product.size})`);
            doc.text(`  Quantity: ${product.quantity}, Price: ${product.price}, Offer Price: ${product.offerPrice}`);
            doc.text(`  Status: ${product.status}`);
            doc.moveDown(0.5);
          });
  
          doc.moveDown();
          doc.text(`Subtotal: ${order.subTotal}`);
          doc.text(`Discount: ${order.discount}`);
          doc.text(`Total Price: ${order.totalPrice}`);
          
          doc.addPage();
        });
  
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  };

// Controller function for Generating PDF for orders
const generateOrderPDF = async (req, res) => {
    const { startingDate, endingDate } = req.body;
  
    try {
      // Filtering based on dates
      const filter = {};
      if (startingDate) {
        filter.createdAt = { $gte: new Date(startingDate) };
      }
      if (endingDate) {
        filter.createdAt = { ...filter.createdAt, $lte: new Date(endingDate) };
      }
  
      // Fetching all the orders with necessary population
      const orders = await Order.find(filter).populate([
        {
          path: 'userId',
          select: 'name email'
        },
        'address',
        {
          path: 'products.productId',
          select: 'name basePrice offerAmount brand category tag'
        },
        {
          path: 'products.size',
          select: 'size'
        },
        'products.statusHistory'
      ]);
  
      console.log("orders",orders);

      // Format the orders data for PDF generation
      const formattedOrders = orders.map(order => ({
        orderId: order.orderId,
        customerName: order.userId.name,
        customerEmail: order.userId.email,
        address: `${order.address.address}, ${order.address.locality}, ${order.address.district}, ${order.address.state} - ${order.address.pincode}`,
        subTotal: order.subTotal,
        totalPrice: order.totalPrice,
        discount: order.discount,
        paymentMethod: order.paymentMethod,
        orderDate: order.createdAt.toLocaleDateString(),
        deliveryDate: order.deliveryDate.toLocaleDateString(),
        products: order.products.map(product => ({
          name: product.productId.name,
          quantity: product.quantity,
          size: product.size.size,
          price: product.price,
          offerPrice: product.offerPrice,
          status: product.status,
          statusHistory: product.statusHistory.map(history => ({
            status: history.status,
            date: history.date.toLocaleDateString(),
            reason: history.reason
          }))
        }))
      }));
  
      // Generate PDF using the formatted orders
      const pdfBuffer = await generatePDF(formattedOrders);
  
      // Set headers for the response
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=orders.pdf");
  
      res.status(200).end(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(400).json({ error: error.message });
    }
  };


module.exports = {
  generateOrderExcel,
  generateOrderCSV,
  generateOrderPDF,
};
