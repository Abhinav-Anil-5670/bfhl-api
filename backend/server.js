const express = require('express');
const cors = require('cors');
const bfhlRoutes = require('./routes/bfhlRoutes');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/bfhl', bfhlRoutes);

app.get('/', (req, res) => {
    res.send("BFHL API is running. Send POST requests to /bfhl");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});