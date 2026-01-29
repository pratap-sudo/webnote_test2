# Admin Panel Testing Guide

## ✅ Servers Running
- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173

---

## 🧪 Testing Steps

### Step 1: Create an Admin User
Since there are no admins initially, you need to manually create one in MongoDB:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Find your `mern-auth` database
3. In the Users collection, create or update a user with:
   ```json
   {
     "name": "Admin User",
     "email": "admin@test.com",
     "password": "$2a$10$... (hashed password)",
     "isAdmin": true,
     "files": [],
     "createdAt": new Date()
   }
   ```

**Quick way:** Use MongoDB Compass or Atlas GUI to set `isAdmin: true` for any existing user.

---

### Step 2: Test Admin Login
1. Open http://localhost:5173
2. Click **"Admin"** link in the navbar (orange text)
3. Enter credentials:
   - Email: `admin@test.com`
   - Password: `your-password`
4. Should redirect to `/admin-dashboard`

---

### Step 3: Test Admin Dashboard Features

#### View Statistics
- See total users, admins, and files count
- All stats should update in real-time

#### View All Users
- Table shows all registered users with:
  - Name
  - Email
  - Number of files uploaded
  - Admin status (badge)
  - Join date

#### Delete User
- Click **"Delete"** button on any user row
- Confirm deletion
- User should be removed from database

#### Toggle Admin Status
- Click **"Make Admin"** to promote a user
- Click **"Revoke Admin"** to demote an admin
- Status badge should change immediately

#### Logout
- Click **"Logout"** button
- Should redirect to admin login page
- Token cleared from localStorage

---

## 🔍 Testing with API (Optional)

### Get Admin Token
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"yourpassword"}'
```

### Get All Users
```bash
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get System Stats
```bash
curl http://localhost:5000/api/admin/system-stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Delete a User
```bash
curl -X DELETE http://localhost:5000/api/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Toggle Admin Status
```bash
curl -X PATCH http://localhost:5000/api/admin/users/USER_ID/toggle-admin \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ✨ What Should Work

✅ Admin authentication with JWT token  
✅ Protected routes (unauthorized users redirected to login)  
✅ Dashboard displays real-time statistics  
✅ User management table with all details  
✅ Delete user functionality  
✅ Promote/demote users to/from admin  
✅ Logout functionality  
✅ Responsive design on mobile  

---

## 🐛 Troubleshooting

**Issue:** "Not an admin" error
- Solution: Make sure `isAdmin: true` is set in MongoDB for your user

**Issue:** "Invalid token" on dashboard
- Solution: Check if `adminToken` is in localStorage (F12 → Application → Storage)

**Issue:** Can't see users in table
- Solution: Check MongoDB connection in backend console (should say "MongoDB connected")

**Issue:** Delete button not working
- Solution: Check browser console for errors, verify token is valid

---

## 📝 Test Checklist

- [ ] Successfully login as admin
- [ ] View statistics dashboard
- [ ] See list of all users
- [ ] Delete a test user
- [ ] Promote a user to admin
- [ ] Demote an admin user
- [ ] Logout and return to login page
- [ ] Token cleared from localStorage
- [ ] Responsive design works on mobile
