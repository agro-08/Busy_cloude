/* =====================================================================
   001 - Create database  (SQL Server 2017+)
   Run as a login with CREATE DATABASE permission (sa / sysadmin).
   ===================================================================== */
IF DB_ID(N'BusyOnCloud') IS NULL
BEGIN
    CREATE DATABASE [BusyOnCloud] COLLATE Latin1_General_100_CI_AS_SC_UTF8;
END
GO
