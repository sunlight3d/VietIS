$src = "C:\Users\ADMIN\.gemini\antigravity\brain\10f392a7-26c2-44ba-b86e-08ecad9e66fe"
$dst = "C:\code\VietIS\Vibe Coding\images"

for ($i = 1; $i -le 12; $i++) {
    $files = Get-ChildItem -Path "$src\slide_${i}_img_*.png" | Sort-Object LastWriteTime -Descending
    if ($files.Count -gt 0) {
        $latest = $files[0].FullName
        Copy-Item -Path $latest -Destination "$dst\img_${i}.png" -Force
        Write-Host "Copied $latest to img_${i}.png"
    } else {
        Write-Host "Image $i not found"
    }
}

node create_presentation_doc.js
