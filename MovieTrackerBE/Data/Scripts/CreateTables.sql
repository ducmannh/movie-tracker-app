-- ====================================================================
-- SCRIPT TẠO CƠ SỞ DỮ LIỆU & CÁC BẢNG CHO MOVIETRACKER (SQL SERVER)
-- Bao gồm: Users, Movies (Quản lý phim cá nhân thuần túy)
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

-- ====================================================================
-- 2. Tạo bảng Users (Tài khoản người dùng & Phiên đăng nhập)
-- ====================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Username NVARCHAR(50) NOT NULL UNIQUE,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        FullName NVARCHAR(100) NULL,
        RefreshToken NVARCHAR(500) NULL,
        RefreshTokenExpiryTime DATETIME2 NULL,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE()
    );

    CREATE INDEX IX_Users_Email ON Users(Email);
    CREATE INDEX IX_Users_Username ON Users(Username);
    CREATE INDEX IX_Users_RefreshToken ON Users(RefreshToken);

    PRINT N'Bảng Users đã được tạo thành công.';
END
ELSE
BEGIN
    -- Đảm bảo có cột RefreshToken nếu bảng Users đã tồn tại trước đó
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'RefreshToken')
    BEGIN
        ALTER TABLE Users ADD RefreshToken NVARCHAR(500) NULL;
        ALTER TABLE Users ADD RefreshTokenExpiryTime DATETIME2 NULL;
        CREATE INDEX IX_Users_RefreshToken ON Users(RefreshToken);
        PRINT N'Đã bổ sung cột RefreshToken vào bảng Users.';
    END
END
GO

-- ====================================================================
-- 3. Tạo bảng Movies (Lưu trữ phim trực tiếp theo từng người dùng)
-- ====================================================================

-- Dọn dẹp bảng UserMovies cũ nếu có từ cấu trúc trước
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'UserMovies')
BEGIN
    DROP TABLE UserMovies;
    PRINT N'Đã xóa bảng UserMovies cũ.';
END
GO

-- Nếu bảng Movies cũ có cấu trúc TMDB (chưa có cột UserId), drop để tạo bảng mới chuẩn
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Movies' AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'UserId'))
BEGIN
    DROP TABLE Movies;
    PRINT N'Đã làm mới cấu trúc bảng Movies.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Movies')
BEGIN
    CREATE TABLE Movies (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId UNIQUEIDENTIFIER NOT NULL,
        Title NVARCHAR(MAX) NOT NULL,
        MovieType NVARCHAR(50) NOT NULL DEFAULT 'Movie', -- 'Movie' (Phim lẻ) | 'Series' (Phim bộ)
        DurationMinutes INT NULL,                       -- Thời lượng phim lẻ (phút)
        Season INT NULL,                                -- Mùa phim (Series)
        EpisodeCount INT NULL,                          -- Số tập (Series)
        ReleaseYear INT NULL,
        Genre NVARCHAR(MAX) NULL,
        Language NVARCHAR(MAX) NULL,
        Actors NVARCHAR(MAX) NULL,
        PosterUrl NVARCHAR(MAX) NULL,
        TrailerUrl NVARCHAR(MAX) NULL,
        Overview NVARCHAR(MAX) NULL,
        Status NVARCHAR(MAX) NOT NULL DEFAULT 'Watched', -- 'Watched' (Đã xem) | 'PlanToWatch' (Sẽ xem)
        Rating FLOAT NULL,                              -- Điểm cá nhân: 0.0 - 10.0
        WatchedAt DATETIME2 NULL,                      -- Thời gian xem phim
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),

        -- Khóa ngoại liên kết với Users: khi xóa user thì tự xóa toàn bộ phim của user đó
        CONSTRAINT FK_Movies_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );

    -- Chỉ tạo Index trên UserId (khóa ngoại) vì cột NVARCHAR(MAX) không thể dùng làm khóa Index thông thường
    CREATE INDEX IX_Movies_UserId ON Movies(UserId);

    PRINT N'Bảng Movies đã được tạo thành công với toàn bộ trường text là NVARCHAR(MAX).';
