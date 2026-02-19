//Tests API
import { faker } from '@faker-js/faker'

describe('Tests API', () => {

  const apiUrl = 'http://localhost:8081'
  let token



// GET 

// Données confidentielles d'un utilisateur avant connexion


// Liste des produits du le panier


// Fiche produit spécifique



// POST 

// Login utilisateur inconnu
it("POST login utilisateur inconnu → 401", () => {

    const fakeEmail = faker.internet.email()
    const fakePassword = faker.internet.password()

    cy.request({
      method: 'POST',
      url: `http://localhost:8081/#/login`,
      failOnStatusCode: false,
      body: {
        email: fakeEmail,
        password: fakePassword
      }
    }).then((response) => {
      expect(response.status).to.eq(401)
    })
  })

// Login utilisateur connu
it("POST login utilisateur connu → 200 + token", () => {
    cy.request({
      method: 'POST',
      url: `http://localhost:8081/#/login`,
      body: {
        email: "test@test.com",
        password: "testtest"
      }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('token')

      token = response.body.token
    })
  })

// Ajout d'un produit disponible au panier 


// Ajout d'un produit en rupture de stock


// Ajout d'un avis



})