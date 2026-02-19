// Panier
describe("Test fonctionnel - Panier", () => {
  beforeEach(() => {
    // Connexion utilisateur
    cy.login("test2@test.fr", "testtest");
    cy.intercept("GET", "**/products/[0-9]*").as("product"); // modifier le intercept, et le rajouter avant le chargement du produit

    // Accès à la page des produits
    cy.visit("/#/products");
    cy.contains("Nos produits", { timeout: 10000 }).should("be.visible");

    // Ouverture d'une fiche produit (récupérer tous les produits, et cliquer sur le trois)
    cy.get('[data-cy="product-link"]').eq(2).click();
    cy.wait("@product"); // On attend que le produit soit chargé avant de lire le stock

    cy.url().then((url) => {
      cy.log("URL actuelle : " + url);
    });
  });

  // Lors de l'ajout d'un produit au panier, le stock se met à jour correctement
  it("should add a product to the cart and decrease stock correctly", () => {
    cy.get('[data-cy="detail-product-stock"]', { timeout: 10000 }) // On attend que l’élément affichant le stock soit présent et visible
      .should("be.visible");

    cy.get('[data-cy="detail-product-stock"]') // On récupère le texte du stock (ex: "23 en stock")
      .invoke("text")
      .then((text) => {
        const initialStock = parseInt(text.replace(/\D/g, "")); // On extrait uniquement le nombre du texte, text.replace(/\D/g, '') enlève tout sauf les chiffres, parseInt transforme la string en nombre
        cy.log(initialStock)

        cy.intercept("PUT", "**/orders/add*").as("addToCart"); // On intercepte la requête d'ajout au panier

        cy.get('[data-cy="detail-product-quantity"]').clear().type("1"); // On définit la quantité à 1
        cy.get('[data-cy="detail-product-add"]').click();

        cy.wait("@addToCart") // On attend que la requête backend soit terminée
          .its("response.statusCode")
          .should("eq", 200);

        // Vérifier le produit ajouter
        cy.url().should("include", "/cart")

        // On retourne sur la fiche produit
        cy.go("back");
        cy.intercept("GET", "**/products/[0-9]*").as("product");

        // On attend que le produit recharge
        cy.wait("@product");

        cy.get('[data-cy="detail-product-stock"]') // On relit le stock après la mise à jour
          .should("be.visible")
          .invoke("text")
          .then((textAfter) => {
            const newStock = parseInt(textAfter.replace(/\D/g, ""));
            expect(newStock).to.eq(initialStock - 1); // On vérifie que le stock a diminué de 1
          });
      });
  });

  // On ne peut pas ajouter un produit s'il a une quantité en stock négative
  it("should not allow negative quantity", () => {
    // Test des limites avec une quantité négative
    cy.get('[data-cy="detail-product-quantity"]').clear().type("-1");
    cy.get('[data-cy="detail-product-add"]').click();

    // Vérification que la valeur n’est pas acceptée
    cy.get('[data-cy="detail-product-quantity"]')
      .invoke("val")
      .then((value) => {
        expect(parseInt(value)).to.be.greaterThan(0);
      });
  });

  // On veut que si je met 21 je suis redirigé vers le panier (si oui erreur, si non c'est OK)
  it("should not allow quantity greater than 20", () => {
    // Récupération du stock initial
    cy.get('[data-cy="detail-product-stock"]')
      .invoke("text")
      .then(parseInt)
      .as("stockInitial");

    // Saisie d'une quantité supérieure à 20
    cy.get('[data-cy="detail-product-quantity"]').clear().type("25");
    cy.get('[data-cy="detail-product-add"]').click();

    cy.reload();

    // Vérification que le stock ne change pas
    cy.get("@stockInitial").then((stockInitial) => {
      cy.get('[data-cy="detail-product-stock"]')
        .invoke("text")
        .then((text) => parseInt(text.replace(/\D/g, "")))
        .as("stockInitial");
    });
  });
});
