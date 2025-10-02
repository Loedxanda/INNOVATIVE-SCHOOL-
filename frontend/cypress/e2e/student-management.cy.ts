describe('Student Management', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'admin@example.com',
        full_name: 'Admin User',
        role: 'admin',
      }));
    });

    // Mock API responses
    cy.intercept('GET', '/students/*', {
      statusCode: 200,
      body: [
        {
          id: 1,
          student_id: 'STU001',
          user: {
            full_name: 'John Doe',
            email: 'john@example.com',
          },
          date_of_birth: '2010-01-01',
          gender: 'male',
          address: '123 Main St',
          phone_number: '+237123456789',
          emergency_contact: 'Jane Doe',
          emergency_phone: '+237987654321',
          enrollment_date: '2023-09-01',
        },
      ],
    }).as('getStudents');

    cy.visit('/admin/students');
  });

  it('should display student management page', () => {
    cy.get('h1').should('contain', 'Student Management');
    cy.get('[data-testid="student-list"]').should('be.visible');
  });

  it('should display students list', () => {
    cy.wait('@getStudents');
    cy.get('[data-testid="student-list"]').should('contain', 'John Doe');
    cy.get('[data-testid="student-list"]').should('contain', 'STU001');
  });

  it('should open add student form', () => {
    cy.get('button').contains('Add Student').click();
    cy.get('[data-testid="student-form"]').should('be.visible');
    cy.get('h2').should('contain', 'Add Student');
  });

  it('should add a new student', () => {
    cy.intercept('POST', '/students/', {
      statusCode: 200,
      body: {
        id: 2,
        student_id: 'STU002',
        user: {
          full_name: 'Jane Smith',
          email: 'jane@example.com',
        },
        date_of_birth: '2010-02-01',
        gender: 'female',
        address: '456 Oak St',
        phone_number: '+237123456789',
        emergency_contact: 'John Smith',
        emergency_phone: '+237987654321',
        enrollment_date: '2023-09-01',
      },
    }).as('createStudent');

    cy.get('button').contains('Add Student').click();
    
    cy.get('input[name="full_name"]').type('Jane Smith');
    cy.get('input[name="student_id"]').type('STU002');
    cy.get('input[name="email"]').type('jane@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="date_of_birth"]').type('2010-02-01');
    cy.get('select[name="gender"]').select('female');
    cy.get('input[name="address"]').type('456 Oak St');
    cy.get('input[name="phone_number"]').type('+237123456789');
    cy.get('input[name="emergency_contact"]').type('John Smith');
    cy.get('input[name="emergency_phone"]').type('+237987654321');
    cy.get('input[name="enrollment_date"]').type('2023-09-01');
    
    cy.get('button[type="submit"]').click();
    
    cy.wait('@createStudent');
    cy.get('[data-testid="student-form"]').should('not.exist');
  });

  it('should edit an existing student', () => {
    cy.intercept('PATCH', '/students/1', {
      statusCode: 200,
      body: {
        id: 1,
        student_id: 'STU001',
        user: {
          full_name: 'John Updated',
          email: 'john@example.com',
        },
        date_of_birth: '2010-01-01',
        gender: 'male',
        address: '123 Main St',
        phone_number: '+237123456789',
        emergency_contact: 'Jane Doe',
        emergency_phone: '+237987654321',
        enrollment_date: '2023-09-01',
      },
    }).as('updateStudent');

    cy.get('[data-testid="edit-button"]').first().click();
    cy.get('[data-testid="student-form"]').should('be.visible');
    
    cy.get('input[name="full_name"]').clear().type('John Updated');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@updateStudent');
    cy.get('[data-testid="student-form"]').should('not.exist');
  });

  it('should delete a student', () => {
    cy.intercept('DELETE', '/students/1', {
      statusCode: 200,
      body: { message: 'Student deleted successfully' },
    }).as('deleteStudent');

    cy.get('[data-testid="delete-button"]').first().click();
    cy.get('[data-testid="confirm-dialog"]').should('be.visible');
    cy.get('button').contains('Confirm').click();
    
    cy.wait('@deleteStudent');
  });

  it('should search students', () => {
    cy.get('input[placeholder*="Search"]').type('John');
    cy.get('[data-testid="student-list"]').should('contain', 'John Doe');
  });

  it('should filter students by gender', () => {
    cy.get('select[name="genderFilter"]').select('male');
    cy.get('[data-testid="student-list"]').should('contain', 'John Doe');
  });
});

