import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Callback42 = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      const code = searchParams.get('code');
      if (!code) return;

      try {
        const response = await fetch(`/api/auth/42/callback?code=${code}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log('User data:', data);
      } catch (error) {
        console.error('Error while retrieving the token:', error);
      } finally {
        navigate('/');
      }
    };

    fetchData();
  }, [searchParams, navigate]);

  return <div>Connecting...</div>;
};

export default Callback42;
