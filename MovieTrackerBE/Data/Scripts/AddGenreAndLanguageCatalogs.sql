-- ====================================================================
-- SCRIPT BỔ SUNG BẢNG DANH MỤC THỂ LOẠI & NGÔN NGỮ (SQL SERVER)
-- ====================================================================
USE MovieTrackerDb;
GO

-- 1. Tạo bảng Danh mục Thể loại (Genres) nếu chưa tồn tại
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

-- 2. Tạo bảng Danh mục Ngôn ngữ (Languages) nếu chưa tồn tại
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

-- 3. Bổ sung cột Language vào bảng Movies nếu chưa có
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'Language')
BEGIN
    ALTER TABLE Movies ADD Language NVARCHAR(MAX) NULL;
    PRINT N'Đã bổ sung cột Language NVARCHAR(MAX) vào bảng Movies.';
END
GO

-- 4. Chèn dữ liệu mẫu cho Thể loại (Genres) mặc định nếu chưa có
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

-- 5. Chèn dữ liệu mẫu cho Ngôn ngữ (Languages) mặc định nếu chưa có
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
PRINT N'HOÀN TẤT BỔ SUNG BẢNG GENRES & LANGUAGES CHO MOVIETRACKER!';
PRINT N'=====================================================';
GO
