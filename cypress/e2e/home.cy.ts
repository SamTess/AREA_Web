describe('Home page', () => {
  it('should load the home page', () => {
    cy.visit('/');
    cy.contains('Welcome to AREA').should('be.visible');
  });

  it('should display the hero banner with description and button', () => {
    cy.visit('/');
    cy.contains('Automate your tasks with custom applets').should('be.visible');
    cy.contains('Get Started').should('be.visible');
  });

  it('should display the features cards', () => {
    cy.visit('/');
    cy.contains('Automate your tasks').should('be.visible');
    cy.contains('Privacy first').should('be.visible');
    cy.contains('Seamless integration').should('be.visible');
  });
});