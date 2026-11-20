/* ============================================================================
   0003_seed_roles.sql
   ----------------------------------------------------------------------------
   داده‌های پایه‌ای که برنامه برای کارکردن به آن‌ها نیاز دارد.
   بقیه‌ی داده‌ها (کاربر ادمین پیش‌فرض، دسته‌بندی‌ها) هنگام بالا آمدن API توسط
   DbInitializer ساخته می‌شوند؛ ولی این اسکریپت هم می‌تواند آن‌ها را بسازد.
   اجرای دوباره‌ی اسکریپت هیچ رکورد تکراری ایجاد نمی‌کند (idempotent).
   ============================================================================ */

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* ۱) نقش‌های پایه */
IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [Name] = N'Admin')
    INSERT INTO [dbo].[Roles] ([Name], [Description], [CreatedAt], [IsDeleted])
    VALUES (N'Admin', N'مدیر سیستم', SYSDATETIME(), 0);
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [Name] = N'Manager')
    INSERT INTO [dbo].[Roles] ([Name], [Description], [CreatedAt], [IsDeleted])
    VALUES (N'Manager', N'مدیر فروشگاه', SYSDATETIME(), 0);
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[Roles] WHERE [Name] = N'User')
    INSERT INTO [dbo].[Roles] ([Name], [Description], [CreatedAt], [IsDeleted])
    VALUES (N'User', N'کاربر عادی', SYSDATETIME(), 0);
GO

/* ۲) دسته‌بندی‌های پیش‌فرض (فقط اگر جدول خالی باشد) */
IF NOT EXISTS (SELECT 1 FROM [dbo].[Categories] WHERE [IsDeleted] = 0)
BEGIN
    INSERT INTO [dbo].[Categories] ([Name], [Slug], [Description], [ParentCategoryId], [ImageUrl], [DisplayOrder], [IsActive], [CreatedAt], [IsDeleted])
    VALUES
        (N'پوشاک',                 N'clothing',    N'انواع لباس کودک',            NULL, NULL, 1, 1, SYSDATETIME(), 0),
        (N'اسباب بازی',            N'toys',        N'انواع اسباب بازی',            NULL, NULL, 2, 1, SYSDATETIME(), 0),
        (N'لوازم بهداشتی',         N'care',        N'لوازم بهداشتی کودک',          NULL, NULL, 3, 1, SYSDATETIME(), 0),
        (N'کتاب و لوازم تحریر',    N'books',       N'کتاب و لوازم تحریر کودک',     NULL, NULL, 4, 1, SYSDATETIME(), 0),
        (N'تغذیه',                 N'feeding',     N'لوازم تغذیه کودک',            NULL, NULL, 5, 1, SYSDATETIME(), 0),
        (N'کالسکه و صندلی ماشین',  N'strollers',   N'کالسکه و صندلی ماشین کودک',   NULL, NULL, 6, 1, SYSDATETIME(), 0),
        (N'تجهیزات اتاق کودک',     N'nursery',     N'تجهیزات اتاق کودک',           NULL, NULL, 7, 1, SYSDATETIME(), 0);
    PRINT 'default categories inserted';
END
GO

/* ----------------------------------------------------------------------------
   ۳) ارتقای یک کاربر به نقش مدیر
   کاربر اول را از طریق /api/Auth/register بسازید، سپس شماره‌اش را اینجا بگذارید
   و این بلوک را اجرا کنید. (نام نقش باید Admin یا Manager باشد)
   ---------------------------------------------------------------------------- */
-- DECLARE @Phone nvarchar(20) = N'09123456789';   -- شماره کاربر
-- DECLARE @RoleName nvarchar(50) = N'Admin';      -- Admin یا Manager
--
-- INSERT INTO [dbo].[UserRoles] ([UserId], [RoleId], [CreatedAt], [IsDeleted])
-- SELECT u.[Id], r.[Id], SYSDATETIME(), 0
-- FROM [dbo].[Users] u
-- CROSS JOIN [dbo].[Roles] r
-- WHERE u.[PhoneNumber] = @Phone
--   AND r.[Name] = @RoleName
--   AND NOT EXISTS (
--       SELECT 1 FROM [dbo].[UserRoles] ur
--       WHERE ur.[UserId] = u.[Id] AND ur.[RoleId] = r.[Id]
--   );

/* ----------------------------------------------------------------------------
   ۴) بررسی سریع پس از اجرا
   ---------------------------------------------------------------------------- */
-- SELECT [Name] FROM [dbo].[Roles];
-- SELECT COUNT(*) AS Products FROM [dbo].[Products];
-- SELECT COUNT(*) AS Inventories FROM [dbo].[Inventories];
-- SELECT * FROM [dbo].[__EFMigrationsHistory];
