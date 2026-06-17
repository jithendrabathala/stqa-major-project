package com.booksystem;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.time.Duration;
import java.util.Random;

public class BookManagementTest {

    private WebDriver driver;
    private WebDriverWait wait;
    private final String baseUrl = System.getenv("APP_BASE_URL") != null ? System.getenv("APP_BASE_URL") : "http://localhost:3000";
    private final Random random = new Random();

    @BeforeMethod
    public void setUp() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        driver = new ChromeDriver(options);
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(5));
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    private String generateRandomIsbn() {
        return "SEL-" + (100000 + random.nextInt(900000));
    }

    @Test(priority = 1)
    public void testGetAllBooks() {
        driver.get(baseUrl + "/");
        WebElement table = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='books-table']")));
        Assert.assertNotNull(table, "Books table should be visible on page load.");
    }

    @Test(priority = 2)
    public void testGetInventoryStats() {
        driver.get(baseUrl + "/");
        // Wait for stats to load asynchronously
        wait.until(d -> d.findElement(By.cssSelector("[data-testid='stats-summary']")).getText().toUpperCase().contains("TOTAL BOOKS"));
        WebElement statsSummary = driver.findElement(By.cssSelector("[data-testid='stats-summary']"));
        String statsText = statsSummary.getText().toUpperCase();
        Assert.assertTrue(statsText.contains("TOTAL BOOKS:"), "Stats should show Total Books");
        Assert.assertTrue(statsText.contains("UNIQUE GENRES:"), "Stats should show Unique Genres");
        Assert.assertTrue(statsText.contains("OLDEST BOOK:"), "Stats should show Oldest Book");
        Assert.assertTrue(statsText.contains("NEWEST BOOK:"), "Stats should show Newest Book");
    }

    @Test(priority = 3)
    public void testGetBookById() {
        // Create a book first so we can edit/get it by ID
        driver.get(baseUrl + "/");
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-testid='nav-add']"))).click();

        String isbn = generateRandomIsbn();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='input-title']"))).sendKeys("Selenium GetByID Test");
        driver.findElement(By.cssSelector("[data-testid='input-author']")).sendKeys("QA Bot");
        driver.findElement(By.cssSelector("[data-testid='input-genre']")).sendKeys("Automated");
        driver.findElement(By.cssSelector("[data-testid='input-published-year']")).sendKeys("2026");
        driver.findElement(By.cssSelector("[data-testid='input-isbn']")).sendKeys(isbn);
        driver.findElement(By.cssSelector("[data-testid='btn-submit']")).click();

        // Wait for redirect to home
        wait.until(ExpectedConditions.urlContains("#/books"));

        // Find and click the edit button
        WebElement editBtn = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-testid='edit-btn-" + isbn + "']")));
        editBtn.click();

        // Verify that form got populated
        wait.until(ExpectedConditions.attributeToBe(By.cssSelector("[data-testid='edit-input-title']"), "value", "Selenium GetByID Test"));
        WebElement editTitleField = driver.findElement(By.cssSelector("[data-testid='edit-input-title']"));
        Assert.assertEquals(editTitleField.getAttribute("value"), "Selenium GetByID Test", "Edit form should be populated with the book's title");
    }

    @Test(priority = 4)
    public void testCreateNewBook() {
        driver.get(baseUrl + "/");
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-testid='nav-add']"))).click();

        String isbn = generateRandomIsbn();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='input-title']"))).sendKeys("Selenium Creation Test");
        driver.findElement(By.cssSelector("[data-testid='input-author']")).sendKeys("Selenium Author");
        driver.findElement(By.cssSelector("[data-testid='input-genre']")).sendKeys("Testing");
        driver.findElement(By.cssSelector("[data-testid='input-published-year']")).sendKeys("2024");
        driver.findElement(By.cssSelector("[data-testid='input-isbn']")).sendKeys(isbn);
        driver.findElement(By.cssSelector("[data-testid='btn-submit']")).click();

        // Check for success feedback message
        WebElement feedback = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='feedback-message']")));
        Assert.assertTrue(feedback.getText().contains("successfully") || feedback.getText().contains("Success"), "Feedback message should indicate success");
    }

    @Test(priority = 5)
    public void testUpdateBook() {
        driver.get(baseUrl + "/");
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-testid='nav-add']"))).click();

        String isbn = generateRandomIsbn();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='input-title']"))).sendKeys("Selenium Update Test");
        driver.findElement(By.cssSelector("[data-testid='input-author']")).sendKeys("Author");
        driver.findElement(By.cssSelector("[data-testid='input-genre']")).sendKeys("Genre");
        driver.findElement(By.cssSelector("[data-testid='input-published-year']")).sendKeys("2020");
        driver.findElement(By.cssSelector("[data-testid='input-isbn']")).sendKeys(isbn);
        driver.findElement(By.cssSelector("[data-testid='btn-submit']")).click();

        // Wait for redirect to home
        wait.until(ExpectedConditions.urlContains("#/books"));

        // Click Edit
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-testid='edit-btn-" + isbn + "']"))).click();

        // Wait for form to populate first to avoid race condition on clear()
        wait.until(ExpectedConditions.attributeToBe(By.cssSelector("[data-testid='edit-input-title']"), "value", "Selenium Update Test"));
        WebElement titleInput = driver.findElement(By.cssSelector("[data-testid='edit-input-title']"));
        titleInput.clear();
        titleInput.sendKeys("Selenium Update Test (Updated)");
        driver.findElement(By.cssSelector("[data-testid='edit-btn-submit']")).click();

        // Wait for feedback or redirect to home and verify updated title
        wait.until(ExpectedConditions.urlContains("#/books"));
        WebElement bookRow = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='book-row-" + isbn + "']")));
        Assert.assertTrue(bookRow.getText().contains("Selenium Update Test (Updated)"), "Table should display the updated title");
    }

    @Test(priority = 6)
    public void testDeleteBook() {
        driver.get(baseUrl + "/");
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-testid='nav-add']"))).click();

        String isbn = generateRandomIsbn();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid='input-title']"))).sendKeys("Selenium Delete Test");
        driver.findElement(By.cssSelector("[data-testid='input-author']")).sendKeys("Author");
        driver.findElement(By.cssSelector("[data-testid='input-genre']")).sendKeys("Genre");
        driver.findElement(By.cssSelector("[data-testid='input-published-year']")).sendKeys("2015");
        driver.findElement(By.cssSelector("[data-testid='input-isbn']")).sendKeys(isbn);
        driver.findElement(By.cssSelector("[data-testid='btn-submit']")).click();

        // Wait for redirect to home
        wait.until(ExpectedConditions.urlContains("#/books"));

        // Click delete button
        WebElement deleteBtn = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-testid='delete-btn-" + isbn + "']")));
        deleteBtn.click();

        // Handle confirmation alert
        wait.until(ExpectedConditions.alertIsPresent());
        Alert alert = driver.switchTo().alert();
        alert.accept();

        // Verify the row is removed
        boolean isDeleted = wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("[data-testid='book-row-" + isbn + "']")));
        Assert.assertTrue(isDeleted, "Book row should no longer be visible in the table");
    }
}
