import { use, useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { io } from 'socket.io-client';

function App() {

  const [isConnecting, setIsConnecting] = useState(false);

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
      setIsConnecting(true);
    } catch (error) {
      console.error(error)
    }
  }

  const SignUp = async () => {
    try {
      const response = await fetch('/api/auth/sign-up-no-email-verification', {
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

  const ForgotPassword = async () => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
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

  const UpdateProfile = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'usertest',
          password: 'passtestE42',
          first_name: 'John',
          last_name: 'Doe',
          email: 'lparismemartin@gmail.com',
          date_of_birth: '1990-01-01',
          gender: 'Male',
          sexual_preferences: 'Heterosexual',
          biography: 'Hello world!',
          interests: [{'technology': true, 'sports': false}],
          pictures: [{'picture_1': 'picture1.jpg'}, {'picture_2': 'picture2.jpg'}]
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

  useEffect(() => {

    const autoSignIn = async () => {
      if (hasFetched.current && !isConnecting) return;
      hasFetched.current = true;

      try {
        // If the user is signed in, establish a WebSocket connection
        const socket = io('/', {
          transports: ['websocket'],
          autoConnect: true,
          withCredentials: true,
        });

        socket.on('connect', () => {
          console.log('Connected to WebSocket server');
          socket.on('message', (data) => {
            console.log('Received message:', data);
          });
          socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
          });
        });
        socket.on('connect_error', async (err) => {
          console.error('Connection error:', err);
          await fetch('/api/auth/delete-cookie', { method: 'GET' });
        });
      } catch (error) {
        console.error(error);
      }
    };

    autoSignIn();
  }, [isConnecting]);

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
        <button onClick={ForgotPassword}>
          Forgot password
        </button>
        <button onClick={Oauth42}>
          Oauth 42
        </button>
        <button onClick={UpdateProfile}>
          Update Profile
        </button>
      </div>
    </>
  )
}

export default App
