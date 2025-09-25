// =============================================
// GESTIONNAIRE FIREBASE (Version Moderne)
// =============================================

class FirebaseManager {
    constructor() {
        this.db = window.firebaseDB;
        this.auth = window.firebaseAuth;
    }

    // ==================== AUTHENTIFICATION ====================

    async registerUser(userData) {
        try {
            const { createUserWithEmailAndPassword } = await import(
                "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js"
            );
            
            const userCredential = await createUserWithEmailAndPassword(
                this.auth, 
                userData.email, 
                userData.password
            );
            
            // Sauvegarder les infos supplémentaires
            const { doc, setDoc } = await import(
                "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js"
            );
            
            await setDoc(doc(this.db, "users", userCredential.user.uid), {
                name: userData.name,
                phone: userData.phone,
                email: userData.email,
                createdAt: new Date().toISOString()
            });
            
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error("Erreur inscription:", error);
            return { success: false, error: error.message };
        }
    }

    async loginUser(email, password) {
        try {
            const { signInWithEmailAndPassword } = await import(
                "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js"
            );
            
            const userCredential = await signInWithEmailAndPassword(
                this.auth, 
                email, 
                password
            );
            
            // Récupérer les données supplémentaires
            const userData = await this.getUserData(userCredential.user.uid);
            
            return { 
                success: true, 
                user: { ...userCredential.user, ...userData } 
            };
        } catch (error) {
            console.error("Erreur connexion:", error);
            return { success: false, error: error.message };
        }
    }

    async getCurrentUser() {
        return new Promise((resolve) => {
            this.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    const userData = await this.getUserData(user.uid);
                    resolve({ ...user, ...userData });
                } else {
                    resolve(null);
                }
            });
        });
    }

    async getUserData(uid) {
        try {
            const { doc, getDoc } = await import(
                "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js"
            );
            
            const userDoc = await getDoc(doc(this.db, "users", uid));
            return userDoc.exists() ? userDoc.data() : null;
        } catch (error) {
            return null;
        }
    }

    // ==================== COMMANDES ====================

    async saveOrder(orderData) {
        try {
            const { collection, addDoc } = await import(
                "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js"
            );
            
            await addDoc(collection(this.db, "orders"), {
                ...orderData,
                createdAt: new Date().toISOString(),
                status: 'en attente'
            });
            
            return { success: true };
        } catch (error) {
            console.error("Erreur sauvegarde commande:", error);
            return { success: false, error: error.message };
        }
    }

    async logoutUser() {
        try {
            const { signOut } = await import(
                "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js"
            );
            
            await signOut(this.auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}