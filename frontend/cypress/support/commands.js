/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// Commande de login :
Cypress.Commands.add('login', (email, password)=>{
    // Accès à la page de connexion
    cy.visit('/#/login')

    // Saisie des identifiants (email et mot de passe) valides
    cy.get('[data-cy="login-input-username"]').type(email)
    cy.get('[data-cy="login-input-password"]').type(password)

    // Soumission du formulaire
    cy.get('[data-cy="login-submit"]').click()

    // On attend que la connexion soit traitée (le bouton doit disparaître ou l'URL changer)
    cy.url().should('not.include', 'login')
})

// Commande d'ajout d'un produit au panier :
Cypress.Commands.add('addProductToCart', (productId, quantity, token) => {
  cy.request({
    method: "PUT",
    url: "http://localhost:8081/orders/add",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      product: productId,
      quantity: quantity,
    },
  }).then((response) => {
    // On s'assure que l'ajout a fonctionné avant de continuer les tests
    expect(response.status).to.eq(200);
  });
});