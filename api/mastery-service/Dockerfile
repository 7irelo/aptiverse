FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Aptiverse.Mastery.slnx", "./"]
COPY ["src/Aptiverse.Mastery/Aptiverse.Mastery.csproj", "src/Aptiverse.Mastery/"]
COPY ["src/Aptiverse.Mastery.Application/Aptiverse.Mastery.Application.csproj", "src/Aptiverse.Mastery.Application/"]
COPY ["src/Aptiverse.Mastery.Core/Aptiverse.Mastery.Core.csproj", "src/Aptiverse.Mastery.Core/"]
COPY ["src/Aptiverse.Mastery.Domain/Aptiverse.Mastery.Domain.csproj", "src/Aptiverse.Mastery.Domain/"]
COPY ["src/Aptiverse.Mastery.Infrastructure/Aptiverse.Mastery.Infrastructure.csproj", "src/Aptiverse.Mastery.Infrastructure/"]

RUN dotnet restore "Aptiverse.Mastery.slnx"

COPY . .
WORKDIR "/src/src/Aptiverse.Mastery"
RUN dotnet build "Aptiverse.Mastery.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Aptiverse.Mastery.csproj" -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5196

RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aptiverse.Mastery.dll", "--urls", "http://0.0.0.0:5196"]