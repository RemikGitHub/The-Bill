describe('Settings tests', () => {
  it('Change language from Polish to English', () => {
    cy.visit('http://localhost:4200/#/');
    cy.get(`#configButton`).click();
    cy.get(`li[aria-label='Polski']`).click();
    cy.get(`div[class='text-900 text-3xl font-medium mb-3']`).should(
      'have.text',
      'Zaloguj się'
    );
  });
});
