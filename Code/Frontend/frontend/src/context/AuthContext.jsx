import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axios';
import {
  auth,
  db,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from '../services/firebase';

// Optional Firebase integration
// We'll dynamically import Firebase in the effect below to avoid build-time errors

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(() => {
    const storedUser = localStorage.getItem('lex_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('lex_user');
        localStorage.removeItem('lex_token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // ensure user profile exists in Firestore
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userRef);
          if (!snap.exists()) {
            const profile = {
              uid: fbUser.uid,
              email: fbUser.email || null,
              name: fbUser.displayName || null,
              createdAt: serverTimestamp(),
              role: 'citizen'
            };
            await setDoc(userRef, profile);
            setUser(profile);
            try { localStorage.setItem('lex_user', JSON.stringify(profile)); } catch {}
          } else {
            const data = snap.data();
            setUser({ ...data });
            try { localStorage.setItem('lex_user', JSON.stringify(data)); } catch {}
          }
        } catch (err) {
          // fallback
          setUser({ id: fbUser.uid, email: fbUser.email, name: fbUser.displayName, role: 'citizen' });
        }
      } else {
        loadUser();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadUser]);

  // Firebase-based auth operations
  const signIn = useCallback(async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = cred.user;
      return { success: true, user: { id: fbUser.uid, email: fbUser.email, name: fbUser.displayName } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const signUp = useCallback(async (email, password, displayName, role = 'citizen') => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = cred.user;
      if (displayName) {
        await updateProfile(fbUser, { displayName });
      }
      // create Firestore profile
      const profile = { uid: fbUser.uid, email: fbUser.email, name: displayName || null, role, createdAt: serverTimestamp() };
      await setDoc(doc(db, 'users', fbUser.uid), profile);
      setUser(profile);
      try { localStorage.setItem('lex_user', JSON.stringify(profile)); } catch {}
      return { success: true, user: profile };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      // ensure profile in Firestore
      try {
        const userRef = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          const profile = { uid: fbUser.uid, email: fbUser.email, name: fbUser.displayName || null, role: 'citizen', createdAt: serverTimestamp() };
          await setDoc(userRef, profile);
          setUser(profile);
          try { localStorage.setItem('lex_user', JSON.stringify(profile)); } catch {}
        }
      } catch (err) {
        // ignore
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('lex_token');
    localStorage.removeItem('lex_user');
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const login = useCallback(async (email, password, role) => {
    try {
      const endpoint = role === 'advocate' ? '/advocates/login' : '/citizens/login';
      const { data } = await api.post(endpoint, { email, password });

      const roleNormalized = (data.user.role || role || '').toLowerCase();
      const userData = { ...data.user, role: roleNormalized };

      localStorage.setItem('lex_token', data.token);
      localStorage.setItem('lex_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  }, []);

  const register = useCallback(async (userPayload) => {
    try {
      const { data } = await api.post('/citizens/register', userPayload);
      const roleNormalized = (data.user.role || '').toLowerCase();
      const userData = { ...data.user, role: roleNormalized };

      localStorage.setItem('lex_token', data.token);
      localStorage.setItem('lex_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('lex_token');
    localStorage.removeItem('lex_user');
    setUser(null);
  }, []);

  const isCitizen = useCallback(() => user?.role?.toLowerCase() === 'citizen', [user]);
  const isAdvocate = useCallback(() => user?.role?.toLowerCase() === 'advocate', [user]);

  const value = {
    user,
    loading,
    // Firebase auth functions
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    // legacy backend login/register (kept for compatibility)
    login,
    register,
    isAuthenticated: !!user,
    isCitizen,
    isAdvocate
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
