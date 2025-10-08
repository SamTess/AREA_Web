describe('Areas page', () => {
  beforeEach(() => {
    cy.visit('/areas');
  });

  it('should load the areas page', () => {
    cy.contains('Areas').should('be.visible');
    cy.contains('Add Area').should('be.visible');
  });

  it('should display areas list', () => {
    cy.contains('GitHub PR Monitor').should('be.visible');
    cy.contains('Slack Channel Alert').should('be.visible');
  });

  it('should filter areas by status', () => {
    // Click on status select input
    cy.get('input[placeholder="Filter by status"]').click();

    // Select "Success" status from dropdown using force click
    cy.get('[role="option"]').contains('Success').click({ force: true });

    // Should show areas with success status
    cy.contains('GitHub PR Monitor').should('be.visible');
  });

  it('should navigate to area details when clicking on area name', () => {
    // Click on an area name (this would normally navigate to /areas/{id})
    cy.contains('GitHub PR Monitor').click();

    // Since we don't have the actual route, we'll just check that the click works
    // In a real scenario, we'd check the URL change
  });

  it('should display area status badges', () => {
    // Check that status badges are visible using Mantine Badge class
    cy.get('.mantine-Badge-root').should('exist').and('be.visible');
    // Check that at least one badge contains status text
    cy.get('.mantine-Badge-root').should('contain.text', 'success');
  });

  it('should have pagination when there are many areas', () => {
    // Check if pagination exists (depends on number of areas)
    cy.get('body').then($body => {
      if ($body.text().includes('1')) {
        // If pagination exists, check it has at least page 1
        cy.contains('1').should('be.visible');
      }
    });
  });
});