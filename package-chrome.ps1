$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$manifestPath = Join-Path $root "manifest.json"
$manifest = Get-Content -Raw $manifestPath | ConvertFrom-Json
$version = $manifest.version
$outputPath = Join-Path $root ("Speedadmin-Plus-v{0}.zip" -f $version)

$packageFiles = @(
  "manifest.json",
  "popup.html",
  "popup.js",
  "content.js",
  "weeknumber.js",
  "styles.css",
  "icons/icon16.png",
  "icons/icon48.png",
  "icons/icon128.png"
)

foreach ($relativePath in $packageFiles) {
  $sourcePath = Join-Path $root ($relativePath -replace "/", "\")
  if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
    throw "Required package file is missing: $relativePath"
  }
}

if (Test-Path -LiteralPath $outputPath) {
  Remove-Item -LiteralPath $outputPath -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open(
  $outputPath,
  [System.IO.Compression.ZipArchiveMode]::Create
)

try {
  foreach ($relativePath in $packageFiles) {
    $sourcePath = Join-Path $root ($relativePath -replace "/", "\")
    $entryName = $relativePath -replace "\\", "/"
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $zip,
      $sourcePath,
      $entryName,
      [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
  }
}
finally {
  $zip.Dispose()
}

$archive = [System.IO.Compression.ZipFile]::OpenRead($outputPath)
try {
  $entries = @($archive.Entries | Select-Object -ExpandProperty FullName)
  $expected = @($packageFiles | ForEach-Object { $_ -replace "\\", "/" })
  $missing = @($expected | Where-Object { $_ -notin $entries })
  $unexpected = @($entries | Where-Object { $_ -notin $expected })

  if ($missing.Count -gt 0) {
    throw "ZIP is missing entries: $($missing -join ", ")"
  }
  if ($unexpected.Count -gt 0) {
    throw "ZIP contains unexpected entries: $($unexpected -join ", ")"
  }
}
finally {
  $archive.Dispose()
}

Write-Output "Created $outputPath"
Write-Output "Version: $version"
Write-Output "Entries: $($packageFiles.Count)"
