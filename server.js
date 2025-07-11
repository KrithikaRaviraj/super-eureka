const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const usersRouter = require('./routes/users');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/super-eureka', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// API route
app.use('/api/users', usersRouter);

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});