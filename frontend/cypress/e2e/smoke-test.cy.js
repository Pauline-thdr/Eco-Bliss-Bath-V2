// Smoke test 1 – Page de connexion :
describe("Smoke tests - Connexion", () => {
  it("should display login form elements", () => {
    // Accès à la page de connexion
    cy.visit("/#/login");

    // Vérification de la présence des champs (email et mot de passe) et du bouton de connexion
    cy.get('[data-cy="login-input-username"]').should("be.visible");
    cy.get('[data-cy="login-input-password"]').should("be.visible");
    cy.get('[data-cy="login-submit"]').should("be.visible");
  });
});

// Smoke test 2 – Bouton “Ajouter au panier”
describe("Smoke tests - Ajout au panier", () => {
  it("should display add to cart button when user is logged in", () => {
    // Connexion utilisateur (commande créée)
    cy.login("test2@test.fr", "testtest");

    // Navigation vers la page des produits
    cy.visit("/#/products");

    // On attend que le titre "Nos produits" soit visible pour être sûr d'être au bon endroit (gérer l'asynchronisme)
    cy.contains("Nos produits", { timeout: 10000 }).should("be.visible");

    // On cherche l'élément qui contient "Nos produits" ou une carte produit et on force cypress à attendre l'affichage des produits
    cy.get('[data-cy="product"]', { timeout: 10000 }).should("be.visible");

    // Ouverture de la fiche d’un produit
    cy.get('[data-cy="product-link"]').first().click();

    // Vérification de la présence du bouton "Ajouter au panier"
    cy.get('[data-cy="detail-product-add"]').should("be.visible");
  });
});

// Test faille XSS
it("should not contain XSS vulnerability in review form", () => {
  // Connexion utilisateur
  cy.visit("http://localhost:4200/login");

  cy.get('[data-cy="login-username"]').type("test@test.fr");
  cy.get('[data-cy="login-password"]').type("testtest");
  cy.get('[data-cy="login-submit"]').click();

  // Accès à une fiche produit
  cy.visit("http://localhost:4200/products/1");

  // Interception d’une éventuelle alerte JS
  cy.on("window:alert", () => {
    throw new Error("Une fenêtre d'alerte XSS s'est affichée !");
  });

  // Injection XSS dans le champ commentaire
  cy.get('[data-cy="review-comment"]').type('<script>alert("XSS");</script>');

  // Notation
  cy.get('[data-cy="review-rating"]').select("5");

  // Envoi du formulaire
  cy.get('[data-cy="review-submit"]').click();

  // Vérification que l’avis est affiché
  cy.get('[data-cy="review-list"]').should("be.visible");

  // Vérifie que le script n’est PAS interprété
  cy.contains('<script>alert("XSS");</script>').should("exist");
});
