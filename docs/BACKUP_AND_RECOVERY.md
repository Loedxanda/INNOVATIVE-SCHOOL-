# Backup and Recovery Guide

This document provides comprehensive information about the backup and recovery system for the Innovative School Platform.

## Overview

The backup system provides automated, reliable backup and recovery capabilities for:
- PostgreSQL database
- File system (uploads, static files, logs)
- Cloud storage integration (AWS S3)

## Features

- **Automated Backups**: Scheduled full and incremental backups
- **Compression**: Gzip compression to reduce storage requirements
- **Cloud Storage**: Optional AWS S3 integration for off-site backups
- **Retention Policy**: Configurable retention periods for old backups
- **Recovery**: Full, database-only, or file-only restore options
- **Monitoring**: Detailed logging and status tracking

## Configuration

### Environment Variables

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=innovative_school
DB_USER=postgres
DB_PASSWORD=password

# Backup Configuration
BACKUP_DIR=./backups
RETENTION_DAYS=30
COMPRESSION=true
ENCRYPTION=true

# AWS S3 Configuration (Optional)
S3_BUCKET=innovative-school-backups
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

### Backup Types

1. **Full Backup**: Complete database and file system backup
2. **Incremental Backup**: Changes since last backup (currently implemented as full backup)
3. **Differential Backup**: Changes since last full backup (planned)

## Usage

### Command Line Interface

The backup system provides a command-line interface for managing backups:

```bash
# Create a full backup
python scripts/backup_script.py create --type full

# Create an incremental backup
python scripts/backup_script.py create --type incremental

# List available backups
python scripts/backup_script.py list

# Restore from backup
python scripts/backup_script.py restore <backup_id> --type full

# Clean up old backups
python scripts/backup_script.py cleanup

# Start backup scheduler
python scripts/backup_script.py schedule
```

### Docker Compose

#### Backup Scheduler

Run the backup scheduler as a service:

```bash
docker-compose -f docker-compose.backup.yml up backup-scheduler
```

#### Backup Management

Run backup management commands:

```bash
# List backups
docker-compose -f docker-compose.backup.yml run --rm backup-manager

# Create backup
docker-compose -f docker-compose.backup.yml run --rm backup-manager create --type full

# Restore backup
docker-compose -f docker-compose.backup.yml run --rm backup-manager restore <backup_id>
```

### Programmatic Usage

```python
from backup import BackupConfig, BackupManager, BackupType

# Configuration
config = BackupConfig(
    db_host="localhost",
    db_port=5432,
    db_name="innovative_school",
    db_user="postgres",
    db_password="password",
    backup_dir="./backups",
    retention_days=30,
    compression=True,
    s3_bucket="innovative-school-backups"
)

# Create backup manager
manager = BackupManager(config)

# Create full backup
backups = manager.create_full_backup()

# List backups
all_backups = manager.list_backups()

# Restore from backup
success = manager.restore_from_backup("backup_id", "full")
```

## Backup Schedule

The default backup schedule includes:

- **Daily Full Backups**: 2:00 AM every day
- **Hourly Incremental Backups**: 9:00 AM to 5:00 PM (business hours)
- **Daily Cleanup**: 3:00 AM every day

## File Structure

```
backups/
├── db_full_20241201_020000.sql.gz
├── db_incremental_20241201_090000.sql.gz
├── files_full_20241201_020000/
│   ├── uploads/
│   ├── static/
│   └── logs/
├── files_incremental_20241201_090000/
│   ├── uploads/
│   ├── static/
│   └── logs/
└── backup_log.json
```

## Recovery Procedures

### Full Recovery

1. Stop the application
2. Restore database from backup
3. Restore files from backup
4. Start the application

```bash
# Stop application
docker-compose down

# Restore database
python scripts/backup_script.py restore <backup_id> --type database

# Restore files
python scripts/backup_script.py restore <backup_id> --type files

# Start application
docker-compose up -d
```

### Database-Only Recovery

```bash
python scripts/backup_script.py restore <backup_id> --type database
```

### File-Only Recovery

```bash
python scripts/backup_script.py restore <backup_id> --type files
```

## Monitoring and Logging

### Backup Log

The system maintains a detailed log of all backup operations in `backup_log.json`:

```json
[
  {
    "backup_id": "db_full_20241201_020000",
    "backup_type": "full",
    "timestamp": "2024-12-01T02:00:00",
    "status": "success",
    "size_bytes": 1048576,
    "file_path": "./backups/db_full_20241201_020000.sql.gz",
    "metadata": {
      "database": "innovative_school",
      "host": "localhost",
      "compressed": true,
      "encrypted": true
    }
  }
]
```

### Log Files

- **Backup Operations**: Detailed logs in application logs
- **Error Handling**: Failed backup attempts are logged with error details
- **Status Tracking**: Real-time status updates during backup operations

## Best Practices

### Backup Strategy

1. **Regular Full Backups**: Daily full backups for complete data protection
2. **Frequent Incremental Backups**: Hourly incremental backups during business hours
3. **Off-site Storage**: Use AWS S3 for disaster recovery
4. **Test Restores**: Regularly test restore procedures
5. **Monitor Storage**: Monitor backup storage usage and cleanup old backups

### Security

1. **Encryption**: Enable encryption for sensitive data
2. **Access Control**: Restrict access to backup files and S3 buckets
3. **Secure Storage**: Store backup credentials securely
4. **Audit Logging**: Maintain audit logs for backup operations

### Performance

1. **Compression**: Enable compression to reduce storage requirements
2. **Parallel Backups**: Run database and file backups in parallel
3. **Incremental Backups**: Use incremental backups to reduce backup time
4. **Storage Optimization**: Regular cleanup of old backups

## Troubleshooting

### Common Issues

1. **Backup Failures**: Check database connectivity and file permissions
2. **Storage Full**: Clean up old backups or increase storage
3. **S3 Upload Failures**: Verify AWS credentials and permissions
4. **Restore Failures**: Ensure backup files are not corrupted

### Debug Mode

Enable debug logging for troubleshooting:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Health Checks

Monitor backup system health:

```bash
# Check backup status
python scripts/backup_script.py list

# Check disk usage
df -h ./backups

# Check S3 connectivity
aws s3 ls s3://your-bucket/backups/
```

## Maintenance

### Regular Tasks

1. **Monitor Backup Success**: Check backup logs daily
2. **Clean Old Backups**: Automated cleanup runs daily
3. **Test Restores**: Monthly restore testing
4. **Update Dependencies**: Keep backup tools updated
5. **Review Retention Policy**: Adjust retention periods as needed

### Backup Verification

```bash
# Verify backup integrity
gunzip -t ./backups/db_full_20241201_020000.sql.gz

# Check backup size
ls -lh ./backups/

# Verify S3 uploads
aws s3 ls s3://your-bucket/backups/ --recursive
```

## Support

For backup and recovery support:

1. Check the logs for error messages
2. Verify configuration settings
3. Test with a small backup first
4. Contact system administrator for complex issues

## Future Enhancements

Planned improvements include:

1. **Differential Backups**: More efficient incremental backups
2. **Encryption**: End-to-end encryption for sensitive data
3. **Compression Algorithms**: Support for different compression methods
4. **Backup Verification**: Automated backup integrity checking
5. **Cloud Providers**: Support for additional cloud storage providers
6. **Backup Analytics**: Detailed backup performance metrics

