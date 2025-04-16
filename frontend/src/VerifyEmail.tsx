import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      const uuid = searchParams.get('uuid');
      if (!uuid) return;

      try {
        const response = await fetch(`/api/auth/verify-email?uuid=${uuid}`, {
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

export default VerifyEmail;
