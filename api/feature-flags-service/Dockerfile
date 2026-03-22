FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Aptiverse.FeatureFlags.slnx", "./"]
COPY ["src/Aptiverse.FeatureFlags/Aptiverse.FeatureFlags.csproj", "src/Aptiverse.FeatureFlags/"]
COPY ["src/Aptiverse.FeatureFlags.Application/Aptiverse.FeatureFlags.Application.csproj", "src/Aptiverse.FeatureFlags.Application/"]
COPY ["src/Aptiverse.FeatureFlags.Core/Aptiverse.FeatureFlags.Core.csproj", "src/Aptiverse.FeatureFlags.Core/"]
COPY ["src/Aptiverse.FeatureFlags.Domain/Aptiverse.FeatureFlags.Domain.csproj", "src/Aptiverse.FeatureFlags.Domain/"]
COPY ["src/Aptiverse.FeatureFlags.Infrastructure/Aptiverse.FeatureFlags.Infrastructure.csproj", "src/Aptiverse.FeatureFlags.Infrastructure/"]
RUN dotnet restore "Aptiverse.FeatureFlags.slnx"
COPY . .
WORKDIR "/src/src/Aptiverse.FeatureFlags"
RUN dotnet build "Aptiverse.FeatureFlags.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "Aptiverse.FeatureFlags.csproj" -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5196
RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aptiverse.FeatureFlags.dll", "--urls", "http://0.0.0.0:5196"]
