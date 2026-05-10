# Aptiverse.Api — single .NET 10 host running auth + 14 domain modules.
# Build context is the repo root because the host references projects under
# api/Aptiverse.Api/Modules/.
#
# Build:    docker build -f api/Aptiverse.Api/Dockerfile -t aptiverse-api .
# Run:      docker run -p 5100:5100 aptiverse-api
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy everything under api/ — far simpler than enumerating 60 csproj
# files for restore-layer caching, and Docker still caches well as long as
# only csproj/source changes ripple through.
COPY api/ api/

WORKDIR /src/api/Aptiverse.Api
RUN dotnet restore "Aptiverse.Api.csproj"
RUN dotnet publish "Aptiverse.Api.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5100

RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=http://0.0.0.0:5100
ENTRYPOINT ["dotnet", "Aptiverse.Api.dll"]
