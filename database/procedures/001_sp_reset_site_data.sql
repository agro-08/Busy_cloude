-- =====================================================================
-- Helper procedure: wipe all website content (admin login is kept).
-- Used when "Reset website data" is triggered.
-- =====================================================================
USE `BusyOnCloud`;

DROP PROCEDURE IF EXISTS `usp_ClearSiteData`;

DELIMITER $$
CREATE PROCEDURE `usp_ClearSiteData`()
BEGIN
    START TRANSACTION;
        DELETE FROM `ProductFeatures`;
        DELETE FROM `Products`;
        DELETE FROM `SiteImages`;
        DELETE FROM `Settings`;
        DELETE FROM `Messages`;
    COMMIT;
END$$
DELIMITER ;
