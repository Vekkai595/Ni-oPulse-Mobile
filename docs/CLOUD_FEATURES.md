# Features that require external infrastructure

The repository intentionally does not pretend these features are complete:

## Cloud accounts

Real login and cross-device favorites require an authentication provider, database, authorization rules, account deletion and privacy disclosures. A suitable future architecture could use Supabase or Firebase, but no provider is embedded in this version.

## Remote push

Background notifications require Firebase Cloud Messaging or another push provider, user permission, a subscription/token database, server-side event detection and unsubscribe handling. Current alerts are local and foreground-driven.

## Automatic API-key portal

Self-service key issuance requires authenticated users, hashed key storage, revocation, quotas, audit logs and abuse controls. Current named keys are operator-configured environment secrets.