END
ELSE
BEGIN
    -- 1. Xóa các Index cũ (nếu có) trên các cột Text vì SQL Server không cho phép Index trên NVARCHAR(MAX)
    IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Movies_Title' AND object_id = OBJECT_ID('Movies'))
    BEGIN
        DROP INDEX IX_Movies_Title ON Movies;
        PRINT N'Đã xóa Index IX_Movies_Title cũ.';
    END

    IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Movies_Status' AND object_id = OBJECT_ID('Movies'))
    BEGIN
        DROP INDEX IX_Movies_Status ON Movies;
        PRINT N'Đã xóa Index IX_Movies_Status cũ.';
    END

    -- 2. Chuyển đổi toàn bộ các trường Text hiện có sang NVARCHAR(MAX)
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'Title')
        ALTER TABLE Movies ALTER COLUMN Title NVARCHAR(MAX) NOT NULL;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'Genre')
        ALTER TABLE Movies ALTER COLUMN Genre NVARCHAR(MAX) NULL;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'PosterUrl')
        ALTER TABLE Movies ALTER COLUMN PosterUrl NVARCHAR(MAX) NULL;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'Overview')
        ALTER TABLE Movies ALTER COLUMN Overview NVARCHAR(MAX) NULL;

    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'Status')
        ALTER TABLE Movies ALTER COLUMN Status NVARCHAR(MAX) NOT NULL;

    -- 3. Bổ sung hoặc nâng cấp cột Actors sang NVARCHAR(MAX)
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'Actors')
    BEGIN
        ALTER TABLE Movies ADD Actors NVARCHAR(MAX) NULL;
        PRINT N'Đã bổ sung cột Actors NVARCHAR(MAX) vào bảng Movies.';
    END
    ELSE
    BEGIN
        ALTER TABLE Movies ALTER COLUMN Actors NVARCHAR(MAX) NULL;
        PRINT N'Đã cập nhật cột Actors sang NVARCHAR(MAX).';
    END

    -- 4. Bổ sung cột Language vào bảng Movies nếu chưa có
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'Language')
    BEGIN
        ALTER TABLE Movies ADD Language NVARCHAR(MAX) NULL;
        PRINT N'Đã bổ sung cột Language NVARCHAR(MAX) vào bảng Movies.';
    END

    -- 5. Bổ sung các cột phân loại Phim lẻ / Phim bộ
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'MovieType')
    BEGIN
        ALTER TABLE Movies ADD MovieType NVARCHAR(50) NOT NULL DEFAULT 'Movie';
        PRINT N'Đã bổ sung cột MovieType vào bảng Movies.';
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'DurationMinutes')
    BEGIN
        ALTER TABLE Movies ADD DurationMinutes INT NULL;
        PRINT N'Đã bổ sung cột DurationMinutes vào bảng Movies.';
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'Season')
    BEGIN
        ALTER TABLE Movies ADD Season INT NULL;
        PRINT N'Đã bổ sung cột Season vào bảng Movies.';
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'EpisodeCount')
    BEGIN
        ALTER TABLE Movies ADD EpisodeCount INT NULL;
        PRINT N'Đã bổ sung cột EpisodeCount vào bảng Movies.';
    END

    -- 6. Bổ sung cột TrailerUrl (Video Trailer YouTube)
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'TrailerUrl')
    BEGIN
        ALTER TABLE Movies ADD TrailerUrl NVARCHAR(MAX) NULL;
        PRINT N'Đã bổ sung cột TrailerUrl vào bảng Movies.';
    END

    PRINT N'Toàn bộ trường trong bảng Movies đã được đồng bộ thành công.';
END
GO

-- ====================================================================
-- 4. Tạo bảng Genres (Danh mục Thể loại phim cấu hình được)
-- ====================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Genres')
BEGIN
    CREATE TABLE Genres (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId UNIQUEIDENTIFIER NULL, -- NULL: Mặc định hệ thống, có UserId: do người dùng tự thêm
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(255) NULL,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Genres_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );

    CREATE INDEX IX_Genres_UserId ON Genres(UserId);
    PRINT N'Bảng Genres đã được tạo thành công.';
END
GO

