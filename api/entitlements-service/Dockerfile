FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Aptiverse.Api.slnx", "./"]
COPY ["src/Aptiverse.Entitlements/Aptiverse.Api.csproj", "src/Aptiverse.Entitlements/"]
COPY ["src/Aptiverse.Entitlements.Application/Aptiverse.Api.Application.csproj", "src/Aptiverse.Entitlements.Application/"]
COPY ["src/Aptiverse.Entitlements.Core/Aptiverse.Api.Core.csproj", "src/Aptiverse.Entitlements.Core/"]
COPY ["src/Aptiverse.Entitlements.Domain/Aptiverse.Api.Domain.csproj", "src/Aptiverse.Entitlements.Domain/"]
COPY ["src/Aptiverse.Entitlements.Infrastructure/Aptiverse.Api.Infrastructure.csproj", "src/Aptiverse.Entitlements.Infrastructure/"]

RUN dotnet restore "Aptiverse.Api.slnx"

COPY . .
WORKDIR "/src/src/Aptiverse.Entitlements"
RUN dotnet build "Aptiverse.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Aptiverse.Api.csproj" -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5196

RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aptiverse.Api.dll", "--urls", "http://0.0.0.0:5196"]
