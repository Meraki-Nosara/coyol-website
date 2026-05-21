# Meraki CRM Security

## Data Classification
- **CONFIDENTIAL**: 34,000+ guest records with PII (names, emails, phones)
- **HIGH VALUE TARGET**: High-net-worth individuals from NYC, LA, Toronto, SF
- **RETENTION**: Keep indefinitely, but purge on request (GDPR/privacy)

## Security Measures

### 1. Access Control
- **RLS Enabled**: Row-level security on all CRM tables
- **Whitelist Only**: Only Marion, Ruth can access
- **Delete = Marion Only**: Prevents accidental data loss
- **Audit Logging**: Every access is logged

### 2. API Keys
| Key Type | Use | Security |
|----------|-----|----------|
| `anon` key | Public website (reservations) | NO access to CRM |
| `service_role` key | Backend automation | Full access, keep SECRET |

**⚠️ NEVER commit service_role key to git**

Store in: `~/.openclaw/.env` (not in repo)
```
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### 3. Data Protection
- **Encryption at rest**: Supabase default (AES-256)
- **Encryption in transit**: HTTPS/TLS required
- **Masked views**: For dashboards that don't need full PII
- **No bulk export**: API limited to 100 rows per request

### 4. Audit Trail
All CRM access is logged:
- Who accessed (email)
- What action (select/insert/update/delete)
- Which records
- When (timestamp)

Query audit log:
```sql
SELECT * FROM crm_audit_log 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### 5. Suspicious Activity Alerts
Monitor for:
- Bulk selects (>1000 records)
- Access from new IPs
- After-hours access
- Multiple failed auth attempts

### 6. Backup & Recovery
- Supabase daily backups (retained 7 days)
- Local JSON backup: `~/.openclaw/workspace/meraki-crm/data/`
- Git backup: Encrypted, private repo only

### 7. Incident Response
If data breach suspected:
1. Revoke all API keys immediately (Supabase dashboard)
2. Check audit log for unauthorized access
3. Rotate all credentials
4. Notify Marion immediately
5. Document incident

## Compliance Notes
- **No GDPR consent yet**: Need to add opt-out mechanism
- **No data retention policy**: Should purge inactive after X years
- **No right-to-delete flow**: Need to implement

## TODO
- [ ] Get service_role key from Supabase dashboard
- [ ] Set up MFA on Supabase account
- [ ] Create Ruth's auth account
- [ ] Enable Supabase Auth audit logs
- [ ] Set up alerts for suspicious queries
