#!/usr/bin/env python3
"""
Backup Script for Innovative School Platform
Run this script to create, restore, or manage backups
"""

import sys
import os
import argparse
from datetime import datetime

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from backup import BackupConfig, BackupManager, BackupType

def main():
    parser = argparse.ArgumentParser(description='Innovative School Platform Backup Manager')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Create backup command
    create_parser = subparsers.add_parser('create', help='Create a backup')
    create_parser.add_argument('--type', choices=['full', 'incremental'], default='full',
                             help='Type of backup to create')
    create_parser.add_argument('--db-host', default='localhost', help='Database host')
    create_parser.add_argument('--db-port', type=int, default=5432, help='Database port')
    create_parser.add_argument('--db-name', default='innovative_school', help='Database name')
    create_parser.add_argument('--db-user', default='postgres', help='Database user')
    create_parser.add_argument('--db-password', default='password', help='Database password')
    create_parser.add_argument('--backup-dir', default='./backups', help='Backup directory')
    create_parser.add_argument('--retention-days', type=int, default=30, help='Retention days')
    create_parser.add_argument('--s3-bucket', help='S3 bucket for cloud backup')
    create_parser.add_argument('--s3-region', default='us-east-1', help='S3 region')
    
    # Restore backup command
    restore_parser = subparsers.add_parser('restore', help='Restore from backup')
    restore_parser.add_argument('backup_id', help='Backup ID to restore')
    restore_parser.add_argument('--type', choices=['full', 'database', 'files'], default='full',
                               help='Type of restore to perform')
    restore_parser.add_argument('--db-host', default='localhost', help='Database host')
    restore_parser.add_argument('--db-port', type=int, default=5432, help='Database port')
    restore_parser.add_argument('--db-name', default='innovative_school', help='Database name')
    restore_parser.add_argument('--db-user', default='postgres', help='Database user')
    restore_parser.add_argument('--db-password', default='password', help='Database password')
    restore_parser.add_argument('--backup-dir', default='./backups', help='Backup directory')
    
    # List backups command
    list_parser = subparsers.add_parser('list', help='List available backups')
    list_parser.add_argument('--backup-dir', default='./backups', help='Backup directory')
    
    # Cleanup command
    cleanup_parser = subparsers.add_parser('cleanup', help='Clean up old backups')
    cleanup_parser.add_argument('--backup-dir', default='./backups', help='Backup directory')
    cleanup_parser.add_argument('--retention-days', type=int, default=30, help='Retention days')
    
    # Schedule command
    schedule_parser = subparsers.add_parser('schedule', help='Start backup scheduler')
    schedule_parser.add_argument('--db-host', default='localhost', help='Database host')
    schedule_parser.add_argument('--db-port', type=int, default=5432, help='Database port')
    schedule_parser.add_argument('--db-name', default='innovative_school', help='Database name')
    schedule_parser.add_argument('--db-user', default='postgres', help='Database user')
    schedule_parser.add_argument('--db-password', default='password', help='Database password')
    schedule_parser.add_argument('--backup-dir', default='./backups', help='Backup directory')
    schedule_parser.add_argument('--retention-days', type=int, default=30, help='Retention days')
    schedule_parser.add_argument('--s3-bucket', help='S3 bucket for cloud backup')
    schedule_parser.add_argument('--s3-region', default='us-east-1', help='S3 region')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Create backup configuration
    config = BackupConfig(
        db_host=args.db_host,
        db_port=args.db_port,
        db_name=args.db_name,
        db_user=args.db_user,
        db_password=args.db_password,
        backup_dir=args.backup_dir,
        retention_days=args.retention_days,
        s3_bucket=getattr(args, 's3_bucket', None),
        s3_region=getattr(args, 's3_region', 'us-east-1')
    )
    
    # Create backup manager
    manager = BackupManager(config)
    
    if args.command == 'create':
        print(f"Creating {args.type} backup...")
        if args.type == 'full':
            backups = manager.create_full_backup()
        else:
            backups = manager.create_incremental_backup()
        
        print(f"Created {len(backups)} backups:")
        for backup in backups:
            print(f"  - {backup.backup_id}: {backup.status.value} ({backup.size_bytes} bytes)")
    
    elif args.command == 'restore':
        print(f"Restoring from backup: {args.backup_id}")
        success = manager.restore_from_backup(args.backup_id, args.type)
        if success:
            print("Restore completed successfully")
        else:
            print("Restore failed")
            sys.exit(1)
    
    elif args.command == 'list':
        print("Available backups:")
        backups = manager.list_backups()
        if not backups:
            print("  No backups found")
        else:
            for backup in backups:
                print(f"  - {backup.backup_id}: {backup.backup_type.value} "
                      f"({backup.timestamp.strftime('%Y-%m-%d %H:%M:%S')}) "
                      f"{backup.status.value} ({backup.size_bytes} bytes)")
    
    elif args.command == 'cleanup':
        print("Cleaning up old backups...")
        manager.cleanup_old_backups()
        print("Cleanup completed")
    
    elif args.command == 'schedule':
        print("Starting backup scheduler...")
        print("Press Ctrl+C to stop")
        try:
            from backup import schedule_backups
            schedule_backups(config)
        except KeyboardInterrupt:
            print("\nBackup scheduler stopped")

if __name__ == "__main__":
    main()

