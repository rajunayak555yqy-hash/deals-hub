require('dotenv').config();
console.log("🚀 Seed file started");
const mongoose = require('mongoose');
const Deal = require('./models/Deal');
const Admin = require('./models/Admin.js');

const sampleDeals = [
  {
    title: 'boAt Airdopes 141 TWS Earbuds with 42H Playtime',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop',
    oldPrice: 2990, newPrice: 999, platform: 'Amazon',
    brand: 'Boat', category: 'Electronics', featured: true, trending: true, hotDeal: true,
    affiliateLink: 'https://amzn.to/boat-airdopes', clicks: 245
  },
  {
    title: 'Noise ColorFit Pro 4 Smart Watch with AMOLED Display',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    oldPrice: 5999, newPrice: 1799, platform: 'Flipkart',
    brand: 'Noise', category: 'Electronics', featured: true, trending: true,
    affiliateLink: 'https://fkrt.co/noise-colorfit', clicks: 189
  },
  {
    title: 'Samsung Galaxy Buds2 Pro Wireless Earbuds',
    imageUrl: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400&h=400&fit=crop',
    oldPrice: 17999, newPrice: 10999, platform: 'Amazon',
    brand: 'Samsung', category: 'Electronics', featured: true, hotDeal: true,
    affiliateLink: 'https://amzn.to/samsung-buds2', clicks: 312
  },
  {
    title: 'Apple AirPods 3rd Generation with Lightning Case',
    imageUrl: 'https://images.unsplash.com/photo-1606741965509-717f7b2a6f0e?w=400&h=400&fit=crop',
    oldPrice: 19900, newPrice: 14900, platform: 'Amazon',
    brand: 'Apple', category: 'Electronics', featured: true,
    affiliateLink: 'https://amzn.to/airpods3', clicks: 421
  },
  {
    title: 'Realme Buds Air 3 Neo ANC Earbuds 40dB Noise Cancel',
    imageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop',
    oldPrice: 3999, newPrice: 1299, platform: 'Flipkart',
    brand: 'Realme', category: 'Electronics', featured: true, trending: true,
    affiliateLink: 'https://fkrt.co/realme-buds', clicks: 156
  },
  {
    title: 'Zebronics Zeb-Sound Bomb X1 True Wireless Earphones',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    oldPrice: 1999, newPrice: 599, platform: 'Flipkart',
    brand: 'Zebronics', category: 'Electronics', featured: false, hotDeal: true,
    affiliateLink: 'https://fkrt.co/zebronics', clicks: 98
  },
  {
    title: 'MI Smart Band 7 with 1.62" AMOLED Display',
    imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&h=400&fit=crop',
    oldPrice: 4999, newPrice: 2499, platform: 'Amazon',
    brand: 'MI', category: 'Fitness', featured: true, trending: true,
    affiliateLink: 'https://amzn.to/mi-band7', clicks: 267
  },
  {
    title: 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop',
    oldPrice: 29990, newPrice: 19990, platform: 'Amazon',
    brand: 'Sony', category: 'Electronics', featured: true, hotDeal: true,
    affiliateLink: 'https://amzn.to/sony-xm4', clicks: 534
  },
  {
    title: 'Women Floral Printed Anarkali Kurti - Meesho Special',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=400&fit=crop',
    oldPrice: 999, newPrice: 399, platform: 'Meesho',
    brand: 'Other', category: 'Fashion', featured: true, trending: true,
    affiliateLink: 'https://meesho.com/kurti', clicks: 178
  },
  {
    title: 'Men Casual Slip-On Running Sports Shoes',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    oldPrice: 1499, newPrice: 499, platform: 'Meesho',
    brand: 'Other', category: 'Fashion', featured: true,
    affiliateLink: 'https://meesho.com/shoes', clicks: 143
  },
  {
    title: 'boAt Rockerz 450 Bluetooth Headphones 15hr Playtime',
    imageUrl: 'https://images.unsplash.com/photo-1600086827875-a63b01f1335c?w=400&h=400&fit=crop',
    oldPrice: 3490, newPrice: 999, platform: 'Amazon',
    brand: 'Boat', category: 'Electronics', featured: false, trending: true,
    affiliateLink: 'https://amzn.to/boat-rockerz', clicks: 201
  },
  {
    title: 'Samsung 43" 4K Ultra HD Smart LED TV',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400&h=400&fit=crop',
    oldPrice: 49999, newPrice: 32999, platform: 'Flipkart',
    brand: 'Samsung', category: 'Electronics', featured: false, hotDeal: true,
    affiliateLink: 'https://fkrt.co/samsung-tv', clicks: 389
  },
  {
    title: 'Prestige Iris 750W Mixer Grinder with 3 Jars',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    oldPrice: 3995, newPrice: 1999, platform: 'Amazon',
    brand: 'Other', category: 'Home', featured: false,
    affiliateLink: 'https://amzn.to/prestige-mg', clicks: 112
  },
  {
    title: 'Lakme Absolute Skin Natural Mousse Matte Foundation',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
    oldPrice: 799, newPrice: 449, platform: 'Meesho',
    brand: 'Other', category: 'Beauty', featured: false,
    affiliateLink: 'https://meesho.com/lakme', clicks: 87
  },
  {
    title: 'MI 108CM (43") 4K Android Smart TV',
    imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=400&fit=crop',
    oldPrice: 32999, newPrice: 24999, platform: 'Flipkart',
    brand: 'MI', category: 'Electronics', featured: false, trending: true,
    affiliateLink: 'https://fkrt.co/mi-tv', clicks: 298
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dealhub');
    console.log('Connected to MongoDB');

    await Deal.deleteMany({});
    await Deal.insertMany(sampleDeals);
    console.log(`✅ Seeded ${sampleDeals.length} deals`);

    // Create admin user
    await Admin.deleteMany({});
    const admin = new Admin({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'Admin@123'
    });
    await admin.save();
    console.log('✅ Admin user created: admin / Admin@123');

    await mongoose.disconnect();
    console.log('🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();