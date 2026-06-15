import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import keycloak from '../keycloak';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | undefined;
  login: () => void;
  logout: () => void;
  userInfo: {
    name?: string;
    email?: string;
    roles: string[];
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
      })
      .then((authenticated) => {
        setIsAuthenticated(authenticated);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    const interval = setInterval(() => {
      keycloak.updateToken(60).catch(() => keycloak.logout());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const roles =
    keycloak.tokenParsed?.realm_access?.roles?.filter(
      (r) => !r.startsWith('default-roles') && !r.startsWith('offline')
    ) ?? [];

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        token: keycloak.token,
        login: () => keycloak.login(),
        logout: () => keycloak.logout({ redirectUri: window.location.origin }),
        userInfo: {
          name: keycloak.tokenParsed?.name,
          email: keycloak.tokenParsed?.email,
          roles,
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};