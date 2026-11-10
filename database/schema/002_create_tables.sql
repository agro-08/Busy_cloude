-- =====================================================================
-- 002 - Tables (MySQL 8.0+)
-- =====================================================================
USE `BusyOnCloud`;

-- Website text settings (brandName, phone, hero text, stats ...)
CREATE TABLE IF NOT EXISTS `Settings` (
    `SettingKey`    VARCHAR(100) NOT NULL,
    `SettingValue`  LONGTEXT     NULL,
    `UpdatedAt`     DATETIME(0)  NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
    PRIMARY KEY (`SettingKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin-replaced images, stored as data-URI (same format the frontend uses)
CREATE TABLE IF NOT EXISTS `SiteImages` (
    `ImageKey`   VARCHAR(100) NOT NULL,
    `ImageData`  LONGTEXT     NOT NULL,
    `UpdatedAt`  DATETIME(0)  NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
    PRIMARY KEY (`ImageKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pricing plans / VM plans
CREATE TABLE IF NOT EXISTS `Products` (
    `ProductId`    VARCHAR(50)   NOT NULL,
    `ProductType`  VARCHAR(20)   NOT NULL DEFAULT 'user',
    `Name`         VARCHAR(200)  NOT NULL,
    `Price`        VARCHAR(100)  NOT NULL DEFAULT '',
    `Period`       VARCHAR(200)  NOT NULL DEFAULT '',
    `Badge`        VARCHAR(100)  NOT NULL DEFAULT '',
    `Color`        VARCHAR(50)   NOT NULL DEFAULT 'sky',
    `Image`        LONGTEXT      NOT NULL,
    `Highlight`    VARCHAR(300)  NOT NULL DEFAULT '',
    `UsersLine`    VARCHAR(200)  NOT NULL DEFAULT '',
    `Note`         VARCHAR(500)  NOT NULL DEFAULT '',
    `Link`         VARCHAR(1000) NOT NULL DEFAULT '',
    `ButtonText`   VARCHAR(100)  NOT NULL DEFAULT '',
    `IsVisible`    TINYINT(1)    NOT NULL DEFAULT 1,
    `SortOrder`    INT           NOT NULL DEFAULT 0,
    `CreatedAt`    DATETIME(0)   NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `UpdatedAt`    DATETIME(0)   NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
    PRIMARY KEY (`ProductId`),
    CONSTRAINT `CK_Products_Type` CHECK (`ProductType` IN ('user', 'vm'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bullet-point features of a product
CREATE TABLE IF NOT EXISTS `ProductFeatures` (
    `FeatureId`    INT          NOT NULL AUTO_INCREMENT,
    `ProductId`    VARCHAR(50)  NOT NULL,
    `FeatureText`  VARCHAR(300) NOT NULL,
    `SortOrder`    INT          NOT NULL DEFAULT 0,
    PRIMARY KEY (`FeatureId`),
    KEY `IX_ProductFeatures_ProductId` (`ProductId`, `SortOrder`),
    CONSTRAINT `FK_ProductFeatures_Products` FOREIGN KEY (`ProductId`)
        REFERENCES `Products` (`ProductId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customer enquiries shown in Admin > Messages
CREATE TABLE IF NOT EXISTS `Messages` (
    `MessageId`   VARCHAR(50)   NOT NULL,
    `Name`        VARCHAR(200)  NOT NULL,
    `Phone`       VARCHAR(50)   NOT NULL DEFAULT '',
    `Email`       VARCHAR(200)  NOT NULL DEFAULT '',
    `Product`     VARCHAR(200)  NOT NULL DEFAULT '',
    `MessageText` LONGTEXT      NOT NULL,
    `IsRead`      TINYINT(1)    NOT NULL DEFAULT 0,
    `CreatedAt`   DATETIME(0)   NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    PRIMARY KEY (`MessageId`),
    KEY `IX_Messages_IsRead_CreatedAt` (`IsRead`, `CreatedAt` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin login (scrypt hash + salt; plain password is never stored)
CREATE TABLE IF NOT EXISTS `AdminUsers` (
    `AdminId`       INT          NOT NULL AUTO_INCREMENT,
    `Username`      VARCHAR(100) NOT NULL,
    `PasswordSalt`  VARCHAR(64)  NOT NULL,
    `PasswordHash`  VARCHAR(256) NOT NULL,
    `UpdatedAt`     DATETIME(0)  NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
    PRIMARY KEY (`AdminId`),
    UNIQUE KEY `UQ_AdminUsers_Username` (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
