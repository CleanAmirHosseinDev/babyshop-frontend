/* ============================================================================
   0002_catchup_age_range.sql
   ----------------------------------------------------------------------------
   هم‌راستاسازی دیتابیس با مدل دامنه در مواردی که مایگریشن EF پوشش نمی‌دهد.
   این اسکریپت همان کارهایی را می‌کند که DbInitializer هنگام بالا آمدن API انجام
   می‌دهد، ولی به‌صورت مستقل و فقط یک‌بار روی دیتابیس قابل اجراست (idempotent).
   اجرای دوباره‌ی آن هیچ خطایی نمی‌دهد.
   ============================================================================ */

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* ۱) ستون AgeRange در Inventories (موجودی به تفکیک سایز/رده سنی) */
IF OBJECT_ID(N'[dbo].[Inventories]', N'U') IS NOT NULL
   AND COL_LENGTH('Inventories', 'AgeRange') IS NULL
BEGIN
    ALTER TABLE [dbo].[Inventories] ADD [AgeRange] nvarchar(50) NULL;
    PRINT 'Inventories.AgeRange added';
END
GO

/* ۲) ایندکس قدیمی یکتای ProductId که اجازه‌ی چند سایز برای یک محصول را نمی‌داد */
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Inventories_ProductId')
BEGIN
    DROP INDEX [IX_Inventories_ProductId] ON [dbo].[Inventories];
    PRINT 'legacy index IX_Inventories_ProductId dropped';
END
GO

/* ۳) ایندکس یکتای ترکیبی (محصول + سایز) */
IF OBJECT_ID(N'[dbo].[Inventories]', N'U') IS NOT NULL
   AND COL_LENGTH('Inventories', 'AgeRange') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Inventories_Product_AgeRange')
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [IX_Inventories_Product_AgeRange]
        ON [dbo].[Inventories] ([ProductId], [AgeRange])
        WHERE [IsDeleted] = 0 AND [AgeRange] IS NOT NULL;
    PRINT 'index IX_Inventories_Product_AgeRange created';
END
GO

/* ۴) ستون‌های امتیازی/آماری گزارش‌ها در صورت نبود (نسخه‌های قدیمی دیتابیس) */
IF OBJECT_ID(N'[dbo].[Reports]', N'U') IS NOT NULL
   AND COL_LENGTH('Reports', 'IsDeleted') IS NULL
BEGIN
    ALTER TABLE [dbo].[Reports] ADD [IsDeleted] bit NOT NULL CONSTRAINT DF_Reports_IsDeleted DEFAULT(0);
    PRINT 'Reports.IsDeleted added';
END
GO
