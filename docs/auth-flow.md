# Auth flow
1. `POST /auth/register` -> access token + refresh cookie.
2. Access token used in `Authorization: Bearer` for protected APIs.
3. `POST /auth/refresh` rotates access token via refresh cookie.
4. `POST /auth/logout` revokes session.
5. Verify/reset email endpoints are mock-ready for SMTP provider.
