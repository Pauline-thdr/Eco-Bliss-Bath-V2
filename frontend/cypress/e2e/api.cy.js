// Tests API
import { faker } from "@faker-js/faker"; // pour générer des données aléatoires

describe("Tests API", () => {
  const apiUrl = "http://localhost:8081";
  let token; // Variable globale qui stock le token JWT, il est récupéré après authentification

  // ---------------------------
  // Authentification (Récupération du token)
  // ---------------------------

  before(() => {
    // Login utilisateur connu (nécessaire pour les autres tests et récupéré le token valide, permet d'accéder aux autres routes protégées)
    cy.request({
      method: "POST",
      url: `http://localhost:8081/login`,
      body: {
        username: "test2@test.fr",
        password: "testtest",
      },
    }).then((response) => {
      expect(response.status).to.eq(200); // Vérifie que l'authentification fonctionne
      expect(response.body).to.have.property("token"); // Vérifie que l'API retourne bien un token JWT
      token = response.body.token; // Stock le token pour les prochains tests
    });
  });

  // ---------------------------
  // GET
  // ---------------------------

  // Données confidentielles d'un utilisateur avant connexion
  it("GET /orders sans authentification → 401", () => {
    cy.request({
      method: "GET",
      url: `http://localhost:8081/orders`,
      failOnStatusCode: false, // obligatoire sinon Cypress échoue avant l'assert
    }).then((response) => {
      expect(response.status).to.eq(401); // Vérifie que l’API protège correctement l’accès
    });
  });

  // Liste des produits du panier
  it("GET /orders avec authentification → 200 + produit ajouté est le bon", () => {
    // On utilise un objet pour pouvoir comparer l'envoi et la réception facilement
    const itemToAdd = {
      product: 3,
      quantity: 1,
    };

    // On ajoute le produit au panier (via la commande créée)
    cy.addProductToCart(itemToAdd.product, itemToAdd.quantity, token);

    // On récupère le panier pour valider le contenu
    cy.request({
      method: "GET",
      url: "http://localhost:8081/orders",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((getResponse) => {
      expect(getResponse.status).to.eq(200);

      // On vérifie l'ID du produit à l'intérieur de l'objet product
      const foundItem = getResponse.body.orderLines.find(
        (line) => line.product.id === itemToAdd.product,
      );

      expect(foundItem).to.exist; // On vérifie que le produit est présent

      // On utilise .at.least au cas où le test est rejoué plusieurs fois sans vider le panier
      expect(foundItem.quantity).to.be.at.least(itemToAdd.quantity); // On vérifie que la quantité est bien celle envoyée
    });
  });

  // Fiche produit spécifique
  it("GET /products/:id → retourne une fiche produit", () => {
    cy.request({
      method: "GET",
      url: `http://localhost:8081/products/5`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("id");
      expect(response.body).to.have.property("name");
      expect(response.body).to.have.property("availableStock"); // Vérifie les trois propriétés essentielles du produit
    });
  });

  // ---------------------------
  // POST
  // ---------------------------

  // Login utilisateur inconnu
  it("POST login utilisateur inconnu → 401", () => {
    const fakeEmail = faker.internet.email();
    const fakePassword = faker.internet.password(); // Génère des données aléatoires

    cy.request({
      method: "POST",
      url: `http://localhost:8081/login`,
      failOnStatusCode: false,
      body: {
        username: fakeEmail,
        password: fakePassword,
      },
    }).then((response) => {
      expect(response.status).to.eq(401); // On s'attend à une erreur d'authentification vu que les données sont invalides
    });
  });

  // Login utilisateur connu
  it("POST login utilisateur connu → 200 + token", () => {
    cy.request({
      method: "POST",
      url: `http://localhost:8081/login`,
      body: {
        username: "test2@test.fr",
        password: "testtest",
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("token");

      token = response.body.token; // Mise à jour du token si besoin
    });
  });

  // Ajout d'un produit disponible au panier (faire une commande de ce test pour l'appeler aussi en GET)
  it("POST /orders/add produit disponible → 200", () => {
    cy.request({
      method: "PUT",
      url: `http://localhost:8081/orders/add`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        product: 5, // ID d'un produit en stock
        quantity: 1,
      },
    }).then((response) => {
      expect(response.status).to.eq(200); // On s'attend à ce que l'ajout soit accepté
    });
  });

  // Ajout d'un produit en rupture de stock
  it("POST /orders/add produit en rupture → 400", () => {
    cy.request({
      method: "PUT",
      url: `http://localhost:8081/orders/add`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
      body: {
        product: 3, // ID d'un produit en rupture de stock
        quantity: 1,
      },
    }).then((response) => {
      expect(response.status).to.be.oneOf([400, 409]); // On s'attend à ce que l'ajout ne soit pas accepté
    });
  });

  // Ajout d'un avis
  it("POST /reviews → ajout et vérification immédiate", () => {
    const reviewData = {
      title: "Super produit",
      comment: "Très bon produit",
      rating: 4,
    };

    cy.request({
      method: "POST",
      url: `http://localhost:8081/reviews`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: reviewData,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.comment).to.eq(reviewData.comment); // On vérifie que le commentaire renvoyé est identique à celui envoyé
      expect(response.body.title).to.eq(reviewData.title); // On vérifie que le champs title est identique à celui envoyé
      expect(response.body.rating).to.eq(reviewData.rating); // On vérifie que le champs rating est identique à celui envoyé
    });
  });

  // ---------------------------
  // Test API XSS
  // ---------------------------
  it("POST /reviews → test faille XSS dans l'espace commentaire", () => {
    const xssPayload = '<script>alert("XSS")</script>';

    cy.request({
      method: "POST",
      url: `http://localhost:8081/reviews`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
      body: {
        title: "Test XSS",
        comment: xssPayload,
        rating: 5,
      },
    }).then((response) => {
      expect([200, 201, 400]).to.include(response.status); // L'API peut soit refuser (400), soit accepter mais nettoyer le contenu

      if (response.status === 200 || response.status === 201) {
        expect(response.body.comment).to.not.include("<script>"); // Vérifie si le script est renvoyé tel quel
      }
    });
  });
});
