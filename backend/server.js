// -------------------- server.js --------------------
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
connectDB();



app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

