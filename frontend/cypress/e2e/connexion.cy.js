// Connexion
describe('Test fonctionnel - Connexion', () => {
    it('should allow a user to log with valid credentials', () => {

        // Accès à la page de connexion
        cy.visit('/#/login')

        // Afficher le formulaire de connexion
        cy.get('[data-cy="login-form"]').should('be.visible')

        // Saisie de l'email
        cy.get('[data-cy="login-input-username"]').should('be.visible').type('test2@test.fr')

        // Saisie du mot de passe
        cy.get('[data-cy="login-input-password"]').should('be.visible').type('testtest')

        // Soumission du formulaire
        cy.get('[data-cy="login-submit"]').click()

        // Vérification de "Mon panier" une fois connecté
        cy.get('[data-cy="nav-link-cart"]').should('be.visible')
    })
})
