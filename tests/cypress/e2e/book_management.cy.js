describe('Book Management System E2E Tests', () => {

  // Test 1: API - GET /api/books (Get All Books)
  describe('Test 1: API - GET /api/books (Get All Books)', () => {
    beforeEach(() => cy.visit('/'));

    it('Case 1: Should fetch all books successfully on page load', () => {
      cy.intercept('GET', '/api/books').as('getBooks');
      cy.visit('/');
      cy.wait('@getBooks').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 304]);
      });
      cy.get('[data-testid="books-table"]').should('be.visible');
      cy.screenshot('test1/case1', { capture: 'runner' });
    });

    it('Case 2: Should filter books list based on search parameters', () => {
      cy.intercept('GET', '/api/books?search=*').as('searchBooks');
      cy.get('[data-testid="input-search"]').type('Cypress');
      cy.get('[data-testid="btn-search"]').click();
      cy.wait('@searchBooks').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 304]);
      });
      cy.screenshot('test1/case2', { capture: 'runner' });
    });
  });

  // Test 2: API - GET /api/books/stats (Get Inventory Stats)
  describe('Test 2: API - GET /api/books/stats (Get Inventory Stats)', () => {
    beforeEach(() => cy.visit('/'));

    it('Case 1: Should fetch and display correct book counts and unique genres count', () => {
      cy.intercept('GET', '/api/books/stats').as('getStats');
      cy.visit('/');
      cy.wait('@getStats').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 304]);
      });
      cy.get('[data-testid="stats-summary"]')
        .should('contain', 'Total Books:')
        .and('contain', 'Unique Genres:');
      cy.screenshot('test2/case1', { capture: 'runner' });
    });

    it('Case 2: Should show oldest and newest book bounds in stats summary', () => {
      cy.intercept('GET', '/api/books/stats').as('getStats');
      cy.visit('/');
      cy.wait('@getStats').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([200, 304]);
      });
      cy.get('[data-testid="stats-summary"]')
        .should('contain', 'Oldest Book:')
        .and('contain', 'Newest Book:');
      cy.screenshot('test2/case2', { capture: 'runner' });
    });
  });

  // Test 3: API - GET /api/books/:id (Get Book by ID)
  describe('Test 3: API - GET /api/books/:id (Get Book by ID)', () => {
    const isbn = 'CYP-GET-' + Math.floor(100000 + Math.random() * 900000);

    beforeEach(() => cy.visit('/'));

    it('Case 1: Should fetch a single book by ID and populate the Edit form fields', () => {
      // Create a book first so we have an ID
      cy.get('[data-testid="nav-add"]').click();
      cy.get('[data-testid="input-title"]').type('API ID Test Book');
      cy.get('[data-testid="input-author"]').type('QA Bot');
      cy.get('[data-testid="input-genre"]').type('Technical');
      cy.get('[data-testid="input-published-year"]').type('2026');
      cy.get('[data-testid="input-isbn"]').type(isbn);
      cy.get('[data-testid="btn-submit"]').click();

      // Click edit and intercept GET by ID request
      cy.intercept('GET', /\/api\/books\/[a-f0-9]{24}$/).as('getBookById');
      cy.get(`[data-testid="edit-btn-${isbn}"]`).click();
      cy.wait('@getBookById').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
      });
      cy.get('[data-testid="edit-input-title"]').should('have.value', 'API ID Test Book');
      cy.screenshot('test3/case1', { capture: 'runner' });
    });

    it('Case 2: Should return 400 response for an invalid book ID format', () => {
      cy.request({
        method: 'GET',
        url: '/api/books/invalid-mongo-id-12345',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.message).to.contain('Invalid Book ID format');
      });
      cy.screenshot('test3/case2', { capture: 'runner' });
    });
  });

  // Test 4: API - POST /api/books (Create New Book)
  describe('Test 4: API - POST /api/books (Create New Book)', () => {
    const isbn = 'CYP-POST-' + Math.floor(100000 + Math.random() * 900000);

    beforeEach(() => cy.visit('/'));

    it('Case 1: Should create a new book successfully with 201 status code', () => {
      cy.get('[data-testid="nav-add"]').click();
      cy.get('[data-testid="input-title"]').type('POST Test Book');
      cy.get('[data-testid="input-author"]').type('QA Bot');
      cy.get('[data-testid="input-genre"]').type('REST');
      cy.get('[data-testid="input-published-year"]').type('2026');
      cy.get('[data-testid="input-isbn"]').type(isbn);

      cy.intercept('POST', '/api/books').as('postBook');
      cy.get('[data-testid="btn-submit"]').click();
      cy.wait('@postBook').then((interception) => {
        expect(interception.response.statusCode).to.eq(201);
      });
      cy.screenshot('test4/case1', { capture: 'runner' });
    });

    it('Case 2: Should return 400 error response for a duplicate ISBN entry', () => {
      cy.get('[data-testid="nav-add"]').click();
      cy.get('[data-testid="input-title"]').type('Duplicate Book Title');
      cy.get('[data-testid="input-author"]').type('Tester');
      cy.get('[data-testid="input-genre"]').type('REST');
      cy.get('[data-testid="input-published-year"]').type('2026');
      cy.get('[data-testid="input-isbn"]').type(isbn); // Using the same ISBN

      cy.intercept('POST', '/api/books').as('postBookDuplicate');
      cy.get('[data-testid="btn-submit"]').click();
      cy.wait('@postBookDuplicate').then((interception) => {
        expect(interception.response.statusCode).to.eq(400);
      });
      cy.screenshot('test4/case2', { capture: 'runner' });
    });
  });

  // Test 5: API - PUT /api/books/:id (Update Book Details)
  describe('Test 5: API - PUT /api/books/:id (Update Book Details)', () => {
    const isbn = 'CYP-PUT-' + Math.floor(100000 + Math.random() * 900000);

    beforeEach(() => cy.visit('/'));

    it('Case 1: Should update book details successfully and return 200 status code', () => {
      // Create a book
      cy.get('[data-testid="nav-add"]').click();
      cy.get('[data-testid="input-title"]').type('PUT Test Book');
      cy.get('[data-testid="input-author"]').type('QA Bot');
      cy.get('[data-testid="input-genre"]').type('REST');
      cy.get('[data-testid="input-published-year"]').type('2026');
      cy.get('[data-testid="input-isbn"]').type(isbn);
      cy.get('[data-testid="btn-submit"]').click();

      // Edit details
      cy.get(`[data-testid="edit-btn-${isbn}"]`).click();
      cy.get('[data-testid="edit-input-title"]').clear().type('PUT Test Book (Edited)');
      
      cy.intercept('PUT', '/api/books/*').as('putBook');
      cy.get('[data-testid="edit-btn-submit"]').click();
      cy.wait('@putBook').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
      });
      cy.screenshot('test5/case1', { capture: 'runner' });
    });

    it('Case 2: Should return 400 error response when updating with invalid parameters', () => {
      // Create a book via API first to get a valid ID
      cy.request('POST', '/api/books', {
        title: 'PUT API Test',
        author: 'Tester',
        genre: 'REST',
        publishedYear: 2026,
        isbn: 'CYP-PUT-ERR-' + Math.floor(100000 + Math.random() * 900000)
      }).then((createRes) => {
        const id = createRes.body._id;
        // Make invalid PUT request directly to API
        cy.request({
          method: 'PUT',
          url: `/api/books/${id}`,
          body: { publishedYear: 99999 },
          failOnStatusCode: false
        }).then((putRes) => {
          expect(putRes.status).to.eq(400);
        });
      });
      cy.screenshot('test5/case2', { capture: 'runner' });
    });
  });

  // Test 6: API - DELETE /api/books/:id (Delete Book)
  describe('Test 6: API - DELETE /api/books/:id (Delete Book)', () => {
    const isbn = 'CYP-DEL-' + Math.floor(100000 + Math.random() * 900000);

    beforeEach(() => cy.visit('/'));

    it('Case 1: Should delete the book record and return 200 status code', () => {
      // Create a book
      cy.get('[data-testid="nav-add"]').click();
      cy.get('[data-testid="input-title"]').type('DELETE Test Book');
      cy.get('[data-testid="input-author"]').type('QA Bot');
      cy.get('[data-testid="input-genre"]').type('REST');
      cy.get('[data-testid="input-published-year"]').type('2026');
      cy.get('[data-testid="input-isbn"]').type(isbn);
      cy.get('[data-testid="btn-submit"]').click();

      // Accept confirm dialog and intercept delete
      cy.on('window:confirm', () => true);
      cy.intercept('DELETE', '/api/books/*').as('deleteBook');
      cy.get(`[data-testid="delete-btn-${isbn}"]`).click();
      cy.wait('@deleteBook').then((interception) => {
        expect(interception.response.statusCode).to.eq(200);
      });
      cy.screenshot('test6/case1', { capture: 'runner' });
    });

    it('Case 2: Should return 400 error response when attempting to delete invalid ID format', () => {
      cy.request({
        method: 'DELETE',
        url: '/api/books/invalid-mongo-id-12345',
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
      cy.screenshot('test6/case2', { capture: 'runner' });
    });
  });
});
