$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$output = Join-Path $root "_site"
$url = [Environment]::GetEnvironmentVariable("SUPABASE_URL")
$key = [Environment]::GetEnvironmentVariable("SUPABASE_PUBLISHABLE_KEY")
if ($null -eq $url) { $url = "" }
if ($null -eq $key) { $key = "" }
$url = $url.Trim().TrimEnd("/")
$key = $key.Trim()

if ($url -notmatch '^https://[a-z0-9-]+\.supabase\.co$') {
  throw "SUPABASE_URL must be the exact HTTPS project URL, for example https://your-project-ref.supabase.co."
}

if ($key -notmatch '^sb_publishable_[A-Za-z0-9_-]+$') {
  if ($key -notmatch '^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$') {
    throw "SUPABASE_PUBLISHABLE_KEY must be a Supabase publishable key (sb_publishable_...) or legacy anon JWT."
  }

  try {
    $payload = $key.Split('.')[1].Replace('-', '+').Replace('_', '/')
    $payload += '=' * ((4 - ($payload.Length % 4)) % 4)
    $payloadJson = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($payload))
  } catch {
    throw "The legacy Supabase key payload is invalid."
  }
  if ($payloadJson -notmatch '"role"\s*:\s*"anon"') {
    throw "Refusing to deploy a JWT key unless its role is exactly 'anon'. Never use service_role or a secret key in browser code."
  }
}

if ($key.Length -lt 20) {
  throw "SUPABASE_PUBLISHABLE_KEY is too short to be a valid project key."
}

if (Test-Path -LiteralPath $output) {
  $existingOutput = Get-Item -LiteralPath $output -Force
  if ($existingOutput.Attributes -band [IO.FileAttributes]::ReparsePoint) {
    throw "Refusing to overwrite a symlink or reparse point at the deployment output path."
  }
  Remove-Item -LiteralPath $output -Recurse -Force
}
New-Item -Path $output -ItemType Directory | Out-Null

foreach ($filename in @("index.html", "app.js", "styles.css")) {
  Copy-Item -LiteralPath (Join-Path $root $filename) -Destination $output
}
$images = Join-Path $root "images"
if (Test-Path -LiteralPath $images -PathType Container) {
  Copy-Item -LiteralPath $images -Destination (Join-Path $output "images") -Recurse
}

$config = @"
window.ALIBABA_SUPABASE_CONFIG = Object.freeze({
  url: "$url",
  publishableKey: "$key"
});
window.ALIBABA_SUPABASE_LOCAL_CONFIG = Object.freeze({
  url: "http://127.0.0.1:54321",
  publishableKey: "YOUR_LOCAL_SUPABASE_PUBLISHABLE_KEY"
});
"@
[IO.File]::WriteAllText((Join-Path $output "supabase-config.js"), $config, [Text.UTF8Encoding]::new($false))

$origin = $url
$csp = "default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'none'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; img-src 'self' blob: https://images.unsplash.com $origin; connect-src 'self' $origin; font-src 'self' https://fonts.gstatic.com; upgrade-insecure-requests"
$htmlPath = Join-Path $output "index.html"
$html = [IO.File]::ReadAllText($htmlPath)
$cspPattern = '<meta http-equiv="Content-Security-Policy" content="[^"]*">'
$matches = [regex]::Matches($html, $cspPattern)
if ($matches.Count -ne 1) {
  throw "Expected exactly one Content-Security-Policy meta tag in index.html."
}
$html = $html.Replace($matches[0].Value, "<meta http-equiv=`"Content-Security-Policy`" content=`"$csp`">")
[IO.File]::WriteAllText($htmlPath, $html, [Text.UTF8Encoding]::new($false))

$headers = @"
/*
  Content-Security-Policy: $csp
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cross-Origin-Opener-Policy: same-origin
"@
[IO.File]::WriteAllText((Join-Path $output "_headers"), $headers, [Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText((Join-Path $output ".nojekyll"), "", [Text.UTF8Encoding]::new($false))

Write-Host "Prepared static site in $output"
Write-Host "Supabase origin: $origin"
Write-Host "Only the public publishable/anon key is included in the browser bundle."
