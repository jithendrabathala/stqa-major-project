const { defineConfig } = require("cypress");

module.exports = defineConfig({
  fixturesFolder: 'tests/cypress/fixtures',
  screenshotsFolder: 'tests/cypress/screenshots',
  videosFolder: 'tests/cypress/videos',
  downloadsFolder: 'tests/cypress/downloads',
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    specPattern: 'tests/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
});
