$ErrorActionPreference = "Stop"

function Get-CommandOutput {
  param([string]$Name, [string[]]$Arguments)

  $output = & $Name @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Name $($Arguments -join ' ') failed with exit code $LASTEXITCODE."
  }
  return $output
}

function Read-StatusValues {
  param([string]$Text)

  $values = @{}
  foreach ($line in ($Text -split "`r?`n")) {
    if ($line -match '^\s*(?:export\s+)?([A-Z_]+)=(?:"([^"]*)"|''([^'']*)''|(.+))\s*$') {
      $value = if ($Matches[2]) { $Matches[2] } elseif ($Matches[3]) { $Matches[3] } else { $Matches[4].Trim() }
      $values[$Matches[1]] = $value
    }
  }
  return $values
}

foreach ($command in @("docker", "supabase")) {
  if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
    throw "Required command '$command' was not found. Install Docker Desktop and the Supabase CLI, then run this script again."
  }
}

Get-CommandOutput "docker" @("info") | Out-Null
Set-Location $PSScriptRoot
Get-CommandOutput "supabase" @("start") | Out-Null
$statusText = (Get-CommandOutput "supabase" @("status", "-o", "env") | Out-String)
$status = Read-StatusValues $statusText

$apiUrl = $status["API_URL"]
$publishableKey = if ($status["PUBLISHABLE_KEY"]) { $status["PUBLISHABLE_KEY"] } else { $status["ANON_KEY"] }
$serviceRoleKey = if ($status["SECRET_KEY"]) { $status["SECRET_KEY"] } else { $status["SERVICE_ROLE_KEY"] }
if (-not $apiUrl -or -not $publishableKey -or -not $serviceRoleKey) {
  throw "Supabase CLI did not return API_URL and publishable/secret API keys. Run 'supabase status -o env' and check your CLI version."
}
if ($apiUrl -ne "http://127.0.0.1:54321") {
  throw "The local Supabase API is at an unexpected URL ($apiUrl); refusing to send setup credentials."
}

$email = (Read-Host "Local admin email").Trim()
if ($email -notmatch '^[^@\s]+@[^@\s]+\.[^@\s]+$') {
  throw "Enter a valid email address for the local admin."
}
$securePassword = Read-Host "Local admin password (12 or more characters)" -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
  $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
}
if ($password.Length -lt 12) {
  throw "The local admin password must contain at least 12 characters."
}

$headers = @{
  apikey = $serviceRoleKey
}
$userBody = @{
  email = $email
  password = $password
  email_confirm = $true
} | ConvertTo-Json -Compress

try {
  $user = Invoke-RestMethod -Method Post -Uri "$apiUrl/auth/v1/admin/users" -Headers $headers -ContentType "application/json" -Body $userBody
} catch {
  $loginHeaders = @{
    apikey = $publishableKey
  }
  $loginBody = @{
    email = $email
    password = $password
  } | ConvertTo-Json -Compress
  try {
    $session = Invoke-RestMethod -Method Post -Uri "$apiUrl/auth/v1/token?grant_type=password" -Headers $loginHeaders -ContentType "application/json" -Body $loginBody
    $user = $session.user
  } catch {
    throw "Could not create the local admin account or verify the password for an existing account. Check the email and password, then retry. $($_.Exception.Message)"
  } finally {
    $session = $null
    $loginBody = $null
  }
} finally {
  $password = $null
  $userBody = $null
}

$userId = $user.id
$user = $null
if (-not $userId -or $userId -notmatch '^[0-9a-fA-F-]{36}$') {
  throw "Supabase Auth did not return a valid user ID; the admin account was not allowlisted."
}
$allowlistBody = @{ user_id = $userId } | ConvertTo-Json -Compress
try {
  Invoke-RestMethod -Method Post -Uri "$apiUrl/rest/v1/admin_users" -Headers ($headers + @{ Prefer = "return=minimal" }) -ContentType "application/json" -Body $allowlistBody | Out-Null
} catch {
  throw "The Auth account was created, but adding it to the local admin allowlist failed. Check the local Supabase database and retry after resetting it if needed. $($_.Exception.Message)"
}

$configPath = Join-Path $PSScriptRoot "supabase-config.js"
$config = Get-Content $configPath -Raw
$localKeyPattern = 'publishableKey:\s*"YOUR_LOCAL_SUPABASE_PUBLISHABLE_KEY"'
if ($config -notmatch $localKeyPattern) {
  throw "Could not find the local publishable-key placeholder in supabase-config.js; no configuration was changed."
}
$config = [regex]::Replace($config, $localKeyPattern, "publishableKey: `"$publishableKey`"", 1)
Set-Content -Path $configPath -Value $config -Encoding utf8

Write-Host "Local Supabase is running. The application now uses its local publishable key only on localhost."
Write-Host "Local admin account created: $email"
Write-Host "Start the website in another terminal with: python -m http.server 5500 --bind 127.0.0.1"
Write-Host "Then open http://127.0.0.1:5500. No cloud project, service-role key, or external dashboard is used."
