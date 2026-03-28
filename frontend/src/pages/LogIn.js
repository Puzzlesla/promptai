import '../styles/LogIn.css'
import { auth, googleProvider } from '../firebase.js'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo     from '../assets/logo.png'
import greenery from '../assets/greenery.png'

const Auth = () => {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  const logIn = async () => {
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Incorrect email or password.')
      console.error('Login error:', err)
    }
  }

  const signInWithGoogle = async () => {
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/dashboard')
    } catch (err) {
      setError('Google sign-in failed. Please try again.')
      console.error('Google Sign-In error:', err)
    }
  }

  // Allow Enter key to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') logIn()
  }

  return (
    <div className='login'>

      {/* Greenery draping from top */}
      <img src={greenery} alt='' className='login__greenery' />

      {/* Centered card */}
      <div className='login__card'>

        <img src={logo} alt='VINEA' className='login__logo' />
        <h1 className='login__title'>VINEA</h1>
        <p className='login__tagline'>grow with intention</p>

        {/* Email */}
        <div className='login__field'>
          <input
            className='login__input'
            type='email'
            placeholder='Email address'
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete='email'
          />
        </div>

        {/* Password */}
        <div className='login__field' style={{ marginBottom: 28 }}>
          <input
            className='login__input'
            type='password'
            placeholder='Password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete='current-password'
          />
        </div>

        {/* Error message */}
        {error && (
          <p style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: 12,
            color: '#f48fb1',
            fontWeight: 700,
            margin: '-16px 0 16px',
            alignSelf: 'flex-start'
          }}>
            {error}
          </p>
        )}

        {/* Primary CTA */}
        <button className='login__btn login__btn--primary' onClick={logIn}>
          Continue
        </button>

        {/* Divider */}
        <div className='login__divider'>
          <span className='login__divider-text'>or</span>
        </div>

        {/* Google */}
        <button className='login__btn login__btn--google' onClick={signInWithGoogle}>
          {/* Inline Google G icon */}
          <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z' fill='#4285F4'/>
            <path d='M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z' fill='#34A853'/>
            <path d='M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z' fill='#FBBC05'/>
            <path d='M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z' fill='#EA4335'/>
          </svg>
          Continue with Google
        </button>

        {/* Sign up nudge */}
        <p className='login__signup-row'>
          Don't have an account?{' '}
          <button className='login__signup-link' onClick={() => navigate('/signup')}>
            Sign up
          </button>
        </p>

      </div>
    </div>
  )
}

export default Auth