$componentDir = "c:\Users\MOTIVATION\OneDrive\Desktop\Pranay\NEWS\tv19\src\pages\components\HOME\home-comp"
$files = Get-ChildItem "$componentDir\*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Regex to remove span with class containing 'badge' or 'category' that looks like a hero badge
    # Specifically targeting the spans found in greps
    
    # Pattern 1: <span className="...-hero__badge">...</span>
    $content = $content -replace '<span className="[a-zA-Z0-9-]*hero__badge">.*?</span>', ''
    
    # Pattern 2: <span className="...-hero__category">...</span>
    $content = $content -replace '<span className="[a-zA-Z0-9-]*hero__category">.*?</span>', ''
    
    # Pattern 3: <span className="ts-card__badge">...</span> (already done but for safety)
    $content = $content -replace '<span className="ts-card__badge">.*?</span>', ''

    # Pattern 4: <span className="raj-hero__badge">...</span> (already done but for safety)
    $content = $content -replace '<span className="raj-hero__badge">.*?</span>', ''

    # Pattern 5: <span className="raj-mid__location">...</span> (cleaning up rest of Rajasthan)
    $content = $content -replace '<span className="raj-mid__location">.*?</span>', ''
    
    Set-Content $file.FullName -Value $content -NoNewline
    Write-Host "Processed: $($file.Name)"
}

Write-Host "`nDone! Badges removed from components."
