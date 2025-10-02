import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import HelpCenter from '../components/HelpCenter';

const HelpPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to access help.</div>;
  }

  return (
    <HelpCenter userRole={user.role as 'admin' | 'teacher' | 'student' | 'parent'} />
  );
};

export default HelpPage;

