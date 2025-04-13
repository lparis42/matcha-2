import { use, useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { io } from 'socket.io-client';

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
      const socket = io('/', {
        transports: ['websocket'],
        autoConnect: false,
        withCredentials: true,
      });
      socket.on('connect', () => {
        console.log('Connected to WebSocket server');

        socket.on('disconnect', () => {
          console.log('Disconnected from WebSocket server');
        });
      });
      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
      });
      socket.connect();
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

  const Oauth42 = () => {
    window.location.href = '/api/auth/42';
  }

  const hasFetched = useRef(false);

  useEffect(() => {

    const autoSignIn = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const response = await fetch('/api/auth/auto-sign-in', {
          method: 'POST',
          credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }
        console.log(data);
        const socket = io('/', {
          transports: ['websocket'],
          autoConnect: false,
          withCredentials: true,
        });
        socket.on('connect', () => {
          console.log('Connected to WebSocket server');
  
          socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
          });
        });
        socket.on('connect_error', (err) => {
          console.error('Connection error:', err);
        });
        socket.connect();
      } catch (error) {
        console.error(error);
      }
    };

    autoSignIn();
  }, []);

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
        <button onClick={Oauth42}>
          Oauth 42
        </button>
      </div>
    </>
  )
}

export default App
