# Aptiverse.Api — single .NET 10 host running auth + 14 domain modules.
# Build:  docker build -t aptiverse-api .
# Run:    docker run -p 5100:5100 aptiverse-api
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY . .
RUN dotnet restore "Aptiverse.Api.csproj"
RUN dotnet publish "Aptiverse.Api.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5100

RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://0.0.0.0:5100
ENTRYPOINT ["dotnet", "Aptiverse.Api.dll"]
