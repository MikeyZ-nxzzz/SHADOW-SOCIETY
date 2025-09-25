// =============================================
// GESTIONNAIRE D'ÉTAT DE L'APPLICATION
// =============================================

class AppState {
    constructor() {
        this.currentUser = null;
        this.cart = [];
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.paymentInfo = JSON.parse(localStorage.getItem('paymentInfo')) || this.getDefaultPaymentInfo();
    }

    getDefaultPaymentInfo() {
        return {
            moncash: {
                name: "Marcco Bien Aimé",
                number: "+50939442808"
            },
            natcash: {
                name: "Pierre Louis Jinolyse",
                number: "+50939442808"
            }
        };
    }

    // Compte administrateur
    get adminAccount() {
        return {
            email: "shadowsociety.ht@gmail.com",
            password: "Gantt123@"
        };
    }

    saveToStorage() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
        localStorage.setItem('orders', JSON.stringify(this.orders));
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('paymentInfo', JSON.stringify(this.paymentInfo));
    }

    clearStorage() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
    }
}

// =============================================
// GESTIONNAIRE D'AUTHENTIFICATION
// =============================================

class AuthManager {
    constructor(appState) {
        this.appState = appState;
    }

    initAuthEvents() {
        // Événements pour les formulaires d'authentification
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.loginUser();
        });

        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerUser();
        });

        document.getElementById('logout-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.logoutUser();
        });
    }

    showRegisterForm() {
        document.getElementById('login-form').parentElement.style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    }

    showLoginForm() {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').parentElement.style.display = 'block';
    }

    loginUser() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // Validation basique
        if (!this.validateEmail(email)) {
            this.showMessage('Veuillez entrer un email valide', 'error');
            return;
        }

        // Vérifier si c'est le compte admin
        if (email === this.appState.adminAccount.email && password === this.appState.adminAccount.password) {
            this.appState.currentUser = { 
                email, 
                name: "Administrateur",
                isAdmin: true 
            };
            this.appState.saveToStorage();
            this.onAuthSuccess();
            return;
        }

        // Vérifier les utilisateurs enregistrés
        const user = this.appState.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.appState.currentUser = user;
            this.appState.saveToStorage();
            this.onAuthSuccess();
        } else {
            this.showMessage('Email ou mot de passe incorrect', 'error');
        }
    }

    registerUser() {
        const email = document.getElementById('register-email').value;
        const name = document.getElementById('register-name').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;

        // Validation
        if (!this.validateEmail(email)) {
            this.showMessage('Veuillez entrer un email valide', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
            return;
        }

        if (password !== confirm) {
            this.showMessage('Les mots de passe ne correspondent pas', 'error');
            return;
        }

        // Vérifier si l'utilisateur existe déjà
        if (this.appState.users.find(u => u.email === email)) {
            this.showMessage('Un compte avec cet email existe déjà', 'error');
            return;
        }

        // Ajouter le nouvel utilisateur
        const newUser = { email, name, phone, password };
        this.appState.users.push(newUser);
        this.appState.currentUser = newUser;
        this.appState.saveToStorage();

        this.showMessage('Inscription réussie! Vous êtes maintenant connecté.', 'success');
        this.onAuthSuccess();
    }

    logoutUser() {
        this.appState.clearStorage();
        this.showPage('auth');
        this.showMessage('Vous avez été déconnecté avec succès', 'success');
    }

    onAuthSuccess() {
        this.showPage('home');
        this.updateNavigation();
        this.showMessage('Connexion réussie!', 'success');
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showMessage(message, type) {
        // Créer un élément de message temporaire
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        // Insérer au début du container
        const container = document.querySelector('.container');
        container.insertBefore(messageEl, container.firstChild);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    showPage(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(page + '-page').classList.add('active');
    }

    updateNavigation() {
        const adminLink = document.getElementById('admin-link');
        if (this.appState.currentUser && this.appState.currentUser.isAdmin) {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    }
}

// =============================================
// GESTIONNAIRE DE PAGES ET NAVIGATION
// =============================================

class PageManager {
    constructor(appState, authManager) {
        this.appState = appState;
        this.authManager = authManager;
    }

    initNavigation() {
        // Événements pour le menu mobile
        document.querySelector('.menu-toggle').addEventListener('click', () => {
            document.querySelector('nav ul').classList.toggle('show');
        });

        // Événements pour la navigation
        document.querySelectorAll('nav a[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.showPage(page);
                document.querySelector('nav ul').classList.remove('show');
            });
        });

        // Fermer le menu mobile en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (!e.target.closest('nav') && !e.target.closest('.menu-toggle')) {
                document.querySelector('nav ul').classList.remove('show');
            }
        });
    }

    showPage(page) {
        if (!this.appState.currentUser && page !== 'auth') {
            this.authManager.showPage('auth');
            return;
        }

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        switch(page) {
            case 'home':
                document.getElementById('home-page').classList.add('active');
                break;
            case 'cart':
                document.getElementById('cart-page').classList.add('active');
                this.updateCartDisplay();
                break;
            case 'profile':
                document.getElementById('profile-page').classList.add('active');
                this.updateProfileDisplay();
                break;
            case 'admin':
                if (this.appState.currentUser.isAdmin) {
                    document.getElementById('admin-page').classList.add('active');
                    this.updateAdminDisplay();
                }
                break;
            case 'about':
                document.getElementById('about-page').classList.add('active');
                break;
            case 'contact':
                document.getElementById('contact-page').classList.add('active');
                break;
            case 'whatsapp':
                document.getElementById('whatsapp-page').classList.add('active');
                break;
            default:
                this.authManager.showPage('auth');
        }
    }

    updateProfileDisplay() {
        if (this.appState.currentUser) {
            document.getElementById('profile-email').textContent = this.appState.currentUser.email;
            document.getElementById('profile-name').textContent = this.appState.currentUser.name;
            document.getElementById('profile-phone').textContent = this.appState.currentUser.phone || 'Non renseigné';
        }
    }
}

