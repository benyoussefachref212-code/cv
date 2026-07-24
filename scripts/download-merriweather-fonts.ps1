$ErrorActionPreference = 'Stop'
# Force a modern user-agent so Google Fonts returns woff2 formats
$css = (Invoke-WebRequest 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap' -Headers @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } -UseBasicParsing).Content
$matches = [regex]::Matches($css,'url\((https?://[^)]+)\)')
$map = @{}
$last = $null
foreach($m in $matches){
  $url = $m.Groups[1].Value
  $last = $url
  $idx = $m.Index
  $start = [Math]::Max(0,$idx-300)
  $len = [Math]::Min(300, $css.Length - $start)
  $snippet = $css.Substring($start,$len)
  if($snippet -match 'font-weight:\s*700') { $map['700'] = $url }
  elseif($snippet -match 'font-weight:\s*400') { $map['400'] = $url }
}
if(-not(Test-Path -Path 'public/fonts')){ New-Item -ItemType Directory -Force -Path 'public/fonts' | Out-Null }
$reg = $map['400']; if(-not $reg) { $reg = $last }
$bold = $map['700']; if(-not $bold) { $bold = $last }
if($reg){ Write-Output "Downloading Regular: $reg"; Invoke-WebRequest $reg -OutFile 'public/fonts/Merriweather-Regular.woff2' -UseBasicParsing }
if($bold){ Write-Output "Downloading Bold: $bold"; Invoke-WebRequest $bold -OutFile 'public/fonts/Merriweather-Bold.woff2' -UseBasicParsing }
Write-Output 'Done'
