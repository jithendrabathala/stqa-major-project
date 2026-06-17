document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const booksList = document.getElementById('booksList');
  
  // Add Book form elements
  const bookForm = document.getElementById('bookForm');
  const titleInput = document.getElementById('title');
  const authorInput = document.getElementById('author');
  const genreInput = document.getElementById('genre');
  const publishedYearInput = document.getElementById('publishedYear');
  const isbnInput = document.getElementById('isbn');
  const titleError = document.getElementById('titleError');
  const authorError = document.getElementById('authorError');
  const genreError = document.getElementById('genreError');
  const yearError = document.getElementById('yearError');
  const isbnError = document.getElementById('isbnError');

  // Edit Book form elements
  const editBookForm = document.getElementById('editBookForm');
  const editBookId = document.getElementById('editBookId');
  const editTitle = document.getElementById('editTitle');
  const editAuthor = document.getElementById('editAuthor');
  const editGenre = document.getElementById('editGenre');
  const editPublishedYear = document.getElementById('editPublishedYear');
  const editIsbn = document.getElementById('editIsbn');
  const editTitleError = document.getElementById('editTitleError');
  const editAuthorError = document.getElementById('editAuthorError');
  const editGenreError = document.getElementById('editGenreError');
  const editYearError = document.getElementById('editYearError');
  const editIsbnError = document.getElementById('editIsbnError');
  const editCancelBtn = document.getElementById('editCancelBtn');

  // Feedback elements
  const feedbackContainer = document.getElementById('feedbackContainer');
  const feedbackMessage = document.getElementById('feedbackMessage');
  const closeFeedbackBtn = document.getElementById('closeFeedbackBtn');

  let feedbackTimeout;
  let keepFeedbackOnce = false;

  // ROUTER LOGIC
  function handleRoute() {
    if (!window.location.hash || window.location.hash === '#/') {
      window.location.hash = '#/books';
      return;
    }
    const hash = window.location.hash;
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    
    // Clear feedback
    if (!keepFeedbackOnce) {
      hideFeedback();
    }
    keepFeedbackOnce = false;

    if (hash === '#/books') {
      document.getElementById('page-directory').classList.remove('hidden');
      fetchBooks();
    } else if (hash === '#/add') {
      document.getElementById('page-add').classList.remove('hidden');
      bookForm.reset();
      clearErrors();
    } else if (hash.startsWith('#/edit')) {
      document.getElementById('page-edit').classList.remove('hidden');
      clearErrors();
      
      // Parse query string in hash (e.g. #/edit?id=...)
      const queryIndex = hash.indexOf('?');
      if (queryIndex !== -1) {
        const queryStr = hash.substring(queryIndex);
        const params = new URLSearchParams(queryStr);
        const id = params.get('id');
        if (id) {
          loadBookToEdit(id);
        } else {
          showFeedback('No book ID provided for editing');
          window.location.hash = '#/books';
        }
      } else {
        window.location.hash = '#/books';
      }
    } else {
      // 404 fallback
      window.location.hash = '#/books';
    }
  }

  window.addEventListener('hashchange', handleRoute);
  // Trigger router on initial load
  handleRoute();

  // Fetch books
  async function fetchBooks(searchQuery = '') {
    booksList.innerHTML = `
      <tr id="loadingRow">
        <td colspan="6" class="table-info-msg" data-testid="loading-status">Loading books...</td>
      </tr>
    `;

    try {
      let url = '/api/books';
      if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(url);
      const books = await response.json();

      if (!response.ok) {
        throw new Error(books.error || 'Failed to fetch books');
      }

      renderBooksTable(books);
      fetchStats();
    } catch (error) {
      showFeedback(`Error: ${error.message}`);
      booksList.innerHTML = `
        <tr>
          <td colspan="6" class="table-info-msg">Error: ${error.message}</td>
        </tr>
      `;
    }
  }

  async function fetchStats() {
    const statsSummary = document.getElementById('statsSummary');
    if (!statsSummary) return;

    try {
      const response = await fetch('/api/books/stats');
      const stats = await response.json();

      if (response.ok) {
        const oldestText = stats.oldestBook ? `"${stats.oldestBook.title}" (${stats.oldestBook.year})` : 'N/A';
        const newestText = stats.newestBook ? `"${stats.newestBook.title}" (${stats.newestBook.year})` : 'N/A';
        statsSummary.textContent = `Total Books: ${stats.totalBooks} | Unique Genres: ${stats.uniqueGenresCount} | Oldest Book: ${oldestText} | Newest Book: ${newestText}`;
      } else {
        statsSummary.textContent = 'Failed to load statistics.';
      }
    } catch (error) {
      statsSummary.textContent = 'Failed to load statistics.';
    }
  }

  function renderBooksTable(books) {
    if (books.length === 0) {
      booksList.innerHTML = `
        <tr id="emptyRow">
          <td colspan="6" class="table-info-msg" data-testid="no-books-status">No books in directory.</td>
        </tr>
      `;
      return;
    }

    booksList.innerHTML = '';
    books.forEach(book => {
      const tr = document.createElement('tr');
      tr.id = `row-${book._id}`;
      tr.setAttribute('data-testid', `book-row-${book.isbn}`);

      tr.innerHTML = `
        <td class="book-title" data-testid="book-title-${book.isbn}">${escapeHTML(book.title)}</td>
        <td class="book-author" data-testid="book-author-${book.isbn}">${escapeHTML(book.author)}</td>
        <td class="book-genre" data-testid="book-genre-${book.isbn}">${escapeHTML(book.genre)}</td>
        <td class="book-year" data-testid="book-year-${book.isbn}">${book.publishedYear}</td>
        <td class="book-isbn" data-testid="book-isbn-${book.isbn}">${escapeHTML(book.isbn)}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-edit" data-testid="edit-btn-${book.isbn}">Edit</button>
            <button class="btn-delete" data-testid="delete-btn-${book.isbn}">Delete</button>
          </div>
        </td>
      `;

      // Event listeners for actions
      tr.querySelector('.btn-edit').addEventListener('click', () => {
        window.location.hash = `#/edit?id=${book._id}`;
      });

      tr.querySelector('.btn-delete').addEventListener('click', () => {
        deleteBook(book._id, book.title);
      });

      booksList.appendChild(tr);
    });
  }

  // Load book details for editing
  async function loadBookToEdit(id) {
    try {
      const response = await fetch(`/api/books/${id}`);
      const book = await response.json();

      if (!response.ok) {
        throw new Error(book.message || 'Failed to load book');
      }

      editBookId.value = book._id;
      editTitle.value = book.title;
      editAuthor.value = book.author;
      editGenre.value = book.genre;
      editPublishedYear.value = book.publishedYear;
      editIsbn.value = book.isbn;
    } catch (error) {
      showFeedback(`Error: ${error.message}`);
      window.location.hash = '#/books';
    }
  }

  // Form Submission: Add Book
  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const genre = genreInput.value.trim();
    const publishedYear = publishedYearInput.value.trim();
    const isbn = isbnInput.value.trim();

    let hasErrors = false;

    if (!title) {
      titleError.textContent = 'Required';
      hasErrors = true;
    }
    if (!author) {
      authorError.textContent = 'Required';
      hasErrors = true;
    }
    if (!genre) {
      genreError.textContent = 'Required';
      hasErrors = true;
    }
    if (!publishedYear) {
      yearError.textContent = 'Required';
      hasErrors = true;
    } else {
      const yearNum = parseInt(publishedYear, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum <= 0 || yearNum > currentYear + 1) {
        yearError.textContent = `Must be 1 to ${currentYear + 1}`;
        hasErrors = true;
      }
    }
    if (!isbn) {
      isbnError.textContent = 'Required';
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, genre, publishedYear: parseInt(publishedYear, 10), isbn })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add book');
      }

      keepFeedbackOnce = true;
      window.location.hash = '#/books';
      showFeedback(`Book "${title}" added successfully.`);
    } catch (error) {
      showFeedback(error.message);
    }
  });

  // Form Submission: Edit Book
  editBookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const id = editBookId.value;
    const title = editTitle.value.trim();
    const author = editAuthor.value.trim();
    const genre = editGenre.value.trim();
    const publishedYear = editPublishedYear.value.trim();
    const isbn = editIsbn.value.trim();

    let hasErrors = false;

    if (!title) {
      editTitleError.textContent = 'Required';
      hasErrors = true;
    }
    if (!author) {
      editAuthorError.textContent = 'Required';
      hasErrors = true;
    }
    if (!genre) {
      editGenreError.textContent = 'Required';
      hasErrors = true;
    }
    if (!publishedYear) {
      editYearError.textContent = 'Required';
      hasErrors = true;
    } else {
      const yearNum = parseInt(publishedYear, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum <= 0 || yearNum > currentYear + 1) {
        editYearError.textContent = `Must be 1 to ${currentYear + 1}`;
        hasErrors = true;
      }
    }
    if (!isbn) {
      editIsbnError.textContent = 'Required';
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, genre, publishedYear: parseInt(publishedYear, 10), isbn })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update book');
      }

      keepFeedbackOnce = true;
      window.location.hash = '#/books';
      showFeedback(`Book "${title}" updated successfully.`);
    } catch (error) {
      showFeedback(error.message);
    }
  });

  // Delete Book
  async function deleteBook(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;

    try {
      const response = await fetch(`/api/books/${id}`, { method: 'DELETE' });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete book');
      }

      showFeedback(`Book "${title}" deleted.`);
      fetchBooks(searchInput.value.trim());
    } catch (error) {
      showFeedback(error.message);
    }
  }

  // Cancel Edit
  editCancelBtn.addEventListener('click', () => {
    window.location.hash = '#/books';
  });

  // Search
  searchBtn.addEventListener('click', () => {
    const term = searchInput.value.trim();
    if (term) {
      clearSearchBtn.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
    }
    fetchBooks(term);
  });

  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    fetchBooks();
  });

  // Feedback Helpers
  function showFeedback(message) {
    clearTimeout(feedbackTimeout);
    feedbackMessage.textContent = message;
    feedbackContainer.classList.remove('hidden');
    feedbackTimeout = setTimeout(hideFeedback, 5000);
  }

  function hideFeedback() {
    feedbackContainer.classList.add('hidden');
  }

  closeFeedbackBtn.addEventListener('click', hideFeedback);

  function clearErrors() {
    const errors = [titleError, authorError, genreError, yearError, isbnError,
                    editTitleError, editAuthorError, editGenreError, editYearError, editIsbnError];
    errors.forEach(e => {
      if (e) e.textContent = '';
    });
  }

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});
