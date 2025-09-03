# FreshPick Admin Setup Guide

## 🚀 Quick Setup

### 1. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/freshpick

# Firebase (if using)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# JWT Secret
JWT_SECRET=your-jwt-secret-key
```

### 2. Start MongoDB
Make sure MongoDB is running on your system:

```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# OR
brew services start mongodb-community
```

### 3. Install Dependencies & Run
```bash
npm install
npm run dev
```

## 👨‍💼 Admin Operations

### Making a User Admin

1. **Via Admin Dashboard** (http://localhost:3000/admin):
   - Enter the User ID
   - Click "Make Admin"

2. **Via API**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/make-admin \
     -H "Content-Type: application/json" \
     -d '{"userId": "user-001"}'
   ```

3. **Via Database** (MongoDB):
   ```javascript
   // Connect to your MongoDB
   db.users.updateOne(
     { userId: "user-001" },
     { $set: { role: "admin" } }
   )
   ```

### Seeding the Database

1. **Via Admin Dashboard** (http://localhost:3000/admin):
   - Click "Seed Database"
   - ⚠️ **Warning**: This clears existing data!

2. **Via API**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/seed \
     -H "Content-Type: application/json" \
     -d '{"confirm": true}'
   ```

3. **Via NPM Script**:
   ```bash
   npm run seed
   ```

## 📊 Sample Data Created

After seeding, you'll have:

### Users
- **Admin User**: `admin-001` (admin@freshpick.lk)
- **Customer 1**: `user-001` (john.doe@example.com)  
- **Customer 2**: `user-002` (jane.smith@example.com)

### Categories
- Fresh Produce
- Dairy & Eggs
- Meat & Seafood
- Pantry Staples
- Bakery
- Frozen Foods
- Beverages
- Snacks

### Products
- Organic Bananas (Featured, 10% discount)
- Fresh Carrots (5% discount)
- Organic Spinach (Featured)
- Fresh Milk (Featured, 8% discount)
- Farm Eggs
- Fresh Chicken Breast (Featured, 15% discount)
- Basmati Rice
- Fresh Orange Juice (Featured, 12% discount)

### Orders
- 2 sample orders with different statuses

## 🛠️ Troubleshooting

### Database Connection Issues
1. Check MongoDB is running
2. Verify MONGODB_URI in `.env.local`
3. Check network connectivity

### API Errors
1. Check the browser console for errors
2. Verify the API routes exist
3. Check server logs

### Seeding Fails
1. Ensure MongoDB connection is working
2. Check if models are properly defined
3. Verify there are no validation errors

## 🔗 Useful Endpoints

- **Admin Dashboard**: http://localhost:3000/admin
- **Home Page**: http://localhost:3000
- **Products API**: http://localhost:3000/api/products
- **Categories API**: http://localhost:3000/api/categories
- **Users API**: http://localhost:3000/api/users
- **Make Admin API**: http://localhost:3000/api/admin/make-admin
- **Seed API**: http://localhost:3000/api/admin/seed

## 📋 Default Admin Credentials

After seeding, you can use these test accounts:

**Admin Account:**
- User ID: `admin-001`
- Email: admin@freshpick.lk
- Role: admin

**Customer Accounts:**
- User ID: `user-001`, Email: john.doe@example.com
- User ID: `user-002`, Email: jane.smith@example.com
