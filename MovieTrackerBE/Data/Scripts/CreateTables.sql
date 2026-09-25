-- ====================================================================
-- Script tạo Database và bảng Users cho MovieTracker (SQL Server)
-- ====================================================================

-- 1. Tạo Database nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'MovieTrackerDb')
BEGIN
    CREATE DATABASE MovieTrackerDb;
    PRINT N'Cơ sở dữ liệu MovieTrackerDb đã được tạo.';
END
GO

USE MovieTrackerDb;
GO

-- 2. Tạo bảng Users nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Username NVARCHAR(50) NOT NULL UNIQUE,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        FullName NVARCHAR(100) NULL,
        RefreshToken NVARCHAR(500) NULL,
        RefreshTokenExpiryTime DATETIME2 NULL
    );

    CREATE INDEX IX_Users_Email ON Users(Email);
    CREATE INDEX IX_Users_Username ON Users(Username);
    CREATE INDEX IX_Users_RefreshToken ON Users(RefreshToken);

    PRINT N'Bảng Users đã được tạo thành công.';
END
ELSE
BEGIN
    -- Nếu bảng đã tồn tại từ trước, tự động bổ sung cột RefreshToken nếu chưa có
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'RefreshToken')
    BEGIN
        ALTER TABLE Users ADD RefreshToken NVARCHAR(500) NULL;
        ALTER TABLE Users ADD RefreshTokenExpiryTime DATETIME2 NULL;
        CREATE INDEX IX_Users_RefreshToken ON Users(RefreshToken);
        PRINT N'Đã bổ sung cột RefreshToken và RefreshTokenExpiryTime vào bảng Users.';
    END
    ELSE
    BEGIN
        PRINT N'Bảng Users và các cột RefreshToken đã tồn tại từ trước.';
    END
END
GO
