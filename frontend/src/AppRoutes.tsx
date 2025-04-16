import { Routes, Route } from 'react-router-dom';
import App from './App';
import Callback42 from './Callback42';
import VerifyEmail from './VerifyEmail';

const AppRoutes: React.FC = () => {


  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/auth/42/callback" element={<Callback42 />} />
      <Route path="/auth/verify-email" element={<VerifyEmail />} />
    </Routes>
  );
};

export default AppRoutes;
