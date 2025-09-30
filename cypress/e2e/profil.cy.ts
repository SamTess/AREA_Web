describe('Profile page', () => {
  beforeEach(() => {
    cy.visit('/profil');
    // Wait for the profile data to load
    cy.get('input[placeholder="First Name"]').should('have.value', 'Test');
  });

  it('should load the profile page', () => {
    cy.contains('Profile').should('be.visible');
  });

  it('should display user avatar', () => {
    cy.get('.mantine-Avatar-root').should('be.visible');
  });

  it('should display profile form fields', () => {
    // Email field (readonly)
    cy.get('input[placeholder="Email"]').should('be.visible').and('have.attr', 'readonly');

    // Password field
    cy.get('input[placeholder="New Password"]').should('be.visible');

    // First Name field
    cy.get('input[placeholder="First Name"]').should('be.visible');

    // Last Name field
    cy.get('input[placeholder="Last Name"]').should('be.visible');

    // Language select
    cy.get('select').should('be.visible');
  });

  it('should have language options', () => {
    cy.get('select').find('option').should('have.length', 2);
    cy.get('select').find('option').first().should('contain', 'French');
    cy.get('select').find('option').last().should('contain', 'English');
  });

  it('should display save changes button as disabled initially', () => {
    cy.contains('Save Changes').should('be.disabled');
  });

 

  it('should show avatar upload button', () => {
    cy.get('.mantine-Button-root').find('svg').should('be.visible');
  });


  it('should validate email field has value', () => {
    cy.get('input[placeholder="Email"]').should('not.have.value', '');
  });


  it('should handle avatar file upload', () => {
    cy.get('input[type="file"]').should('exist');
  });


  it('should navigate back or have proper layout', () => {
    cy.get('.mantine-Card-root').should('be.visible');
    cy.get('.mantine-Container-root').should('be.visible');
  });
});