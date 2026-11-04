export const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN?.trim() ?? '';
export const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID?.trim() ?? '';
export const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE?.trim() ?? '';

export const isAuth0Configured = [
  auth0Domain,
  auth0ClientId,
  auth0Audience,
].every(Boolean) && ![auth0Domain, auth0ClientId, auth0Audience]
  .some((value) => value.includes('your-tenant') || value.includes('your-auth0'));
