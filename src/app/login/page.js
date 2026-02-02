'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const auth = getAuth(app);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Get the ID token
            const token = await user.getIdToken();
            
            // Store token and user info for app compatibility
            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Admin',
                role: 'admin' // Force admin role for now as we transition
            }));

            // Redirect to dashboard
            window.location.href = '/'; 
        } catch (error) {
            console.error("Firebase login error:", error);
            const errorCode = error.code;
            let errorMessage = "Login failed. Please check your credentials.";
            
            if (errorCode === 'auth/invalid-email') {
                errorMessage = "Invalid email address.";
            } else if (errorCode === 'auth/user-not-found') {
                errorMessage = "User not found.";
            } else if (errorCode === 'auth/wrong-password') {
                errorMessage = "Incorrect password.";
            } else if (errorCode === 'auth/too-many-requests') {
                errorMessage = "Too many failed attempts. Please try again later.";
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>NetManager Pro</h1>
                <p>Enterprise Network Management System</p>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Enter email" 
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter password" 
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                <p style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
                    Secured by Firebase
                </p>
            </div>
        </div>
    );
}
