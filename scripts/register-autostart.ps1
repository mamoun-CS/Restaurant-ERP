# Registration Script for Auto-Start on Windows Boot
$TaskName = "RestaurantERP_AutoStart"
$ScriptPath = Join-Path $PSScriptRoot "auto-start-service.bat"

Write-Host "Registering '$TaskName' to launch automatically at Windows Startup..." -ForegroundColor Cyan

# إزالة المهمة إذا كانت موجودة مسبقاً
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

# إنشاء إجراء تنفيذ السكريبت
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$ScriptPath`"" -WorkingDirectory (Split-Path $PSScriptRoot -Parent)

# التفعيل عند تسجيل دخول المستخدم (أو إقلاع النظام)
$Trigger = New-ScheduledTaskTrigger -AtLogOn

# الإعدادات: إعادة التشغيل في حال الفشل
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

# تسجيل المهمة
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Automatically starts Restaurant ERP and Print Agent on boot"

Write-Host "Successfully registered! The ERP will now start automatically whenever the computer boots." -ForegroundColor Green
