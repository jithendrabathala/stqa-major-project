const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

// Connect to Database and start listening
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
  });
}).catch(err => {
  console.error('Failed to connect to database', err);
  process.exit(1);
});
