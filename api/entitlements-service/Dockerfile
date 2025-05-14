FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Aptiverse.Marketplace.slnx", "./"]
COPY ["src/Aptiverse.Marketplace/Aptiverse.Marketplace.csproj", "src/Aptiverse.Marketplace/"]
COPY ["src/Aptiverse.Marketplace.Application/Aptiverse.Marketplace.Application.csproj", "src/Aptiverse.Marketplace.Application/"]
COPY ["src/Aptiverse.Marketplace.Core/Aptiverse.Marketplace.Core.csproj", "src/Aptiverse.Marketplace.Core/"]
COPY ["src/Aptiverse.Marketplace.Domain/Aptiverse.Marketplace.Domain.csproj", "src/Aptiverse.Marketplace.Domain/"]
COPY ["src/Aptiverse.Marketplace.Infrastructure/Aptiverse.Marketplace.Infrastructure.csproj", "src/Aptiverse.Marketplace.Infrastructure/"]

RUN dotnet restore "Aptiverse.Marketplace.slnx"

COPY . .
WORKDIR "/src/src/Aptiverse.Marketplace"
RUN dotnet build "Aptiverse.Marketplace.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Aptiverse.Marketplace.csproj" -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5196

RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aptiverse.Marketplace.dll", "--urls", "http://0.0.0.0:5196"]