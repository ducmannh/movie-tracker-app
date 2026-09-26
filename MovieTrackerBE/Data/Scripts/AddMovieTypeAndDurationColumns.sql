-- ====================================================================
-- SCRIPT BỔ SUNG CỘT PHÂN LOẠI PHIM (PHIM LẺ / PHIM BỘ) CHO MOVIETRACKER
-- Bao gồm: MovieType, DurationMinutes, Season, EpisodeCount
-- ====================================================================

USE MovieTrackerDb;
GO

-- 1. Bổ sung cột MovieType (Loại phim: 'Movie' - Phim lẻ | 'Series' - Phim bộ)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'MovieType')
BEGIN
    ALTER TABLE Movies ADD MovieType NVARCHAR(50) NOT NULL DEFAULT 'Movie';
    PRINT N'Đã bổ sung cột MovieType vào bảng Movies (Mặc định là "Movie").';
END
GO

-- 2. Bổ sung cột DurationMinutes (Thời lượng phút cho phim lẻ)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'DurationMinutes')
BEGIN
    ALTER TABLE Movies ADD DurationMinutes INT NULL;
    PRINT N'Đã bổ sung cột DurationMinutes vào bảng Movies.';
END
GO

-- 3. Bổ sung cột Season (Mùa chiếu cho phim bộ)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'Season')
BEGIN
    ALTER TABLE Movies ADD Season INT NULL;
    PRINT N'Đã bổ sung cột Season vào bảng Movies.';
END
GO

-- 4. Bổ sung cột EpisodeCount (Số tập cho phim bộ)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Movies') AND name = 'EpisodeCount')
BEGIN
    ALTER TABLE Movies ADD EpisodeCount INT NULL;
    PRINT N'Đã bổ sung cột EpisodeCount vào bảng Movies.';
END
GO

PRINT N'=====================================================';
PRINT N'CẬP NHẬT CẤU TRÚC BẢNG MOVIES THÀNH CÔNG!';
PRINT N'=====================================================';
GO
