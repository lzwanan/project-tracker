import React, { Suspense, useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import MainLayout from '@/components/layout/MainLayout';
import { getAllRoutes } from '@/tools/registry';
import { useAuth } from '@/context/AuthContext';

const LoginPage = SuspenseWrapper(() => import('@/pages/login/LoginPage'));

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    <Spin size="large" />
  </div>
);

function SuspenseWrapper(fn: () => Promise<any>) {
  const Lazy = React.lazy(fn);
  return () => <Suspense fallback={<Loading />}><Lazy /></Suspense>;
}

function RequireAuth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return <Loading />;
  if (!user) return null;
  return <Outlet />;
}

export function createRouter() {
  const routes = getAllRoutes();

  return createBrowserRouter([
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: <RequireAuth />,
      children: [
        {
          element: <MainLayout />,
          children: [
            { index: true, element: <Navigate to="/versions" replace /> },
            ...routes.map((r) => ({
              path: r.path.replace(/^\//, ''),
              element: (
                <Suspense fallback={<Loading />}>
                  <r.element />
                </Suspense>
              ),
            })),
          ],
        },
      ],
    },
  ]);
}
