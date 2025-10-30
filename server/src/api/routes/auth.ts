import { Router } from 'express';
import ssoLoginRedirectController from '#controllers/auth/sso-login-redirect.ts';

const router = Router();

// This route should be protected by Shibboleth at the reverse proxy.
// After successful IdP login, the proxy injects headers and forwards here.
router.get('/sso-login-redirect', ssoLoginRedirectController);

export default router;

//this file pertains to shibboleth
