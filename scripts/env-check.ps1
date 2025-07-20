
Write-Host "🔍 Checking Node.js and npm versions..." -ForegroundColor Cyan

$expectedNode = "22.17.0"
$expectedNpm = "11.4.2"

$nodeVersion = node -v
$npmVersion = npm -v

Write-Host "`nNode.js version: $nodeVersion"
Write-Host "npm version: $npmVersion`n"

if ($nodeVersion -eq "v$expectedNode") {
    Write-Host "✅ Node.js version is correct." -ForegroundColor Green
} else {
    Write-Host "❌ Node.js version mismatch. Expected v$expectedNode" -ForegroundColor Red
}

if ($npmVersion -eq $expectedNpm) {
    Write-Host "✅ npm version is correct." -ForegroundColor Green
} else {
    Write-Host "❌ npm version mismatch. Expected $expectedNpm" -ForegroundColor Red
}

Write-Host "`n📦 Checking for extraneous modules..." -ForegroundColor Cyan
npm ls --depth=0 | Select-String "extraneous"

Write-Host "`nDone."