// =============================================
// GESTIONNAIRE DE PANIER
// =============================================

class CartManager {
    constructor(appState) {
        this.appState = appState;
    }

    initCartEvents() {
        // Événements pour les boutons d'ajout au panier
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const product = {
                    id: e.target.getAttribute('data-id'),
                    name: e.target.getAttribute('data-name'),
                    price: parseInt(e.target.getAttribute('data-price'))
                };
                this.addToCart(product);
            });
        });

        // Événements pour les méthodes de paiement
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => {
                this.selectPaymentMethod(e.currentTarget.getAttribute('data-method'));
            });
        });

        // Événements pour les formulaires de paiement
        document.getElementById('moncash-payment').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment('moncash');
        });

        document.getElementById('natcash-payment').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment('natcash');
        });
    }

    addToCart(product) {
        const existingItem = this.appState.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.appState.cart.push({
                ...product,
                quantity: 1
            });
        }

        this.showMessage(`${product.name} ajouté au panier!`, 'success');
    }

    removeFromCart(productId) {
        this.appState.cart = this.appState.cart.filter(item => item.id !== productId);
        this.updateCartDisplay();
        this.showMessage('Article supprimé du panier', 'success');
    }

    updateCartDisplay() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        // Vider le contenu actuel
        cartItems.innerHTML = '';

        if (this.appState.cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; padding: 40px;">Votre panier est vide</p>';
            cartTotal.textContent = 'Total: 0 HTG';
            return;
        }

        // Afficher chaque article du panier
        this.appState.cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>Prix unitaire: ${item.price} HTG</p>
                </div>
                <div class="cart-item-actions">
                    <p>Quantité: ${item.quantity}</p>
                    <p>Sous-total: ${item.price * item.quantity} HTG</p>
                    <button class="btn btn-secondary btn-small remove-from-cart" data-id="${item.id}">Supprimer</button>
                </div>
            `;
            cartItems.appendChild(itemElement);
        });

        // Ajouter les événements pour les boutons de suppression
        document.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                this.removeFromCart(e.target.getAttribute('data-id'));
            });
        });

        // Mettre à jour le total
        const total = this.calculateCartTotal();
        cartTotal.textContent = `Total: ${total} HTG`;

        // Mettre à jour les montants dans les formulaires de paiement
        document.getElementById('moncash-amount').value = total;
        document.getElementById('natcash-amount').value = total;
    }

    calculateCartTotal() {
        return this.appState.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    selectPaymentMethod(method) {
        document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
        document.querySelector(`.payment-method[data-method="${method}"]`).classList.add('active');
        
        document.querySelectorAll('.payment-form').forEach(form => form.classList.remove('active'));
        document.getElementById(method + '-form').classList.add('active');
        
        // Mettre à jour le montant dans le formulaire
        const total = this.calculateCartTotal();
        document.getElementById(method + '-amount').value = total;
    }

    processPayment(method) {
        if (this.appState.cart.length === 0) {
            this.showMessage('Votre panier est vide', 'error');
            return;
        }

        let formData;
        if (method === 'moncash') {
            const screenshot = document.getElementById('moncash-screenshot').files[0];
            
            if (!screenshot) {
                this.showMessage('Veuillez uploader une preuve de paiement', 'error');
                return;
            }
            
            formData = {
                method: 'moncash',
                name: document.getElementById('moncash-name').value,
                number: document.getElementById('moncash-number').value,
                amount: document.getElementById('moncash-amount').value,
                id: document.getElementById('moncash-id').value,
                screenshot: URL.createObjectURL(screenshot)
            };
        } else {
            const screenshot = document.getElementById('natcash-screenshot').files[0];
            const region = document.getElementById('natcash-region').value;
            
            if (!screenshot) {
                this.showMessage('Veuillez uploader une preuve de paiement', 'error');
                return;
            }
            
            if (!region) {
                this.showMessage('Veuillez sélectionner une région', 'error');
                return;
            }
            
            formData = {
                method: 'natcash',
                name: document.getElementById('natcash-name').value,
                number: document.getElementById('natcash-number').value,
                amount: document.getElementById('natcash-amount').value,
                id: document.getElementById('natcash-id').value,
                region: region,
                screenshot: URL.createObjectURL(screenshot)
            };
        }

        // Créer la commande
        const order = {
            id: Date.now(),
            user: this.appState.currentUser.email,
            userName: this.appState.currentUser.name,
            items: [...this.appState.cart],
            total: this.calculateCartTotal(),
            payment: formData,
            date: new Date().toLocaleString('fr-FR'),
            status: 'en attente'
        };

        // Ajouter la commande à la liste
        this.appState.orders.push(order);
        this.appState.saveToStorage();

        // Vider le panier
        this.appState.cart = [];
        this.updateCartDisplay();

        // Réinitialiser les formulaires
        document.getElementById('moncash-payment').reset();
        document.getElementById('natcash-payment').reset();
        document.querySelectorAll('.payment-form').forEach(form => form.classList.remove('active'));
        document.querySelectorAll('.payment-method').forEach(method => method.classList.remove('active'));

        this.showMessage('Commande passée avec succès! Nous traiterons votre demande rapidement.', 'success');
    }

    showMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        const container = document.querySelector('.container');
        container.insertBefore(messageEl, container.firstChild);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}

// =============================================
// GESTIONNAIRE D'ADMINISTRATION
// =============================================

class AdminManager {
    constructor(appState) {
        this.appState = appState;
    }

    initAdminEvents() {
        document.getElementById('save-payment-info').addEventListener('click', () => {
            this.savePaymentInfo();
        });

        // Initialiser les informations de paiement dans l'admin
        document.getElementById('admin-moncash-name').value = this.appState.paymentInfo.moncash.name;
        document.getElementById('admin-moncash-number').value = this.appState.paymentInfo.moncash.number;
        document.getElementById('admin-natcash-name').value = this.appState.paymentInfo.natcash.name;
        document.getElementById('admin-natcash-number').value = this.appState.paymentInfo.natcash.number;

        // Mettre à jour les informations de paiement affichées
        this.updatePaymentInfo();
    }

    updateAdminDisplay() {
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '';

        if (this.appState.orders.length === 0) {
            ordersList.innerHTML = '<p style="text-align: center; padding: 40px;">Aucune commande pour le moment</p>';
            return;
        }

        // Afficher chaque commande
        this.appState.orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            orderElement.innerHTML = `
                <div>
                    <h4>Commande #${order.id}</h4>
                    <p>Client: ${order.userName} (${order.user})</p>
                    <p>Date: ${order.date}</p>
                    <p>Total: ${order.total} HTG</p>
                    <p>Statut: <span class="status-${order.status}">${order.status}</span></p>
                </div>
                <div class="order-details">
                    <h5>Détails de la commande:</h5>
                    <ul>
                        ${order.items.map(item => `<li>${item.name} x${item.quantity} - ${item.price * item.quantity} HTG</li>`).join('')}
                    </ul>
                    <h5>Informations de paiement:</h5>
                    <p>Méthode: ${order.payment.method}</p>
                    <p>Nom: ${order.payment.name}</p>
                    <p>Numéro: ${order.payment.number}</p>
                    <p>Montant: ${order.payment.amount} HTG</p>
                    <p>ID Free Fire: ${order.payment.id}</p>
                    ${order.payment.region ? `<p>Région: ${order.payment.region}</p>` : ''}
                    <p>Preuve de paiement: <a href="${order.payment.screenshot}" target="_blank">Voir l'image</a></p>
                    <div style="margin-top: 15px;">
                        <button class="btn btn-small" onclick="adminManager.updateOrderStatus(${order.id}, 'traité')">Marquer comme traité</button>
                        <button class="btn btn-secondary btn-small" onclick="adminManager.updateOrderStatus(${order.id}, 'annulé')">Annuler</button>
                    </div>
                </div>
            `;
            ordersList.appendChild(orderElement);

            // Ajouter l'événement pour afficher/masquer les détails
            orderElement.addEventListener('click', function(e) {
                if (!e.target.classList.contains('btn')) {
                    const details = this.querySelector('.order-details');
                    details.classList.toggle('active');
                }
            });
        });
    }

    savePaymentInfo() {
        this.appState.paymentInfo.moncash.name = document.getElementById('admin-moncash-name').value;
        this.appState.paymentInfo.moncash.number = document.getElementById('admin-moncash-number').value;
        this.appState.paymentInfo.natcash.name = document.getElementById('admin-natcash-name').value;
        this.appState.paymentInfo.natcash.number = document.getElementById('admin-natcash-number').value;
        
        this.appState.saveToStorage();
        this.updatePaymentInfo();
        
        this.showMessage('Informations de paiement mises à jour avec succès!', 'success');
    }

    updatePaymentInfo() {
        // Mettre à jour les informations affichées dans le panier
        document.querySelector('.payment-method[data-method="moncash"] p:nth-child(2)').textContent = 
            `Numéro: ${this.appState.paymentInfo.moncash.number}`;
        document.querySelector('.payment-method[data-method="moncash"] p:nth-child(3)').textContent = 
            `Nom: ${this.appState.paymentInfo.moncash.name}`;
            
        document.querySelector('.payment-method[data-method="natcash"] p:nth-child(2)').textContent = 
            `Numéro: ${this.appState.paymentInfo.natcash.number}`;
        document.querySelector('.payment-method[data-method="natcash"] p:nth-child(3)').textContent = 
            `Nom: ${this.appState.paymentInfo.natcash.name}`;
    }

    updateOrderStatus(orderId, status) {
        const order = this.appState.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            this.appState.saveToStorage();
            this.updateAdminDisplay();
            this.showMessage(`Statut de la commande #${orderId} mis à jour: ${status}`, 'success');
        }
    }

    showMessage(message, type) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        
        const container = document.querySelector('.container');
        container.insertBefore(messageEl, container.firstChild);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }
}

