# Book Management System — STQA Major Project

A full-stack Book Management application designed and configured to demonstrate comprehensive Software Testing and Quality Assurance (STQA) practices, including E2E UI testing, API testing, load testing, and continuous integration/continuous deployment (CI/CD).

---

## 🚀 Key Features & Flow Coverage
The project implements and tests **6 critical application flows** across all testing frameworks (Cypress, Selenium, and JMeter):

1. **Create Book (`POST /api/books`)** — Adds a new book with fields (Title, Author, Genre, Published Year, ISBN) and validates unique ISBN constraints.
2. **Fetch All Books (`GET /api/books`)** — Retrieves the complete list of books with optional search filtering by title, author, or genre.
3. **Get Inventory Stats (`GET /api/books/stats`)** — Computes total books, unique genres count, and identifies the oldest and newest books.
4. **Get Book by ID (`GET /api/books/:id`)** — Retrieves a single book by its MongoDB object ID and populates forms.
5. **Update Book Details (`PUT /api/books/:id`)** — Edits details of an existing book with input validations.
6. **Delete Book (`DELETE /api/books/:id`)** — Removes a book record permanently.

---

## 🛠️ Technology Stack
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Frontend**: Vanilla HTML5, Javascript, CSS3 (Premium dark-mode dashboard)
- **E2E UI Testing**: Cypress (JavaScript), Selenium (Java + TestNG)
- **API Load Testing**: Apache JMeter
- **CI/CD Pipeline**: Jenkins (Declarative pipeline using Docker Compose)

---

## 📁 Project Directory Structure
```text
stqa-major-project/
├── public/                 # Static frontend assets (HTML, CSS, JS)
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── src/                    # Backend API Source Code
│   ├── config/             # DB Connection Config
│   ├── models/             # Mongoose Models (Book.js)
│   ├── routes/             # Express Routing (bookRoutes.js)
│   ├── app.js              # Express App Configuration
│   └── server.js           # Server entry point
├── tests/                  # Test Suites
│   ├── cypress/            # Cypress End-to-End E2E UI Tests
│   │   └── e2e/
│   │       └── book_management.cy.js
│   ├── jmeter/             # Apache JMeter Load Test Config
│   │   └── book_management.jmx
│   └── selenium/           # Selenium + TestNG E2E UI Tests (Maven)
│       ├── pom.xml
│       ├── testng.xml
│       └── src/
│           └── test/java/com/booksystem/BookManagementTest.java
├── screenshots/            # Committed Test Dashboard Evidence & Runs
│   ├── cypress/            # Cypress Spec Run Screenshots
│   ├── jenkins/            # Jenkins CI/CD & Pipeline Runs
│   └── jmeter/             # JMeter Load Test Reports
├── Dockerfile              # Docker Configuration
├── docker-compose.yml      # Docker Compose Config
├── docker-compose.test.yml # Docker Compose Test Environment Config
├── Jenkinsfile             # Jenkins CI/CD Declarative Pipeline
└── package.json            # Node Package Configuration
```

---

## 📋 Prerequisites

Ensure you have the following installed on your local machine before starting:

### 1. Verification Commands
Check if you already have the prerequisites installed:
```bash
node -v      # Expected: v18+
pnpm -v      # Expected: v10+ (or npm -v)
mongod --version # Expected: v4.4+
java -version    # Expected: JDK 17+
mvn -v       # Expected: Maven 3.9+
jmeter -v    # Expected: JMeter 5.4+
```

