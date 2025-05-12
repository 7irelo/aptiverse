FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Aptiverse.Goals.slnx", "./"]
COPY ["src/Aptiverse.Goals/Aptiverse.Goals.csproj", "src/Aptiverse.Goals/"]
COPY ["src/Aptiverse.Goals.Application/Aptiverse.Goals.Application.csproj", "src/Aptiverse.Goals.Application/"]
COPY ["src/Aptiverse.Goals.Core/Aptiverse.Goals.Core.csproj", "src/Aptiverse.Goals.Core/"]
COPY ["src/Aptiverse.Goals.Domain/Aptiverse.Goals.Domain.csproj", "src/Aptiverse.Goals.Domain/"]
COPY ["src/Aptiverse.Goals.Infrastructure/Aptiverse.Goals.Infrastructure.csproj", "src/Aptiverse.Goals.Infrastructure/"]

RUN dotnet restore "Aptiverse.Goals.slnx"

COPY . .
WORKDIR "/src/src/Aptiverse.Goals"
RUN dotnet build "Aptiverse.Goals.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Aptiverse.Goals.csproj" -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5196

RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aptiverse.Goals.dll", "--urls", "http://0.0.0.0:5196"]