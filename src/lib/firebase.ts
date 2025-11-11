// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBy2wScPQyX0uDNBZKRY3cOkj4vWkySwq8",
  authDomain: "undangan-digital-89474.firebaseapp.com",
  projectId: "undangan-digital-89474",
  storageBucket: "undangan-digital-89474.firebasestorage.app",
  messagingSenderId: "172491326195",
  appId: "1:172491326195:web:c62a95fae15b6334d06d86"
};

let dbInstance: any = null;

// Lazy initialization of Firebase
export const getDb = async () => {
  if (dbInstance) return dbInstance;
  
  const { initializeApp } = await import('firebase/app');
  const { getFirestore } = await import('firebase/firestore');
  
  const app = initializeApp(firebaseConfig);
  dbInstance = getFirestore(app);
  
  return dbInstance;
};