// =============================================
// INITIALISATION DE L'APPLICATION
// =============================================

// Variables globales pour les instances
let appState, authManager, pageManager, cartManager, adminManager;

document.addEventListener('DOMContentLoaded', function() {
    // Initialiser l'état de l'application
    appState = new AppState();
    
    // Vérifier si l'utilisateur est déjà connecté
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        appState.currentUser = JSON.parse(savedUser);
    }

    // Initialiser les gestionnaires
    authManager = new AuthManager(appState);
    pageManager = new PageManager(appState, authManager);
    cartManager = new CartManager(appState);
    adminManager = new AdminManager(appState);

    // Initialiser les événements
    authManager.initAuthEvents();
    pageManager.initNavigation();
    cartManager.initCartEvents();
    adminManager.initAdminEvents();

    // Afficher la page appropriée au chargement
    if (appState.currentUser) {
        pageManager.showPage('home');
        authManager.updateNavigation();
    } else {
        pageManager.showPage('auth');
    }

    // Ajouter des styles pour les statuts de commande
    const style = document.createElement('style');
    style.textContent = `
        .status-en attente { color: #d29922; }
        .status-traité { color: #238636; }
        .status-annulé { color: #f85149; }
    `;
    document.head.appendChild(style);
});

// Exposer adminManager globalement pour les boutons dans le HTML
window.adminManager = adminManager;