### 2. macOS Installation Guide (using Homebrew)
If any dependency is missing, you can install it using [Homebrew](https://brew.sh/):

*   **Node.js & pnpm**:
    ```bash
    brew install node
    npm install -g pnpm
    ```
*   **MongoDB Community Edition**:
    ```bash
    brew tap mongodb/brew
    brew install mongodb-community@8.0
    ```
*   **Java Development Kit (JDK 17 or higher) & Maven**:
    ```bash
    brew install openjdk@17
    # Make sure to add openjdk to your PATH as per Brew instructions
    brew install maven
    ```
*   **Apache JMeter**:
    ```bash
    brew install jmeter
    ```

---

## ⚙️ Installation & Local Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/jithendrabathala/stqa-major-project.git
   cd stqa-major-project
   ```

2. **Install Node Dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration file to `.env` and modify the values as needed (especially the MongoDB connection string):
   ```bash
   cp .env.example .env
   ```

4. **Start MongoDB**:
   Ensure MongoDB service is running on your machine:
   ```bash
   brew services start mongodb-community # macOS Homebrew example
   ```

5. **Run the Application**:
   ```bash
   pnpm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the application.

---

## 🧪 Running the Tests

### 1. Cypress E2E UI Tests
Cypress tests execute UI flows and mock network requests using intercepts and assertions.
- **Run in headless mode**:
  ```bash
  pnpm run cypress:run
  ```
- **Open Cypress Test Runner (GUI)**:
  ```bash
  pnpm run cypress:open
  ```

### 2. Selenium + TestNG E2E Tests
Selenium tests run headless in Chrome using TestNG assertions.
- **Run the tests**:
  ```bash
  cd tests/selenium
  JAVA_HOME=/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home mvn clean test
  ```
  *(Note: Adjust the `JAVA_HOME` path according to your local Java installation environment if needed).*

### 3. JMeter API Load Testing
The JMeter test suite runs 6 API performance threads.
- **Run JMeter in GUI Mode**:
  Open JMeter, go to `File > Open`, and choose:
  `tests/jmeter/book_management.jmx`
- **Run JMeter in CLI Mode (Generate HTML Dashboard)**:
  ```bash
  jmeter -n -t tests/jmeter/book_management.jmx -l tests/jmeter/results.jtl -e -o tests/jmeter/dashboard-report
  ```

---

## 🔗 Jenkins CI/CD Pipeline Setup
The project uses a declarative Jenkins pipeline (`Jenkinsfile`) running on GitHub triggers.

### Triggers & Build Options:
- **Triggers**: Builds are triggered on GitHub pushes (`githubPush()`) and polled every 5 minutes.
- **Build Step**: Prepares application environment using Maven and Docker Compose, running unit, Cypress, and Selenium tests in parallel containers.
- **Post-Build Action**: Publishes XML reports to the **TestNG Reports Analyzer** dashboard and compiles JUnit summaries:
  ```groovy
  testNG reportFilenamePattern: 'tests/selenium/target/surefire-reports/testng-results.xml'
  junit testResults: 'tests/selenium/target/surefire-reports/junitreports/*.xml', allowEmptyResults: true
  ```

---

## 📸 Test Results & Screenshots Location
Evidence of successful test runs and dashboards are committed under the `screenshots/` directory. Click the links below to view the respective screenshots directly:

### 🌲 Cypress E2E Spec Runs
- [Test 1 Case 1: Fetch all books successfully on page load](./screenshots/cypress/test1/case1.png)
- [Test 1 Case 2: Filter books list based on search parameters](./screenshots/cypress/test1/case2.png)
- [Test 2 Case 1: Fetch and display correct book counts and unique genres](./screenshots/cypress/test2/case1.png)
- [Test 2 Case 2: Show oldest and newest book bounds in stats summary](./screenshots/cypress/test2/case2.png)
- [Test 3 Case 1: Fetch a single book by ID and populate Edit form fields](./screenshots/cypress/test3/case1.png)
- [Test 3 Case 2: Return 400 response for an invalid book ID format](./screenshots/cypress/test3/case2.png)
- [Test 4 Case 1: Create a new book successfully with 201 status code](./screenshots/cypress/test4/case1.png)
- [Test 4 Case 2: Return 400 error response for a duplicate ISBN entry](./screenshots/cypress/test4/case2.png)
- [Test 5 Case 1: Update book details successfully and return 200 status code](./screenshots/cypress/test5/case1.png)
- [Test 5 Case 2: Return 400 error response when updating with invalid parameters](./screenshots/cypress/test5/case2.png)
- [Test 6 Case 1: Delete the book record and return 200 status code](./screenshots/cypress/test6/case1.png)
- [Test 6 Case 2: Return 400 error response when attempting to delete invalid ID format](./screenshots/cypress/test6/case2.png)

### 📊 JMeter API Performance Logs
- [HTTP Request Defaults Configuration](./screenshots/jmeter/request.png)
- **Test 1 (POST /api/books)**: [Execution Report](./screenshots/jmeter/test1/report.png) | [Request details](./screenshots/jmeter/test1/request.png)
- **Test 2 (GET /api/books)**: [Execution Report](./screenshots/jmeter/test2/report.png) | [Request details](./screenshots/jmeter/test2/request.png)
- **Test 3 (GET /api/books/stats)**: [Execution Report](./screenshots/jmeter/test3/report.png) | [Request details](./screenshots/jmeter/test3/request.png)
- **Test 4 (GET /api/books/${bookId})**: [Execution Report](./screenshots/jmeter/test4/report.png) | [Request details](./screenshots/jmeter/test4/request.png)
- **Test 5 (PUT /api/books/${bookId})**: [Execution Report](./screenshots/jmeter/test5/report.png) | [Request details](./screenshots/jmeter/test5/request.png)
- **Test 6 (DELETE /api/books/${bookId})**: [Execution Report](./screenshots/jmeter/test6/report.png) | [Request details](./screenshots/jmeter/test6/request.png)

### ☸️ Jenkins Pipeline & TestNG Reports
- [Jenkins Server Dashboard](./screenshots/jenkins/dashboard.png)
- [Jenkins Declarative Pipeline Stage Execution Overview](./screenshots/jenkins/pipeline/overview.png)
- [Jenkins Build Stage JUnit Tests Console](./screenshots/jenkins/pipeline/tests-report.png)
- [Cypress Tests Execution Status in Jenkins](./screenshots/jenkins/testNG/cypress-test-report.png)
- [TestNG Reports Analyzer Main Dashboard Overview](./screenshots/jenkins/testNG/dashboard.png)
- [TestNG Reports Analyzer Detailed Success Rates](./screenshots/jenkins/testNG/report.png)
