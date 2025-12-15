import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch } from '../app/hooks';
import { clearNotifications } from '../features/ui/uiSlice';

export const useClearNotificationsOnRouteChange = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    // Clear notifications when route changes
    dispatch(clearNotifications());
  }, [location.pathname, dispatch]);
};
