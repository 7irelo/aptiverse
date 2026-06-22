# =============================================================================
# Aptiverse local-dev launcher
# =============================================================================
# One command that:
#   1. brings up the SSH tunnel to RDS if it isn't already running
#   2. waits for localhost:5432 to actually accept connections
#   3. launches `dotnet run` in the foreground
#   4. tears the tunnel down cleanly when you Ctrl+C
#
# Usage (from anywhere, but the API folder is easiest):
#   pwsh C:\Dev\aptiverse-labs\api\start-dev.ps1
#
# If the tunnel was already up before this script ran (e.g. you'd started
# it manually in another window), we leave it alone on exit.
# =============================================================================

[CmdletBinding()]
param(
    [string]$PemPath  = "C:\Dev\aptiverse-labs\infra\terraform\envs\dev\aptiverse-dev.pem",
    [string]$Bastion  = "ec2-user@15.240.75.50",
    [string]$RdsHost  = "aptiverse-dev.ctguiw0wkcql.af-south-1.rds.amazonaws.com",
    [int]$LocalPort   = 5432,
    [int]$WaitSeconds = 30
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

function Test-PortListening([int]$port) {
    $null -ne (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}

# ---------------------------------------------------------------------------
# 1. SSH tunnel
# ---------------------------------------------------------------------------
$startedTunnel = $false
$tunnelProcess = $null

if (Test-PortListening $LocalPort) {
    Write-Host "✓ Tunnel already up on localhost:$LocalPort — reusing it." -ForegroundColor Green
}
else {
    if (-not (Test-Path $PemPath)) {
        Write-Host "✗ PEM key not found at: $PemPath" -ForegroundColor Red
        Write-Host "  Pass a different path with -PemPath if your key lives elsewhere." -ForegroundColor Yellow
        exit 1
    }

    Write-Host "→ Opening SSH tunnel: localhost:$LocalPort → $RdsHost`:5432 via $Bastion" -ForegroundColor Cyan

    # Start ssh -N (no remote command, just port-forward) in a hidden background
    # process. -o options keep the tunnel alive and quiet through transient
    # blips that previously killed it under flaky wifi.
    $sshArgs = @(
        "-i", $PemPath,
        "-L", "$LocalPort`:$RdsHost`:5432",
        "-N",
        "-o", "ServerAliveInterval=20",
        "-o", "ServerAliveCountMax=3",
        "-o", "ExitOnForwardFailure=yes",
        "-o", "StrictHostKeyChecking=accept-new",
        $Bastion
    )
    $tunnelProcess = Start-Process -FilePath "ssh" -ArgumentList $sshArgs `
        -PassThru -WindowStyle Hidden
    $startedTunnel = $true

    # Wait for the port to actually start accepting connections — `ssh -N`
    # exits silently if the forward fails, so we time-bound the wait.
    $deadline = (Get-Date).AddSeconds($WaitSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-PortListening $LocalPort) { break }
        if ($tunnelProcess.HasExited) {
            Write-Host "✗ SSH tunnel exited before port came up (exit code $($tunnelProcess.ExitCode))." -ForegroundColor Red
            Write-Host "  Common causes: wrong PEM permissions, bastion firewall, RDS not reachable." -ForegroundColor Yellow
            exit 1
        }
        Start-Sleep -Milliseconds 500
    }

    if (-not (Test-PortListening $LocalPort)) {
        Write-Host "✗ Tunnel didn't come up within ${WaitSeconds}s. Giving up." -ForegroundColor Red
        if (-not $tunnelProcess.HasExited) { Stop-Process -Id $tunnelProcess.Id -Force }
        exit 1
    }

    Write-Host "✓ Tunnel up (ssh PID $($tunnelProcess.Id))." -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# 2. dotnet run — foreground, blocking
# ---------------------------------------------------------------------------
Write-Host "→ Launching API (Ctrl+C to stop)" -ForegroundColor Cyan
Write-Host ""

try {
    dotnet run
}
finally {
    # Only tear down what we brought up. A tunnel that was already running
    # before this script started keeps living after we exit.
    if ($startedTunnel -and $tunnelProcess -and -not $tunnelProcess.HasExited) {
        Write-Host ""
        Write-Host "→ Closing SSH tunnel (PID $($tunnelProcess.Id))" -ForegroundColor Cyan
        Stop-Process -Id $tunnelProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
