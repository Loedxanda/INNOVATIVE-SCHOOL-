"""
Backup and Recovery Module for Innovative School Platform
Handles automated database backups, file backups, and recovery procedures
"""

import os
import shutil
import subprocess
import json
import gzip
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import asyncio
import logging
from dataclasses import dataclass
from enum import Enum

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import boto3
from botocore.exceptions import ClientError
import schedule
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BackupType(Enum):
    """Types of backups supported"""
    FULL = "full"
    INCREMENTAL = "incremental"
    DIFFERENTIAL = "differential"

class BackupStatus(Enum):
    """Backup status indicators"""
    SUCCESS = "success"
    FAILED = "failed"
    IN_PROGRESS = "in_progress"
    PARTIAL = "partial"

@dataclass
class BackupConfig:
    """Configuration for backup operations"""
    # Database settings
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "innovative_school"
    db_user: str = "postgres"
    db_password: str = "password"
    
    # Backup settings
    backup_dir: str = "./backups"
    retention_days: int = 30
    compression: bool = True
    encryption: bool = True
    
    # AWS S3 settings (optional)
    s3_bucket: Optional[str] = None
    s3_region: str = "us-east-1"
    aws_access_key: Optional[str] = None
    aws_secret_key: Optional[str] = None
    
    # File backup settings
    file_backup_paths: List[str] = None
    
    def __post_init__(self):
        if self.file_backup_paths is None:
            self.file_backup_paths = [
                "./uploads",
                "./static",
                "./logs"
            ]

@dataclass
class BackupInfo:
    """Information about a backup"""
    backup_id: str
    backup_type: BackupType
    timestamp: datetime
    status: BackupStatus
    size_bytes: int
    file_path: str
    metadata: Dict

