describe('Home page', () => {
  it('should load the home page', () => {
    cy.visit('/')
    cy.contains('Base page')
    cy.contains('texte')
  })

  it('should display the area logo', () => {
    cy.visit('/')
    cy.get('img[alt="area logo"]').should('be.visible')
  })

  it('should have the base button', () => {
    cy.visit('/')
    cy.contains('Base button').should('be.visible')
  })
})