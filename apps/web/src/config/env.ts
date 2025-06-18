// Get environment variables from window.env
declare global {
  interface Window {
    env: {
      VITE_IS_SELF_HOST: string;
      VITE_DOCS_URL: string;
      VITE_KEYCLOAK_URL: string;
      VITE_KEYCLOAK_REALM: string;
      VITE_KEYCLOAK_CLIENT_ID: string;
      VITE_KEYCLOAK_REDIRECT_URI: string;
      VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI: string;
      VITE_API_URL: string;
      VITE_CONTENTFUL_SPACE_ID: string;
      VITE_CONTENTFUL_ACCESS_TOKEN: string;
      VITE_FEATURE_FLAG_PIPELINE: string;
    };
  }
}

// Debug logging
console.log('Window env:', window.env);

// Helper function to get environment variables
export function getEnv(key: keyof Window['env']): string {
  const value = window.env?.[key] || '';
  console.log(`Getting env ${key}:`, value);
  return value;
}

// Helper function to get boolean environment variables
export function getBoolEnv(key: keyof Window['env']): boolean {
  const value = getEnv(key) === 'true';
  console.log(`Getting bool env ${key}:`, value);
  return value;
}

// Helper function to get number environment variables
export function getNumberEnv(key: keyof Window['env']): number {
  const value = Number(getEnv(key)) || 0;
  console.log(`Getting number env ${key}:`, value);
  return value;
}

// Export commonly used environment variables
export const env = {
  isSelfHost: getBoolEnv('VITE_IS_SELF_HOST'),
  docsUrl: getEnv('VITE_DOCS_URL'),
  keycloakUrl: getEnv('VITE_KEYCLOAK_URL'),
  keycloakRealm: getEnv('VITE_KEYCLOAK_REALM'),
  keycloakClientId: getEnv('VITE_KEYCLOAK_CLIENT_ID'),
  keycloakRedirectUri: getEnv('VITE_KEYCLOAK_REDIRECT_URI'),
  keycloakPostLogoutRedirectUri: getEnv('VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI'),
  apiUrl: getEnv('VITE_API_URL'),
  contentfulSpaceId: getEnv('VITE_CONTENTFUL_SPACE_ID'),
  contentfulAccessToken: getEnv('VITE_CONTENTFUL_ACCESS_TOKEN'),
  featureFlagPipeline: getBoolEnv('VITE_FEATURE_FLAG_PIPELINE'),
};

// Debug logging
console.log('Final env object:', env); 