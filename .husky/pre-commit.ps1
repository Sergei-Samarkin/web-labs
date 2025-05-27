Set-Location -Path "$PSScriptRoot\..\backend"
if (-not $?) { exit 1 }
Write-Host "Running lint-staged in $PWD"
& npm run lint-staged
