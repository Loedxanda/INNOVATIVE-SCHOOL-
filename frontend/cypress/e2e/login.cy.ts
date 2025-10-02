describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('h1').should('contain', 'Login');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Login');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.get('input[type="email"]').should('have.attr', 'aria-invalid', 'true');
    cy.get('input[type="password"]').should('have.attr', 'aria-invalid', 'true');
  });

  it('should show validation error for invalid email', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.get('input[type="email"]').should('have.attr', 'aria-invalid', 'true');
  });

  it('should attempt login with valid credentials', () => {
    cy.intercept('POST', '/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'mock-token',
        token_type: 'bearer',
        user: {
          id: 1,
          email: 'admin@example.com',
          full_name: 'Admin User',
          role: 'admin',
        },
      },
    }).as('loginRequest');

    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/admin');
  });

  it('should show error message for invalid credentials', () => {
    cy.intercept('POST', '/auth/login', {
      statusCode: 401,
      body: {
        detail: 'Incorrect email or password',
      },
    }).as('loginError');

    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginError');
    cy.get('[role="alert"]').should('contain', 'Incorrect email or password');
  });

  it('should navigate to register page', () => {
    cy.get('a[href="/register"]').click();
    cy.url().should('include', '/register');
  });
});

