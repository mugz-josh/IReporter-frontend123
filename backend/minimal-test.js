const express = require('express');
const app = express();
const PORT = 3001;

console.log('🚀 Starting minimal test server...');

app.get('/', (req, res) => {
  res.json({ message: 'Minimal server is working!' });
});

app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
});
