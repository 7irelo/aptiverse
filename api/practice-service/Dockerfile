FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Aptiverse.Practice.slnx", "./"]
COPY ["src/Aptiverse.Practice/Aptiverse.Practice.csproj", "src/Aptiverse.Practice/"]
COPY ["src/Aptiverse.Practice.Application/Aptiverse.Practice.Application.csproj", "src/Aptiverse.Practice.Application/"]
COPY ["src/Aptiverse.Practice.Core/Aptiverse.Practice.Core.csproj", "src/Aptiverse.Practice.Core/"]
COPY ["src/Aptiverse.Practice.Domain/Aptiverse.Practice.Domain.csproj", "src/Aptiverse.Practice.Domain/"]
COPY ["src/Aptiverse.Practice.Infrastructure/Aptiverse.Practice.Infrastructure.csproj", "src/Aptiverse.Practice.Infrastructure/"]

RUN dotnet restore "Aptiverse.Practice.slnx"

COPY . .
WORKDIR "/src/src/Aptiverse.Practice"
RUN dotnet build "Aptiverse.Practice.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Aptiverse.Practice.csproj" -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5196

RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aptiverse.Practice.dll", "--urls", "http://0.0.0.0:5196"]