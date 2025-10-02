/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      createStudent(studentData: any): Chainable<any>;
      createTeacher(teacherData: any): Chainable<any>;
      createClass(classData: any): Chainable<any>;
      markAttendance(attendanceData: any): Chainable<any>;
      addGrade(gradeData: any): Chainable<any>;
      waitForApiResponse(alias: string, timeout?: number): Chainable<void>;
      clearDatabase(): Chainable<void>;
      seedTestData(): Chainable<void>;
    }
  }
}

// Custom login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property('access_token');
    
    // Store token for future requests
    Cypress.env('auth_token', response.body.access_token);
    Cypress.env('user_role', response.body.user.role);
    
    // Set token in localStorage for frontend
    window.localStorage.setItem('auth_token', response.body.access_token);
    window.localStorage.setItem('user_role', response.body.user.role);
  });
});

// Custom logout command
Cypress.Commands.add('logout', () => {
  cy.clearLocalStorage();
  Cypress.env('auth_token', null);
  Cypress.env('user_role', null);
});

// Custom create student command
Cypress.Commands.add('createStudent', (studentData: any) => {
  return cy.request({
    method: 'POST',
    url: '/api/students',
    headers: {
      'Authorization': `Bearer ${Cypress.env('auth_token')}`
    },
    body: studentData
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});

// Custom create teacher command
Cypress.Commands.add('createTeacher', (teacherData: any) => {
  return cy.request({
    method: 'POST',
    url: '/api/teachers',
    headers: {
      'Authorization': `Bearer ${Cypress.env('auth_token')}`
    },
    body: teacherData
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});

// Custom create class command
Cypress.Commands.add('createClass', (classData: any) => {
  return cy.request({
    method: 'POST',
    url: '/api/classes',
    headers: {
      'Authorization': `Bearer ${Cypress.env('auth_token')}`
    },
    body: classData
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});

// Custom mark attendance command
Cypress.Commands.add('markAttendance', (attendanceData: any) => {
  return cy.request({
    method: 'POST',
    url: '/api/attendance',
    headers: {
      'Authorization': `Bearer ${Cypress.env('auth_token')}`
    },
    body: attendanceData
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});

// Custom add grade command
Cypress.Commands.add('addGrade', (gradeData: any) => {
  return cy.request({
    method: 'POST',
    url: '/api/grades',
    headers: {
      'Authorization': `Bearer ${Cypress.env('auth_token')}`
    },
    body: gradeData
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});

// Custom wait for API response command
Cypress.Commands.add('waitForApiResponse', (alias: string, timeout = 10000) => {
  cy.wait(alias, { timeout });
});

// Custom clear database command
Cypress.Commands.add('clearDatabase', () => {
  cy.request({
    method: 'POST',
    url: '/api/admin/clear-database',
    headers: {
      'Authorization': `Bearer ${Cypress.env('auth_token')}`
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
});

// Custom seed test data command
Cypress.Commands.add('seedTestData', () => {
  cy.request({
    method: 'POST',
    url: '/api/admin/seed-test-data',
    headers: {
      'Authorization': `Bearer ${Cypress.env('auth_token')}`
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
});

export {};

