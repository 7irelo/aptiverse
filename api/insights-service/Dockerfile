FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Aptiverse.Insights.slnx", "./"]
COPY ["src/Aptiverse.Insights/Aptiverse.Insights.csproj", "src/Aptiverse.Insights/"]
COPY ["src/Aptiverse.Insights.Application/Aptiverse.Insights.Application.csproj", "src/Aptiverse.Insights.Application/"]
COPY ["src/Aptiverse.Insights.Core/Aptiverse.Insights.Core.csproj", "src/Aptiverse.Insights.Core/"]
COPY ["src/Aptiverse.Insights.Domain/Aptiverse.Insights.Domain.csproj", "src/Aptiverse.Insights.Domain/"]
COPY ["src/Aptiverse.Insights.Infrastructure/Aptiverse.Insights.Infrastructure.csproj", "src/Aptiverse.Insights.Infrastructure/"]

RUN dotnet restore "Aptiverse.Insights.slnx"

COPY . .
WORKDIR "/src/src/Aptiverse.Insights"
RUN dotnet build "Aptiverse.Insights.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Aptiverse.Insights.csproj" -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5196

RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aptiverse.Insights.dll", "--urls", "http://0.0.0.0:5196"]