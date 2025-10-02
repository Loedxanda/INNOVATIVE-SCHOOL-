import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 2,
      openMode: 0
    },
    env: {
      // Test user credentials
      admin_email: 'admin@school.cm',
      admin_password: 'admin123',
      teacher_email: 'teacher@school.cm',
      teacher_password: 'teacher123',
      student_email: 'student@school.cm',
      student_password: 'student123',
      parent_email: 'parent@school.cm',
      parent_password: 'parent123'
    },
    setupNodeEvents(on, config) {
      // Add custom tasks
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        }
      });

      // Add custom commands
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
        }
        return launchOptions;
      });

      return config;
    }
  },
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack'
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    indexHtmlFile: 'cypress/support/component-index.html'
  }
});

