# Security Checklist

| ID | Requirement | Status | Notes |
|---|---|---|---|
| AUTH-001 | Password storage (Hashed) | PASS | Bcryptjs used |
| AUTH-002 | Session security (HttpOnly/Secure) | PASS | Implemented |
| AUTH-003 | Role authorization (RBAC) | PASS | requireRole guard |
| AUTH-004 | Event ownership | PASS | Checked in EventService |
| AUTH-005 | Event membership | PASS | requireEventAccess guard |
| PHOTO-001 | Upload validation (MIME/Size) | PASS | Zod schema enforcement |
| PHOTO-002 | Storage access (Private) | PASS | S3 Bucket Private |
| PHOTO-003 | Signed URLs | PASS | StorageService implemented |
| PHOTO-004 | Photo authorization | PASS | Verified via event access |
| GALLERY-001 | Gallery publication | PASS | Atomic publishing logic |
| GALLERY-002 | PIN hashing | PASS | Bcryptjs used |
| GALLERY-003 | PIN rate limiting | PASS | RateLimiter implemented |
| GALLERY-004 | Customer session isolation | PASS | Session scoped to galleryId |
| API-001 | Input validation | PASS | Zod used on all endpoints |
| API-002 | IDOR prevention | PASS | session-based ID derivation |
| API-003 | Error leakage | PASS | Global error handling |
| DEPLOY-001 | Secrets management | PASS | Environment variables |
