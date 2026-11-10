/* =====================================================================
   Helper procedure: wipe all website content (admin login is kept).
   Used by the backend when "Reset website data" is run from the admin.
   ===================================================================== */
USE [BusyOnCloud];
GO
CREATE OR ALTER PROCEDURE dbo.usp_ClearSiteData
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRAN;
        DELETE FROM dbo.ProductFeatures;
        DELETE FROM dbo.Products;
        DELETE FROM dbo.SiteImages;
        DELETE FROM dbo.Settings;
        DELETE FROM dbo.Messages;
    COMMIT;
END
GO
