Write-Host "Rebuilding and starting Docker containers..."
docker compose down
docker compose up -d --build

Write-Host "Validating containers started properly... (Waiting 30 seconds for .NET to compile inside docker)"
Start-Sleep -Seconds 30

Write-Host "Opening Frontend at http://localhost:5173 ..."
Start-Process "http://localhost:5173"

Write-Host "Opening Backend Swagger UI at http://localhost:5000/swagger ..."
Start-Process "http://localhost:5000/swagger"

Write-Host "All systems booting up! You can monitor logs with 'docker compose logs -f'."