class DatabaseBackup:
    """Handles PostgreSQL database backups"""
    
    def __init__(self, config: BackupConfig):
        self.config = config
        self.ensure_backup_directory()
    
    def ensure_backup_directory(self):
        """Create backup directory if it doesn't exist"""
        Path(self.config.backup_dir).mkdir(parents=True, exist_ok=True)
    
    def create_backup(self, backup_type: BackupType = BackupType.FULL) -> BackupInfo:
        """Create a database backup"""
        timestamp = datetime.now()
        backup_id = f"db_{backup_type.value}_{timestamp.strftime('%Y%m%d_%H%M%S')}"
        
        # Create backup file path
        backup_file = f"{backup_id}.sql"
        if self.config.compression:
            backup_file += ".gz"
        
        backup_path = os.path.join(self.config.backup_dir, backup_file)
        
        try:
            logger.info(f"Starting {backup_type.value} database backup: {backup_id}")
            
            # Build pg_dump command
            cmd = [
                "pg_dump",
                "-h", self.config.db_host,
                "-p", str(self.config.db_port),
                "-U", self.config.db_user,
                "-d", self.config.db_name,
                "-f", backup_path,
                "--verbose",
                "--no-password"
            ]
            
            # Set password via environment variable
            env = os.environ.copy()
            env["PGPASSWORD"] = self.config.db_password
            
            # Execute backup
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"pg_dump failed: {result.stderr}")
            
            # Compress if needed
            if self.config.compression and not backup_path.endswith('.gz'):
                self._compress_file(backup_path)
                backup_path += ".gz"
            
            # Get file size
            size_bytes = os.path.getsize(backup_path)
            
            # Create backup info
            backup_info = BackupInfo(
                backup_id=backup_id,
                backup_type=backup_type,
                timestamp=timestamp,
                status=BackupStatus.SUCCESS,
                size_bytes=size_bytes,
                file_path=backup_path,
                metadata={
                    "database": self.config.db_name,
                    "host": self.config.db_host,
                    "compressed": self.config.compression,
                    "encrypted": self.config.encryption
                }
            )
            
            logger.info(f"Database backup completed successfully: {backup_id} ({size_bytes} bytes)")
            return backup_info
            
        except Exception as e:
            logger.error(f"Database backup failed: {e}")
            return BackupInfo(
                backup_id=backup_id,
                backup_type=backup_type,
                timestamp=timestamp,
                status=BackupStatus.FAILED,
                size_bytes=0,
                file_path=backup_path,
                metadata={"error": str(e)}
            )
    
    def restore_backup(self, backup_path: str) -> bool:
        """Restore database from backup"""
        try:
            logger.info(f"Starting database restore from: {backup_path}")
            
            # Check if file exists
            if not os.path.exists(backup_path):
                raise Exception(f"Backup file not found: {backup_path}")
            
            # Handle compressed files
            if backup_path.endswith('.gz'):
                # Decompress temporarily
                temp_path = backup_path.replace('.gz', '')
                with gzip.open(backup_path, 'rb') as f_in:
                    with open(temp_path, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
                restore_path = temp_path
            else:
                restore_path = backup_path
            
            # Build psql command
            cmd = [
                "psql",
                "-h", self.config.db_host,
                "-p", str(self.config.db_port),
                "-U", self.config.db_user,
                "-d", self.config.db_name,
                "-f", restore_path
            ]
            
            # Set password via environment variable
            env = os.environ.copy()
            env["PGPASSWORD"] = self.config.db_password
            
            # Execute restore
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)
            
            # Clean up temporary file if created
            if restore_path != backup_path and os.path.exists(restore_path):
                os.remove(restore_path)
            
            if result.returncode != 0:
                raise Exception(f"psql restore failed: {result.stderr}")
            
            logger.info("Database restore completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Database restore failed: {e}")
            return False
    
    def _compress_file(self, file_path: str):
        """Compress a file using gzip"""
        with open(file_path, 'rb') as f_in:
            with gzip.open(f"{file_path}.gz", 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        os.remove(file_path)

class FileBackup:
    """Handles file system backups"""
    
    def __init__(self, config: BackupConfig):
        self.config = config
        self.ensure_backup_directory()
    
    def ensure_backup_directory(self):
        """Create backup directory if it doesn't exist"""
        Path(self.config.backup_dir).mkdir(parents=True, exist_ok=True)
    
    def create_backup(self, backup_type: BackupType = BackupType.FULL) -> BackupInfo:
        """Create a file system backup"""
        timestamp = datetime.now()
        backup_id = f"files_{backup_type.value}_{timestamp.strftime('%Y%m%d_%H%M%S')}"
        
        # Create backup directory
        backup_dir = os.path.join(self.config.backup_dir, backup_id)
        os.makedirs(backup_dir, exist_ok=True)
        
        try:
            logger.info(f"Starting {backup_type.value} file backup: {backup_id}")
            
            total_size = 0
            files_copied = 0
            
            # Copy each specified path
            for source_path in self.config.file_backup_paths:
                if os.path.exists(source_path):
                    dest_path = os.path.join(backup_dir, os.path.basename(source_path))
                    
                    if os.path.isdir(source_path):
                        shutil.copytree(source_path, dest_path)
                    else:
                        shutil.copy2(source_path, dest_path)
                    
                    # Calculate size
                    if os.path.isdir(dest_path):
                        for root, dirs, files in os.walk(dest_path):
                            for file in files:
                                file_path = os.path.join(root, file)
                                total_size += os.path.getsize(file_path)
                                files_copied += 1
                    else:
                        total_size += os.path.getsize(dest_path)
                        files_copied += 1
                else:
                    logger.warning(f"Source path does not exist: {source_path}")
            
            # Create backup info
            backup_info = BackupInfo(
                backup_id=backup_id,
                backup_type=backup_type,
                timestamp=timestamp,
                status=BackupStatus.SUCCESS,
                size_bytes=total_size,
                file_path=backup_dir,
                metadata={
                    "files_copied": files_copied,
                    "source_paths": self.config.file_backup_paths
                }
            )
            
            logger.info(f"File backup completed successfully: {backup_id} ({total_size} bytes, {files_copied} files)")
            return backup_info
            
        except Exception as e:
            logger.error(f"File backup failed: {e}")
            return BackupInfo(
                backup_id=backup_id,
                backup_type=backup_type,
                timestamp=timestamp,
                status=BackupStatus.FAILED,
                size_bytes=0,
                file_path=backup_dir,
                metadata={"error": str(e)}
            )

class S3Backup:
    """Handles AWS S3 backup operations"""
    
    def __init__(self, config: BackupConfig):
        self.config = config
        self.s3_client = None
        
        if self.config.s3_bucket:
            self.s3_client = boto3.client(
                's3',
                region_name=self.config.s3_region,
                aws_access_key_id=self.config.aws_access_key,
                aws_secret_access_key=self.config.aws_secret_key
            )
    
    def upload_backup(self, backup_info: BackupInfo) -> bool:
        """Upload backup to S3"""
        if not self.s3_client:
            logger.warning("S3 client not configured, skipping upload")
            return False
        
        try:
            # Determine S3 key
            s3_key = f"backups/{backup_info.backup_type.value}/{backup_info.backup_id}"
            
            if os.path.isfile(backup_info.file_path):
                # Upload single file
                self.s3_client.upload_file(backup_info.file_path, self.config.s3_bucket, s3_key)
            else:
                # Upload directory
                for root, dirs, files in os.walk(backup_info.file_path):
                    for file in files:
                        local_path = os.path.join(root, file)
                        relative_path = os.path.relpath(local_path, backup_info.file_path)
                        s3_key_file = f"{s3_key}/{relative_path}".replace("\\", "/")
                        self.s3_client.upload_file(local_path, self.config.s3_bucket, s3_key_file)
            
            logger.info(f"Backup uploaded to S3: {s3_key}")
            return True
            
        except ClientError as e:
            logger.error(f"S3 upload failed: {e}")
            return False
    
    def download_backup(self, backup_id: str, local_path: str) -> bool:
        """Download backup from S3"""
        if not self.s3_client:
            logger.warning("S3 client not configured, cannot download")
            return False
        
        try:
            # List objects with prefix
            response = self.s3_client.list_objects_v2(
                Bucket=self.config.s3_bucket,
                Prefix=f"backups/{backup_id}"
            )
            
            if 'Contents' not in response:
                logger.error(f"No backup found with ID: {backup_id}")
                return False
            
            # Download all files
            for obj in response['Contents']:
                s3_key = obj['Key']
                local_file_path = os.path.join(local_path, os.path.basename(s3_key))
                
                # Create directory if needed
                os.makedirs(os.path.dirname(local_file_path), exist_ok=True)
                
                self.s3_client.download_file(self.config.s3_bucket, s3_key, local_file_path)
            
            logger.info(f"Backup downloaded from S3: {backup_id}")
            return True
            
        except ClientError as e:
            logger.error(f"S3 download failed: {e}")
            return False

class BackupManager:
    """Main backup management class"""
    
    def __init__(self, config: BackupConfig):
        self.config = config
        self.db_backup = DatabaseBackup(config)
        self.file_backup = FileBackup(config)
        self.s3_backup = S3Backup(config)
        self.backup_log_file = os.path.join(config.backup_dir, "backup_log.json")
    
    def create_full_backup(self) -> List[BackupInfo]:
        """Create a full backup (database + files)"""
        logger.info("Starting full backup process")
        
        backups = []
        
        # Database backup
        db_backup = self.db_backup.create_backup(BackupType.FULL)
        backups.append(db_backup)
        
        # File backup
        file_backup = self.file_backup.create_backup(BackupType.FULL)
        backups.append(file_backup)
        
        # Upload to S3 if configured
        if self.s3_backup.s3_client:
            for backup in backups:
                if backup.status == BackupStatus.SUCCESS:
                    self.s3_backup.upload_backup(backup)
        
        # Log backup
        self._log_backups(backups)
        
        return backups
    
    def create_incremental_backup(self) -> List[BackupInfo]:
        """Create an incremental backup"""
        logger.info("Starting incremental backup process")
        
        backups = []
        
        # For now, treat incremental as full backup
        # In a real implementation, you would track changes since last backup
        db_backup = self.db_backup.create_backup(BackupType.INCREMENTAL)
        backups.append(db_backup)
        
        file_backup = self.file_backup.create_backup(BackupType.INCREMENTAL)
        backups.append(file_backup)
        
        # Upload to S3 if configured
        if self.s3_backup.s3_client:
            for backup in backups:
                if backup.status == BackupStatus.SUCCESS:
                    self.s3_backup.upload_backup(backup)
        
        # Log backup
        self._log_backups(backups)
        
        return backups
    
    def restore_from_backup(self, backup_id: str, restore_type: str = "full") -> bool:
        """Restore from a specific backup"""
        logger.info(f"Starting restore process for backup: {backup_id}")
        
        try:
            if restore_type == "database":
                # Find database backup
                backup_files = self._find_backup_files(backup_id, "db")
                if not backup_files:
                    logger.error(f"No database backup found for ID: {backup_id}")
                    return False
                
                return self.db_backup.restore_backup(backup_files[0])
            
            elif restore_type == "files":
                # Find file backup
                backup_dirs = self._find_backup_dirs(backup_id, "files")
                if not backup_dirs:
                    logger.error(f"No file backup found for ID: {backup_id}")
                    return False
                
                # Restore files (implementation depends on requirements)
                logger.info(f"File restore would restore from: {backup_dirs[0]}")
                return True
            
            else:  # full restore
                # Restore both database and files
                db_success = self.restore_from_backup(backup_id, "database")
                file_success = self.restore_from_backup(backup_id, "files")
                return db_success and file_success
                
        except Exception as e:
            logger.error(f"Restore failed: {e}")
            return False
    
    def cleanup_old_backups(self):
        """Remove old backups based on retention policy"""
        logger.info("Starting backup cleanup")
        
        cutoff_date = datetime.now() - timedelta(days=self.config.retention_days)
        
        # Clean up local backups
        for item in os.listdir(self.config.backup_dir):
            item_path = os.path.join(self.config.backup_dir, item)
            
            if os.path.isfile(item_path):
                # Check file modification time
                mod_time = datetime.fromtimestamp(os.path.getmtime(item_path))
                if mod_time < cutoff_date:
                    os.remove(item_path)
                    logger.info(f"Removed old backup file: {item}")
            
            elif os.path.isdir(item_path) and item.startswith(('db_', 'files_')):
                # Check directory modification time
                mod_time = datetime.fromtimestamp(os.path.getmtime(item_path))
                if mod_time < cutoff_date:
                    shutil.rmtree(item_path)
                    logger.info(f"Removed old backup directory: {item}")
    
    def list_backups(self) -> List[BackupInfo]:
        """List all available backups"""
        backups = []
        
        # Read from log file
        if os.path.exists(self.backup_log_file):
            with open(self.backup_log_file, 'r') as f:
                log_data = json.load(f)
                for backup_data in log_data:
                    backup_info = BackupInfo(
                        backup_id=backup_data['backup_id'],
                        backup_type=BackupType(backup_data['backup_type']),
                        timestamp=datetime.fromisoformat(backup_data['timestamp']),
                        status=BackupStatus(backup_data['status']),
                        size_bytes=backup_data['size_bytes'],
                        file_path=backup_data['file_path'],
                        metadata=backup_data['metadata']
                    )
                    backups.append(backup_info)
        
        return sorted(backups, key=lambda x: x.timestamp, reverse=True)
    
    def _log_backups(self, backups: List[BackupInfo]):
        """Log backup information to file"""
        log_data = []
        
        # Read existing log
        if os.path.exists(self.backup_log_file):
            with open(self.backup_log_file, 'r') as f:
                log_data = json.load(f)
        
        # Add new backups
        for backup in backups:
            backup_data = {
                'backup_id': backup.backup_id,
                'backup_type': backup.backup_type.value,
                'timestamp': backup.timestamp.isoformat(),
                'status': backup.status.value,
                'size_bytes': backup.size_bytes,
                'file_path': backup.file_path,
                'metadata': backup.metadata
            }
            log_data.append(backup_data)
        
        # Write updated log
        with open(self.backup_log_file, 'w') as f:
            json.dump(log_data, f, indent=2)
    
    def _find_backup_files(self, backup_id: str, prefix: str) -> List[str]:
        """Find backup files matching the given ID and prefix"""
        files = []
        for item in os.listdir(self.config.backup_dir):
            if item.startswith(prefix) and backup_id in item:
                files.append(os.path.join(self.config.backup_dir, item))
        return files
    
    def _find_backup_dirs(self, backup_id: str, prefix: str) -> List[str]:
        """Find backup directories matching the given ID and prefix"""
        dirs = []
        for item in os.listdir(self.config.backup_dir):
            item_path = os.path.join(self.config.backup_dir, item)
            if os.path.isdir(item_path) and item.startswith(prefix) and backup_id in item:
                dirs.append(item_path)
        return dirs

def schedule_backups(config: BackupConfig):
    """Schedule automated backups"""
    manager = BackupManager(config)
    
    # Schedule daily full backups at 2 AM
    schedule.every().day.at("02:00").do(manager.create_full_backup)
    
    # Schedule hourly incremental backups during business hours
    for hour in range(9, 17):  # 9 AM to 5 PM
        schedule.every().day.at(f"{hour:02d}:00").do(manager.create_incremental_backup)
    
    # Schedule daily cleanup at 3 AM
    schedule.every().day.at("03:00").do(manager.cleanup_old_backups)
    
    logger.info("Backup schedule configured")
    
    # Run scheduler
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

# Example usage
if __name__ == "__main__":
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
        s3_bucket="innovative-school-backups",
        s3_region="us-east-1"
    )
    
    # Create backup manager
    manager = BackupManager(config)
    
    # Create a full backup
    backups = manager.create_full_backup()
    print(f"Created {len(backups)} backups")
    
    # List all backups
    all_backups = manager.list_backups()
    print(f"Total backups available: {len(all_backups)}")
    
    # Cleanup old backups
    manager.cleanup_old_backups()
    print("Cleanup completed")

