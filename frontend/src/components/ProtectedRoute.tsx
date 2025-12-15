import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

export const ProtectedRoute = () => {
  const { user, isLoading } = useAppSelector(state => state.auth);

  if (isLoading) {
    return <div>Загрузка...</div>; // Или любой другой индикатор загрузки
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
