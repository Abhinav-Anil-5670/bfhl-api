const express = require('express');
const cors = require('cors');
const bfhlRoutes = require('./routes/bfhlRoutes');

const app = express();

// Global Middlewares [cite: 9, 129, 130]
app.use(express.json());
app.use(cors());

// Route Mounting
app.use('/bfhl', bfhlRoutes);

// Health check route (optional but good for deployment)
app.get('/', (req, res) => {
    res.send("BFHL API is running. Send POST requests to /bfhl");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});