describe('Reset Password page', () => {
  it('should load the reset password page', () => {
    cy.visit('/reset-password');
    cy.contains('Reset Password').should('be.visible');
  });

  it('should display reset password form elements', () => {
    cy.visit('/reset-password');
    cy.get('input[placeholder="Your password"]').should('be.visible');
    cy.get('input[placeholder="Confirm your new password"]').should('be.visible');
    cy.contains('Reset Password').should('be.visible');
  });

  it('should show password strength indicator', () => {
    cy.visit('/reset-password');
    cy.get('input[placeholder="Your password"]').type('test');
    // Check if password strength bars are visible
    cy.get('.mantine-Progress-root').should('be.visible');
  });

  it('should validate password confirmation', () => {
    cy.visit('/reset-password');
    cy.get('input[placeholder="Your password"]').type('password123');
    cy.get('input[placeholder="Confirm your new password"]').type('differentpassword');
    cy.contains('Passwords do not match').should('be.visible');
  });

  it('should validate password length', () => {
    cy.visit('/reset-password');
    cy.get('input[placeholder="Your password"]').type('123');
    cy.get('input[placeholder="Your password"]').blur();
    cy.contains('Password should include at least 6 characters').should('be.visible');
  });

  it('should enable submit button when form is valid', () => {
    cy.visit('/reset-password');
    cy.get('input[placeholder="Your password"]').type('password123');
    cy.get('input[placeholder="Confirm your new password"]').type('password123');
    cy.contains('Reset Password').should('not.be.disabled');
  });

  it('should disable submit button when passwords do not match', () => {
    cy.visit('/reset-password');
    cy.get('input[placeholder="Your password"]').type('password123');
    cy.get('input[placeholder="Confirm your new password"]').type('different');
    cy.contains('Reset Password').should('be.disabled');
  });
});