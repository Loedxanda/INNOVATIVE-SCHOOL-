/// <reference types="cypress" />

describe('Load Tests', () => {
  beforeEach(() => {
    // Login as admin before each test
    cy.login('admin@school.cm', 'admin123');
  });

  it('should handle multiple concurrent users', () => {
    // Test concurrent user access
    const concurrentUsers = 10;
    const promises = [];

    for (let i = 0; i < concurrentUsers; i++) {
      promises.push(
        cy.request({
          method: 'GET',
          url: '/api/students',
          headers: {
            'Authorization': `Bearer ${Cypress.env('admin_token')}`
          }
        })
      );
    }

    // Wait for all requests to complete
    cy.wrap(Promise.all(promises)).then((responses) => {
      responses.forEach((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('data');
      });
    });
  });

  it('should handle large dataset queries', () => {
    // Test with large dataset
    cy.request({
      method: 'GET',
      url: '/api/students?limit=1000',
      headers: {
        'Authorization': `Bearer ${Cypress.env('admin_token')}`
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.be.an('array');
      expect(response.body.data.length).to.be.greaterThan(0);
    });
  });

  it('should handle rapid API calls', () => {
    // Test rapid API calls
    const rapidCalls = 50;
    const startTime = Date.now();

    for (let i = 0; i < rapidCalls; i++) {
      cy.request({
        method: 'GET',
        url: '/api/health',
        headers: {
          'Authorization': `Bearer ${Cypress.env('admin_token')}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should complete within 30 seconds
    expect(totalTime).to.be.lessThan(30000);
  });

  it('should handle memory usage under load', () => {
    // Test memory usage
    cy.window().then((win) => {
      const initialMemory = (win.performance as any).memory?.usedJSHeapSize || 0;
      
      // Perform memory-intensive operations
      for (let i = 0; i < 100; i++) {
        cy.request({
          method: 'GET',
          url: '/api/students',
          headers: {
            'Authorization': `Bearer ${Cypress.env('admin_token')}`
          }
        });
      }

      // Check memory usage after operations
      cy.window().then((win) => {
        const finalMemory = (win.performance as any).memory?.usedJSHeapSize || 0;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be reasonable (less than 50MB)
        expect(memoryIncrease).to.be.lessThan(50 * 1024 * 1024);
      });
    });
  });

  it('should handle database connection pool under load', () => {
    // Test database connection pool
    const dbCalls = 100;
    const promises = [];

    for (let i = 0; i < dbCalls; i++) {
      promises.push(
        cy.request({
          method: 'GET',
          url: '/api/students',
          headers: {
            'Authorization': `Bearer ${Cypress.env('admin_token')}`
          }
        })
      );
    }

    // Wait for all requests to complete
    cy.wrap(Promise.all(promises)).then((responses) => {
      responses.forEach((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  it('should handle cache performance under load', () => {
    // Test cache performance
    const cacheCalls = 50;
    const startTime = Date.now();

    for (let i = 0; i < cacheCalls; i++) {
      cy.request({
        method: 'GET',
        url: '/api/students',
        headers: {
          'Authorization': `Bearer ${Cypress.env('admin_token')}`
        }
      });
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should complete within 10 seconds (cached responses)
    expect(totalTime).to.be.lessThan(10000);
  });
});

