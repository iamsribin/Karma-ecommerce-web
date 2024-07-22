const cron = require('node-cron');
const Product = require('../models/adminModels/product');

// Schedule the job to run every day at midnight

    cron.schedule('0 0 * * *', async () => {
        console.log('Running offer expiry check...');
        try {
          const products = await Product.find({
            $or: [
              { offerExpiryDate: { $lte: new Date() } },
              { categoryOfferExpiryDate: { $lte: new Date() } }
            ]
          });
      
          for (const product of products) {
            await product.checkAndUpdateOffers();
          }
      
          console.log(`Checked and updated ${products.length} products.`);
        } catch (error) {
          console.error('Error in offer expiry job:', error);
        }
      });

