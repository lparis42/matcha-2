import { use, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

  const SignIn = async () => {
    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'usertest', password: 'passtestE42' }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message);
      }
      console.log(data)
    } catch (error) {
      console.error(error)
    }
  }

  const SignUp = async () => {
    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: 'usertest', 
          password: 'passtestE42',
          first_name: 'John',
          last_name: 'Doe',
          email: 'lparismemartin@gmail.com'
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message);
      }
      console.log(data)
    } catch (error) {
      console.error(error)
    }
  }

  const AskResetEmail = async () => {
    try {
      const response = await fetch('/api/auth/ask-reset-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'lparismemartin@gmail.com'
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message);
      }
      console.log(data)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Testing buttons</h1>
      <div className="card">
        <button onClick={SignIn}>
          Sign In
        </button>
        <button onClick={SignUp}>
          Sign Up
        </button>
        <button onClick={AskResetEmail}>
          Ask Reset Email
        </button>
      </div>
    </>
  )
}

export default App