-- Chèn thể loại mặc định
IF NOT EXISTS (SELECT 1 FROM Genres WHERE UserId IS NULL)
BEGIN
    INSERT INTO Genres (UserId, Name, Description) VALUES
    (NULL, N'Hành động', N'Phim có nhiều cảnh hành động, rượt đuổi, võ thuật'),
    (NULL, N'Hài hước', N'Phim mang tính giải trí, hài hước, gây cười'),
    (NULL, N'Kinh dị', N'Phim rùng rợn, giật gân, hồi hộp'),
    (NULL, N'Tâm lý', N'Phim khai thác sâu sắc tâm lý và số phận nhân vật'),
    (NULL, N'Hoạt hình', N'Phim hoạt họa, anime, đồ họa 3D'),
    (NULL, N'Khoa học viễn tưởng', N'Phim du hành thời gian, vũ trụ, công nghệ tương lai'),
    (NULL, N'Lãng mạn', N'Phim tình cảm đôi lứa ngọt ngào hoặc trắc trở'),
    (NULL, N'Tội phạm', N'Phim về trinh thám, phá án, thế giới ngầm'),
    (NULL, N'Gia đình', N'Phim dành cho mọi lứa tuổi gia đình'),
    (NULL, N'Phiêu lưu', N'Phim khám phá, thám hiểm các vùng đất mới'),
    (NULL, N'Bí ẩn', N'Phim chứa đựng các nút thắt ly kỳ, bí ẩn'),
    (NULL, N'Chiến tranh', N'Phim tái hiện lịch sử hoặc các cuộc chiến ác liệt'),
    (NULL, N'Tài liệu', N'Phim ghi chép sự kiện, con người thực tế'),
    (NULL, N'Âm nhạc', N'Phim ca vũ nhạc kịch'),
    (NULL, N'Giật gân', N'Phim tạo sự căng thẳng tột độ (Thriller)'),
    (NULL, N'Cổ trang', N'Phim lịch sử, trang phục thời xưa'),
    (NULL, N'Võ thuật', N'Phim kungfu, kiếm hiệp, võ đạo'),
    (NULL, N'Kỳ ảo', N'Phim ma thuật, thế giới giả tưởng (Fantasy)');

    PRINT N'Đã chèn danh mục Thể loại mặc định.';
END
GO

-- ====================================================================
-- 5. Tạo bảng Languages (Danh mục Ngôn ngữ trong phim)
-- ====================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Languages')
BEGIN
    CREATE TABLE Languages (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        UserId UNIQUEIDENTIFIER NULL, -- NULL: Mặc định hệ thống, có UserId: do người dùng tự thêm
        Name NVARCHAR(100) NOT NULL,
        Code NVARCHAR(20) NULL,      -- Mã ngôn ngữ (vi, en, ko, ja, zh, fr, v.v.)
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Languages_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );

    CREATE INDEX IX_Languages_UserId ON Languages(UserId);
    PRINT N'Bảng Languages đã được tạo thành công.';
END
GO

-- Chèn ngôn ngữ mặc định
IF NOT EXISTS (SELECT 1 FROM Languages WHERE UserId IS NULL)
BEGIN
    INSERT INTO Languages (UserId, Name, Code) VALUES
    (NULL, N'Tiếng Việt', 'vi'),
    (NULL, N'Tiếng Anh', 'en'),
    (NULL, N'Tiếng Hàn', 'ko'),
    (NULL, N'Tiếng Nhật', 'ja'),
    (NULL, N'Tiếng Trung', 'zh'),
    (NULL, N'Tiếng Pháp', 'fr'),
    (NULL, N'Tiếng Tây Ban Nha', 'es'),
    (NULL, N'Tiếng Đức', 'de'),
    (NULL, N'Tiếng Thái', 'th'),
    (NULL, N'Tiếng Nga', 'ru'),
    (NULL, N'Tiếng Ấn Độ (Hindi)', 'hi'),
    (NULL, N'Tiếng Ý', 'it'),
    (NULL, N'Tiếng Bồ Đào Nha', 'pt');

    PRINT N'Đã chèn danh mục Ngôn ngữ mặc định.';
END
GO

PRINT N'=====================================================';
PRINT N'HOÀN TẤT THIẾT LẬP CƠ SỞ DỮ LIỆU MOVIETRACKER!';
PRINT N'=====================================================';
GO
