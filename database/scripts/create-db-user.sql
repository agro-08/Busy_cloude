/* =====================================================================
   Least-privilege SQL login for the backend (do NOT use 'sa' in .env).
   CHANGE THE PASSWORD before running.
   ===================================================================== */
USE [master];
GO
IF SUSER_ID(N'boc_app') IS NULL
    CREATE LOGIN [boc_app] WITH PASSWORD = N'ChangeMe#StrongPassword1', CHECK_POLICY = ON;
GO
USE [BusyOnCloud];
GO
IF USER_ID(N'boc_app') IS NULL
    CREATE USER [boc_app] FOR LOGIN [boc_app];
GO
ALTER ROLE db_datareader ADD MEMBER [boc_app];
ALTER ROLE db_datawriter ADD MEMBER [boc_app];
GRANT EXECUTE ON SCHEMA::dbo TO [boc_app];
GO
