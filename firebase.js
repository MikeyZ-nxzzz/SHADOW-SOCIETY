class FirebaseManager {
    constructor() {
        this.db = window.firebaseDB;
        this.auth = window.firebaseAuth;
    }

    async registerUser(userData) {
        try {
            const { createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js");
            const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js");
            
            const userCredential = await createUserWithEmailAndPassword(this.auth, userData.email, userData.password);
            await setDoc(doc(this.db, "users", userCredential.user.uid), {
                name: userData.name,
                phone: userData.phone,
                email: userData.email,
                createdAt: new Date().toISOString()
            });
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async loginUser(email, password) {
        try {
            const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js");
            await signInWithEmailAndPassword(this.auth, email, password);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

window.FirebaseManager = FirebaseManager;