// Smoke test 1 – Page de connexion :
describe('Smoke tests - Connexion', () => {
  it('should display login form elements', () => {
    // Accès à la page de connexion
    cy.visit('/#/login')

    // Vérification de la présence des champs (email et mot de passe) et du bouton de connexion
    cy.get('[data-cy="login-input-username"]').should('be.visible')
    cy.get('[data-cy="login-input-password"]').should('be.visible')
    cy.get('[data-cy="login-submit"]').should('be.visible')
  })
})

// Smoke test 2 – Bouton “Ajouter au panier”
describe('Smoke tests - Ajout au panier', () => {
  it('should display add to cart button when user is logged in', () => {
    // Accès à la page de connexion
    cy.visit('/#/login')

    // Saisie des identifiants (email et mot de passe) valides
    cy.get('[data-cy="login-input-username"]').type('test2@test.fr')
    cy.get('[data-cy="login-input-password"]').type('testtest')

    // Soumission du formulaire
    cy.get('[data-cy="login-submit"]').click()

    // On attend que la connexion soit traitée (le bouton doit disparaître ou l'URL changer)
    cy.url().should('not.include', 'login')

    // Navigation vers la page des produits
    cy.visit('/#/products')

    // On attend que le titre "Nos produits" soit visible pour être sûr d'être au bon endroit (asynchronisation)
    cy.contains('Nos produits', { timeout: 10000 }).should('be.visible')

    // On cherche l'élément qui contient "Nos produits" ou une carte produit et on force cypress à attendre l'affichage des produits
    cy.get('[data-cy="product"]', { timeout: 10000 }).should('be.visible')

    // Ouverture de la fiche d’un produit
    cy.get('[data-cy="product-link"]').first().click()

    // Vérification de la présence du bouton "Ajouter au panier"
    cy.get('[data-cy="detail-product-add"]').should('be.visible')
  })
})
