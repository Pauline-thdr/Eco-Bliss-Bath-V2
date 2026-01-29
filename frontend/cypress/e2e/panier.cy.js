// Panier
describe('Test fonctionnel - Panier', () => {
    it('should allow a user to add a product to the cart and manage quantities correctly', () => {

        // Connexion utilisateur (on utilise la commande créée dans commands.js)
        cy.login('test2@test.fr', 'testtest')

        // Accès à la page des produits
        cy.visit('/#/products')
        cy.contains('Nos produits', { timeout: 10000 }).should('be.visible')

        // Ouverture d'une fiche produit
        cy.get('[data-cy="product-link"]').first().click()

        // Vérification de la présence des éléments important de la fiche produit
        cy.get('[data-cy="detail-product-price"]').should('be.visible')
        cy.get('[data-cy="detail-rpoduct-stock"]').should('be.visible')
        cy.get('[data-cy="detail-product-quantity"]').should('be.visible')
        cy.get('[data-cy="detail-product-add"]').should('be.visible')

        // Stock initial (supérieur à 1 pour pouvoir être ajouté) utiliser méthode intercept -> stop toi le temps de la requête (se renseigner dessus)


        // Ajout d'un produit au panier


        // Vérification de l'ajout du produit au panier (ai-je bien le produit A ajouté précédemment)


        // On retourne sur la page produit ajouté (pour comparer le stock initial et le stock après ajout)


        // Diminution du stock après ajout


        // Tests indépendants donc faire des "It" différents :
        // Test des limites avec une quantité négative


        // Test des limites avec une quantité supérieur à 20


        //Vérification du contenu du panier via l'API

    })
})