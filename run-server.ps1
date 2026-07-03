Set-Location 'c:\Users\pc\Desktop\omji new site'
Start-Transcript -Path 'c:\Users\pc\Desktop\omji new site\powershell-log.txt' -Force
Write-Host "Current Path: $env:Path"
npm run dev -- --host --port 4321
Stop-Transcript
