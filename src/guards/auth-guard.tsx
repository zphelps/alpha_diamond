import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/use-auth';
import { useRouter } from '../hooks/use-router';
import { paths } from '../paths';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: FC<AuthGuardProps> = (props) => {
  const { children } = props;
  const router = useRouter();
  const { isAuthenticated, issuer } = useAuth();
  const [checked, setChecked] = useState(false);

  const check = useCallback(
    () => {
      if (!isAuthenticated) {
        console.log('AuthGuard: User is not authenticated, redirecting to login page');
        const searchParams = new URLSearchParams({ returnTo: window.location.href }).toString();
        const href = paths.auth.login + `?${searchParams}`;
        router.replace(href);
      } else {
        console.log('AuthGuard: User is authenticated, rendering children');
        setChecked(true);
      }
    },
    [isAuthenticated, issuer, router]
  );

  // Only check on mount, this allows us to redirect the user manually when auth state changes
  useEffect(
    () => {
      check();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (!checked) {
    return null;
  }

  // If got here, it means that the redirect did not occur, and that tells us that the user is
  // authenticated / authorized.

  return <>{children}</>;
};

AuthGuard.propTypes = {
  children: PropTypes.node
};
