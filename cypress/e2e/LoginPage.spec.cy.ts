describe('Login tests', () => {
  it('Try login with wrong email', () => {
    const wrongEmail = 'fake@email';

    cy.visit('http://localhost:4200/#/');
    cy.get(`button[data-provider-id='password']`).click();
    cy.get(`input[type='email']`).type(wrongEmail);
    cy.get(`button[type='submit']`).click();
    cy.get(`div[class='firebaseui-error-wrapper']`).should(
      'have.text',
      "That email address isn't correct"
    );
  });

  it('Try login with empty password', () => {
    const fakeEmail = 'fake@email.com';
    const fakeUsername = 'Fake Username';

    cy.visit('http://localhost:4200/#/');
    cy.get(`button[data-provider-id='password']`).click();
    cy.get(`input[type='email']`).type(fakeEmail);
    cy.get(`button[type='submit']`).click();
    cy.get(`input[name='name']`).type(fakeUsername);
    cy.get(`button[type='submit']`).click();
    cy.get(`div[class='firebaseui-error-wrapper']`).should(
      'have.text',
      'Enter your password'
    );
  });

  it('Try login with weak password', () => {
    const fakeEmail = 'fake@email.com';
    const fakeUsername = 'Fake Username';
    const weakPassword = 'abc';

    cy.visit('http://localhost:4200/#/');
    cy.get(`button[data-provider-id='password']`).click();
    cy.get(`input[type='email']`).type(fakeEmail);
    cy.get(`button[type='submit']`).click();
    cy.get(`input[name='name']`).type(fakeUsername);
    cy.get(`input[type='password']`).type(weakPassword);
    cy.get(`button[type='submit']`).click();
    cy.get(`div[class='firebaseui-error-wrapper']`).should(
      'have.text',
      'Strong passwords have at least 6 characters and a mix of letters and numbers'
    );
  });
});
