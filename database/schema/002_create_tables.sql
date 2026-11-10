/* =====================================================================
   002 - Tables
   ===================================================================== */
USE [BusyOnCloud];
GO

/* Website text settings (brandName, phone, hero text, stats ...) */
IF OBJECT_ID(N'dbo.Settings', N'U') IS NULL
CREATE TABLE dbo.Settings (
    SettingKey    NVARCHAR(100)  NOT NULL CONSTRAINT PK_Settings PRIMARY KEY,
    SettingValue  NVARCHAR(MAX)  NULL,
    UpdatedAt     DATETIME2(0)   NOT NULL CONSTRAINT DF_Settings_UpdatedAt DEFAULT SYSUTCDATETIME()
);
GO

/* Admin-replaced images, stored as data-URI (same format the frontend uses) */
IF OBJECT_ID(N'dbo.SiteImages', N'U') IS NULL
CREATE TABLE dbo.SiteImages (
    ImageKey   NVARCHAR(100) NOT NULL CONSTRAINT PK_SiteImages PRIMARY KEY,
    ImageData  NVARCHAR(MAX) NOT NULL,
    UpdatedAt  DATETIME2(0)  NOT NULL CONSTRAINT DF_SiteImages_UpdatedAt DEFAULT SYSUTCDATETIME()
);
GO

/* Pricing plans / VM plans */
IF OBJECT_ID(N'dbo.Products', N'U') IS NULL
CREATE TABLE dbo.Products (
    ProductId    NVARCHAR(50)   NOT NULL CONSTRAINT PK_Products PRIMARY KEY,
    ProductType  NVARCHAR(20)   NOT NULL CONSTRAINT DF_Products_Type DEFAULT N'user',
    Name         NVARCHAR(200)  NOT NULL,
    Price        NVARCHAR(100)  NOT NULL CONSTRAINT DF_Products_Price DEFAULT N'',
    Period       NVARCHAR(200)  NOT NULL CONSTRAINT DF_Products_Period DEFAULT N'',
    Badge        NVARCHAR(100)  NOT NULL CONSTRAINT DF_Products_Badge DEFAULT N'',
    Color        NVARCHAR(50)   NOT NULL CONSTRAINT DF_Products_Color DEFAULT N'sky',
    Image        NVARCHAR(MAX)  NOT NULL CONSTRAINT DF_Products_Image DEFAULT N'',
    Highlight    NVARCHAR(300)  NOT NULL CONSTRAINT DF_Products_Highlight DEFAULT N'',
    UsersLine    NVARCHAR(200)  NOT NULL CONSTRAINT DF_Products_UsersLine DEFAULT N'',
    Note         NVARCHAR(500)  NOT NULL CONSTRAINT DF_Products_Note DEFAULT N'',
    Link         NVARCHAR(1000) NOT NULL CONSTRAINT DF_Products_Link DEFAULT N'',
    ButtonText   NVARCHAR(100)  NOT NULL CONSTRAINT DF_Products_ButtonText DEFAULT N'',
    IsVisible    BIT            NOT NULL CONSTRAINT DF_Products_IsVisible DEFAULT 1,
    SortOrder    INT            NOT NULL CONSTRAINT DF_Products_SortOrder DEFAULT 0,
    CreatedAt    DATETIME2(0)   NOT NULL CONSTRAINT DF_Products_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt    DATETIME2(0)   NOT NULL CONSTRAINT DF_Products_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Products_Type CHECK (ProductType IN (N'user', N'vm'))
);
GO

/* Bullet-point features of a product */
IF OBJECT_ID(N'dbo.ProductFeatures', N'U') IS NULL
CREATE TABLE dbo.ProductFeatures (
    FeatureId    INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ProductFeatures PRIMARY KEY,
    ProductId    NVARCHAR(50)  NOT NULL,
    FeatureText  NVARCHAR(300) NOT NULL,
    SortOrder    INT           NOT NULL CONSTRAINT DF_ProductFeatures_Sort DEFAULT 0,
    CONSTRAINT FK_ProductFeatures_Products FOREIGN KEY (ProductId)
        REFERENCES dbo.Products (ProductId) ON DELETE CASCADE
);
GO
CREATE INDEX IX_ProductFeatures_ProductId ON dbo.ProductFeatures (ProductId, SortOrder);
GO

/* Customer enquiries shown in Admin > Messages */
IF OBJECT_ID(N'dbo.Messages', N'U') IS NULL
CREATE TABLE dbo.Messages (
    MessageId   NVARCHAR(50)   NOT NULL CONSTRAINT PK_Messages PRIMARY KEY,
    Name        NVARCHAR(200)  NOT NULL,
    Phone       NVARCHAR(50)   NOT NULL CONSTRAINT DF_Messages_Phone DEFAULT N'',
    Email       NVARCHAR(200)  NOT NULL CONSTRAINT DF_Messages_Email DEFAULT N'',
    Product     NVARCHAR(200)  NOT NULL CONSTRAINT DF_Messages_Product DEFAULT N'',
    MessageText NVARCHAR(MAX)  NOT NULL CONSTRAINT DF_Messages_Text DEFAULT N'',
    IsRead      BIT            NOT NULL CONSTRAINT DF_Messages_IsRead DEFAULT 0,
    CreatedAt   DATETIME2(0)   NOT NULL CONSTRAINT DF_Messages_CreatedAt DEFAULT SYSUTCDATETIME()
);
GO
CREATE INDEX IX_Messages_IsRead_CreatedAt ON dbo.Messages (IsRead, CreatedAt DESC);
GO

/* Admin login (scrypt hash + salt; plain password is never stored) */
IF OBJECT_ID(N'dbo.AdminUsers', N'U') IS NULL
CREATE TABLE dbo.AdminUsers (
    AdminId       INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_AdminUsers PRIMARY KEY,
    Username      NVARCHAR(100) NOT NULL CONSTRAINT UQ_AdminUsers_Username UNIQUE,
    PasswordSalt  VARCHAR(64)   NOT NULL,
    PasswordHash  VARCHAR(256)  NOT NULL,
    UpdatedAt     DATETIME2(0)  NOT NULL CONSTRAINT DF_AdminUsers_UpdatedAt DEFAULT SYSUTCDATETIME()
);
GO
