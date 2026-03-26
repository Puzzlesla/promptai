import { auth, googleProvider } from '../firebase.js';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logInTree from '../assets/logInTree.svg';
import cherryBlossom from '../assets/cherryBlossomTree.svg';



const Auth = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const navigate = useNavigate();
    const goToSignUp = () => {
        navigate('/signup');
    };

    const logIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (error) {
            console.error("Error during login:", error);
        }
    };

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/dashboard');
        } catch (error) {
            console.error("Error during Google Sign-In:", error);
        }
    };

    // const logOut = async () => {
    //     try {
    //         await signOut(auth);
    //     } catch (error) {
    //         console.error("Error during logout:", error);
    //     }
    // }
    
//     return(
//         <div>
//             <input 
//             type="email" placeholder="Email..." 
//             onChange={(e) => setEmail(e.target.value)} 
//             />
//             <input 
//             type="password" placeholder="Password" 
//             onChange={(e) => setPassword(e.target.value)} 
//             />
//             <button onClick={logIn}>Log in</button>
//             <button onClick={signUp}>Sign up</button>
//             <button onClick={logOut}>Log out</button>

//             <button onClick={signInWithGoogle}>Sign in with Google</button>
//         </div>
//     );
// }

// export default Auth;
    // Responsive, two-column layout with large tree visual
    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'row',
            background: '#fdf2f5',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Left: Login Form */}
            <div style={{
                flex: '0 0 420px',
                minWidth: 320,
                maxWidth: 480,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                background: 'rgba(252, 228, 236, 0.98)',
                boxShadow: '2px 0 24px 0 rgba(233, 169, 188, 0.10)',
            }}>
                <div style={{
                    background: '#fce4ec',
                    borderRadius: 22,
                    padding: 32,
                    minWidth: 320,
                    width: '90%',
                    boxShadow: '0 2px 12px rgba(233, 169, 188, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    margin: 24,
                }}>
                    <img
                        src={logInTree}
                        alt="Login Tree"
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 22,
                            marginBottom: 16,
                            background: '#fce4ec',
                            border: '3px solid #f48fb1',
                            objectFit: 'contain',
                            boxShadow: '0 2px 8px rgba(233, 169, 188, 0.3)'
                        }}
                    />
                    <h2 style={{ color: '#333', marginBottom: 24 }}>Sign In</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                            marginBottom: 12,
                            padding: '10px 16px',
                            borderRadius: 12,
                            border: '1px solid #f48fb1',
                            width: '100%',
                            fontSize: 16,
                            boxSizing: 'border-box'
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{
                            marginBottom: 20,
                            padding: '10px 16px',
                            borderRadius: 12,
                            border: '1px solid #f48fb1',
                            width: '100%',
                            fontSize: 16,
                            boxSizing: 'border-box'
                        }}
                    />
                    <button onClick={logIn} style={{
                        background: '#f48fb1',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 12,
                        padding: '10px 24px',
                        fontWeight: 700,
                        marginBottom: 10,
                        width: '100%',
                        fontSize: 16,
                        cursor: 'pointer'
                    }}>Log in</button>
                    <button onClick={goToSignUp} style={{
                        background: '#f8bbd0',
                        color: '#333',
                        border: 'none',
                        borderRadius: 12,
                        padding: '10px 24px',
                        fontWeight: 700,
                        marginBottom: 10,
                        width: '100%',
                        fontSize: 16,
                        cursor: 'pointer'
                    }}>Sign up</button>
                    <button onClick={signInWithGoogle} style={{
                        background: '#fff',
                        color: '#f48fb1',
                        border: '1px solid #f48fb1',
                        borderRadius: 12,
                        padding: '10px 24px',
                        fontWeight: 700,
                        width: '100%',
                        fontSize: 16,
                        cursor: 'pointer'
                    }}>Sign in with Google</button>
                </div>
            </div>
            {/* Right: Large Cherry Blossom Tree Visual */}
            <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                minHeight: '100vh',
                zIndex: 1,
            }}>
                <img
                    src={cherryBlossom}
                    alt="Cherry Blossom Tree"
                    style={{
                        width: 'min(70vw, 900px)',
                        height: 'auto',
                        maxHeight: '95vh',
                        objectFit: 'contain',
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        left: 0,
                        margin: '0 auto',
                        zIndex: 1,
                        pointerEvents: 'none',
                        opacity: 0.98,
                        filter: 'drop-shadow(0 8px 32px #e9a9bc55)'
                    }}
                />
            </div>
            {/* Responsive: Stack vertically on small screens */}
            <style>{`
                @media (max-width: 900px) {
                    div[style*='flex-direction: row'] {
                        flex-direction: column !important;
                    }
                    div[style*='flex: 0 0 420px'] {
                        max-width: 100vw !important;
                        min-width: 0 !important;
                        width: 100vw !important;
                        box-shadow: none !important;
                    }
                    div[style*='flex: 1'] {
                        min-height: 40vh !important;
                    }
                    img[alt='Cherry Blossom Tree'] {
                        width: 100vw !important;
                        max-height: 40vh !important;
                        left: 0 !important;
                        right: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
export default Auth;