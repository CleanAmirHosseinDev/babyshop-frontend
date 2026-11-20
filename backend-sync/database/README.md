# مایگریشن دیتابیس BabyShop (SQL Server / LocalDB)

این پوشه اسکریپت‌های آماده‌ی «کل مایگریشن» بک‌اند است. همه‌ی اسکریپت‌ها
**idempotent** هستند؛ یعنی اجرای دوباره‌ی آن‌ها خطا نمی‌دهد و داده‌ی موجود را خراب نمی‌کند.

| فایل | کاربرد |
| --- | --- |
| `0001_migrations_idempotent.sql` | خروجی رسمی EF Core (`dotnet ef migrations script --idempotent`) برای هر سه مایگریشن پروژه: `InitialCreate`، `AddSupportTicketTables_Manual`، `AddReportTable`. روی دیتابیس خالی همه‌ی جدول‌ها را می‌سازد و روی دیتابیس موجود فقط مایگریشن‌های اجرانشده را اعمال می‌کند (با تکیه بر `__EFMigrationsHistory`). |
| `0002_catchup_age_range.sql` | پرکردن فاصله‌ی مدل با دیتابیس: ستون `Inventories.AgeRange`، حذف ایندکس قدیمی `IX_Inventories_ProductId` و ساخت ایندکس یکتای `(ProductId, AgeRange)`. دقیقاً همان اصلاحاتی که `DbInitializer` هنگام اجرا انجام می‌دهد. |
| `0003_seed_roles.sql` | داده‌ی پایه: نقش‌های `Admin` / `Manager` / `User`، دسته‌بندی‌های پیش‌فرض و یک بلوک آماده برای ارتقای کاربر به مدیر. |

## ترتیب اجرا

```bash
# با sqlcmd (ویندوز / لینوکس)
sqlcmd -S "(localdb)\\MSSQLLocalDB" -E -i backend-sync/database/0001_migrations_idempotent.sql
sqlcmd -S "(localdb)\\MSSQLLocalDB" -E -d BabyShopDb -i backend-sync/database/0002_catchup_age_range.sql
sqlcmd -S "(localdb)\\MSSQLLocalDB" -E -d BabyShopDb -i backend-sync/database/0003_seed_roles.sql
```

یا در SQL Server Management Studio هر سه فایل را به‌ترتیب باز و اجرا کنید.

## نکات مهم

- اسکریپت `0001` خودش دیتابیس `BabyShopDb` را در صورت نبود می‌سازد؛ پس فقط کافی است
  روی سرور لوکال اجرا شود.
- رشته اتصال API (`appsettings.json` → `ConnectionStrings:Default`) باید به همین دیتابیس
  اشاره کند. اگر نام دیتابیس را عوض کردید، ابتدا `USE [نام جدید]` را در بالای `0002` و `0003`
  اضافه کنید.
- کاربر ادمین پیش‌فرض و محصولات نمونه توسط `DbInitializer` هنگام بالا آمدن API ساخته می‌شوند
  (`09123456789` / `Admin@123` در محیط Development).
- **هشدار مدل:** مدل دامنه از آخرین مایگریشن جلوتر است؛ اجرای
  `dotnet ef migrations has-pending-model-changes` پیام «Changes have been made to the model
  since the last migration» می‌دهد. اگر مایگریشن جدید بسازید، EF چند `DropColumn` پیشنهاد
  می‌کند (چون snapshot عقب است) — آن مایگریشن را بدون بازبینی اعمال نکنید. برای همین،
  هم‌راستاسازی واقعی را در `0002` به‌صورت دستی و ایمن نگه داشته‌ایم.
