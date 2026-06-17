const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// @route   GET /api/books
// @desc    Get all books (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { search, title, author, genre } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } }
      ];
    } else {
      if (title) query.title = { $regex: title, $options: 'i' };
      if (author) query.author = { $regex: author, $options: 'i' };
      if (genre) query.genre = { $regex: genre, $options: 'i' };
    }

    const books = await Book.find(query).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/books/stats
// @desc    Get book inventory stats (Total books, unique genres, oldest/newest book years)
router.get('/stats', async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const uniqueGenres = await Book.distinct('genre');
    const oldestBook = await Book.findOne().sort({ publishedYear: 1 }).select('title publishedYear');
    const newestBook = await Book.findOne().sort({ publishedYear: -1 }).select('title publishedYear');

    res.json({
      totalBooks,
      uniqueGenresCount: uniqueGenres.length,
      genresList: uniqueGenres,
      oldestBook: oldestBook ? { title: oldestBook.title, year: oldestBook.publishedYear } : null,
      newestBook: newestBook ? { title: newestBook.title, year: newestBook.publishedYear } : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/books/:id
// @desc    Get a single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Book ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/books
// @desc    Add a new book
router.post('/', async (req, res) => {
  try {
    const { title, author, genre, publishedYear, isbn } = req.body;

    // Validate simple required checks to show informative client messages
    if (!title || !author || !genre || !publishedYear || !isbn) {
      return res.status(400).json({ message: 'All fields (title, author, genre, publishedYear, isbn) are required' });
    }

    // Check if book with isbn already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: `A book with ISBN '${isbn}' already exists.` });
    }

    const newBook = new Book({
      title,
      author,
      genre,
      publishedYear: parseInt(publishedYear, 10),
      isbn
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/books/:id
// @desc    Update a book
router.put('/:id', async (req, res) => {
  try {
    const { title, author, genre, publishedYear, isbn } = req.body;

    if (publishedYear && isNaN(parseInt(publishedYear, 10))) {
      return res.status(400).json({ message: 'Published year must be a valid number' });
    }

    // Check if ISBN is being changed and if new ISBN is already in use by another book
    if (isbn) {
      const existingBook = await Book.findOne({ isbn, _id: { $ne: req.params.id } });
      if (existingBook) {
        return res.status(400).json({ message: `A book with ISBN '${isbn}' already exists.` });
      }
    }

    const updatedData = {
      title,
      author,
      genre,
      isbn
    };
    if (publishedYear) {
      updatedData.publishedYear = parseInt(publishedYear, 10);
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Book ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Book ID format' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
