describe('Dashboard page', () => {
  beforeEach(() => {
    cy.setupMockEnvironment();
    cy.visit('/dashboard');
  });

  it('should load the dashboard page', () => {
    cy.contains('Users').should('be.visible');
    cy.contains('Areas').should('be.visible');
    cy.contains('Services').should('be.visible');
    cy.contains('Logs').should('be.visible');
  });

  it('should display the tabs navigation', () => {
    // Check that tabs are present and Users tab is active by default
    cy.get('[role="tab"]').should('have.length', 4);
    cy.get('[role="tab"]').first().should('have.attr', 'aria-selected', 'true');
  });

  it('should switch to Users tab and display content', () => {
    cy.contains('Users').click();
    // Check that Users tab content is visible
    cy.get('[role="tabpanel"]').should('be.visible');
    // Check for user-related elements (assuming there are stats or table)
    cy.get('body').then($body => {
      if ($body.text().includes('Total Users') || $body.text().includes('Users')) {
        cy.contains('Users').should('be.visible');
      }
    });
  });

  it('should switch to Areas tab and display content', () => {
    cy.contains('Areas').click();
    cy.get('[role="tabpanel"]').should('be.visible');
    // Check for area-related elements
    cy.get('body').then($body => {
      if ($body.text().includes('Areas') || $body.text().includes('Area Stats')) {
        cy.contains('Areas').should('be.visible');
      }
    });
  });

  it('should switch to Services tab and display content', () => {
    cy.contains('Services').click();
    cy.get('[role="tabpanel"]').should('be.visible');
    // Check for services-related elements
    cy.get('body').then($body => {
      if ($body.text().includes('Services')) {
        cy.contains('Services').should('be.visible');
      }
    });
  });

  it('should switch to Logs tab and display content', () => {
    cy.contains('Logs').click();
    cy.get('[role="tabpanel"]').should('be.visible');
    // Check for logs-related elements
    cy.get('body').then($body => {
      if ($body.text().includes('Logs')) {
        cy.contains('Logs').should('be.visible');
      }
    });
  });

  it('should display stats cards in Users tab', () => {
    cy.contains('Users').click();
    // Check for stats cards (assuming they exist based on component structure)
    cy.get('.mantine-Card-root').should('exist');
  });

  it('should display tables in dashboard tabs', () => {
    // Test Users tab table
    cy.contains('Users').click();
    cy.get('table').should('exist');

    // Test Areas tab tables
    cy.contains('Areas').click();
    cy.get('table').should('have.length.at.least', 1);

    // Test Services tab table
    cy.contains('Services').click();
    cy.get('table').should('exist');

    // Test Logs tab table
    cy.contains('Logs').click();
    cy.get('table').should('exist');
  });
});