const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true
  },
  publishedYear: {
    type: Number,
    required: [true, 'Published year is required'],
    validate: {
      validator: function(val) {
        return Number.isInteger(val) && val > 0 && val <= new Date().getFullYear() + 1;
      },
      message: 'Published year must be a valid year'
    }
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);
