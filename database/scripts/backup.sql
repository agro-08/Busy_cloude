/* Manual full backup. Change the path to a folder SQL Server can write to. */
BACKUP DATABASE [BusyOnCloud]
TO DISK = N'C:\SQLBackups\BusyOnCloud.bak'
WITH INIT, COMPRESSION, CHECKSUM, STATS = 10;
GO
