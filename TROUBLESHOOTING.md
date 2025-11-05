# MediaBot VPS Deployment Troubleshooting

## Port Conflicts Resolution - August 7, 2025

### 🚨 Current Issue: Port Conflicts

**Error**: Ports 5432, 6379, 80 already allocated

### ✅ Solution Applied

1. **Complete Docker cleanup** - Remove all containers/networks/volumes
2. **Fixed environment variables** - Created proper .env.production
3. **Emergency deployment script** - Automated full deployment

---

## Quick Diagnostics

### Check Port Status

```bash
sudo netstat -tulpn | grep -E ':(5432|6379|80|5678)'
```

### Check Docker Status

```bash
docker ps -a
docker network ls
docker volume ls
```

### Check Service Health

```bash
# Container health
docker-compose -f docker-compose.prod.yml ps

# Service logs
docker-compose -f docker-compose.prod.yml logs -f [service_name]
```

---

## Common Issues & Solutions

### 1. Port Still in Use After Cleanup

**Symptoms**: Same port conflict error
**Solution**:

```bash
# Find what's using the port
sudo lsof -i :5432
sudo lsof -i :6379
sudo lsof -i :80

# Kill the process if needed
sudo kill -9 [PID]
```

### 2. Environment Variables Not Loading

**Symptoms**: "WARNING: The [VARIABLE] variable is not set"
**Solution**:

```bash
# Verify file exists
ls -la .env.production

# Check content
cat .env.production | grep -E "DB_PASSWORD|JWT_SECRET"

# Test docker-compose
docker-compose -f docker-compose.prod.yml --env-file .env.production config
```

### 3. Database Connection Issues

**Symptoms**: n8n or API can't connect to PostgreSQL
**Solution**:

```bash
# Check PostgreSQL container
docker logs mediabot-postgres-1

# Test database connection
docker exec -it mediabot-postgres-1 psql -U mediabot_user -d mediabot -c "SELECT 1;"
```

### 4. n8n Authentication Issues

**Symptoms**: Can't login to n8n interface
**Check credentials**:

- URL: http://158.160.190.4:5678
- Username: mediabot_admin
- Password: n8nSecure2025!

### 5. Build Failures

**Symptoms**: Docker build fails
**Solution**:

```bash
# Clean Docker system
docker system prune -a

# Rebuild with no cache
docker-compose -f docker-compose.prod.yml build --no-cache

# Check disk space
df -h
```

---

## Service URLs After Deployment

| Service    | URL                              | Status Check                |
| ---------- | -------------------------------- | --------------------------- |
| Frontend   | http://158.160.190.4             | Should show MediaBot app    |
| API        | http://158.160.190.4:8080/health | Should return health status |
| n8n        | http://158.160.190.4:5678        | Should show login page      |
| PostgreSQL | Internal (5432)                  | Check via docker logs       |
| Redis      | Internal (6379)                  | Check via docker logs       |

---

## Emergency Commands

### Complete Reset (Nuclear Option)

```bash
# Stop everything
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker system prune -a --volumes

# Redeploy
./emergency-deploy.sh
```

### Quick Restart

```bash
docker-compose -f docker-compose.prod.yml restart
```

### View All Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```

---

## Contact & Support

- **VPS**: 158.160.190.4 (Yandex Cloud)
- **Project**: MediaBot Pre-MVP
- **Issue Date**: August 7, 2025
- **Status**: Port conflicts resolved, ready for deployment
