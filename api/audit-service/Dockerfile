FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Aptiverse.Audit.slnx", "./"]
COPY ["src/Aptiverse.Audit/Aptiverse.Audit.csproj", "src/Aptiverse.Audit/"]
COPY ["src/Aptiverse.Audit.Application/Aptiverse.Audit.Application.csproj", "src/Aptiverse.Audit.Application/"]
COPY ["src/Aptiverse.Audit.Core/Aptiverse.Audit.Core.csproj", "src/Aptiverse.Audit.Core/"]
COPY ["src/Aptiverse.Audit.Domain/Aptiverse.Audit.Domain.csproj", "src/Aptiverse.Audit.Domain/"]
COPY ["src/Aptiverse.Audit.Infrastructure/Aptiverse.Audit.Infrastructure.csproj", "src/Aptiverse.Audit.Infrastructure/"]
RUN dotnet restore "Aptiverse.Audit.slnx"
COPY . .
WORKDIR "/src/src/Aptiverse.Audit"
RUN dotnet build "Aptiverse.Audit.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "Aptiverse.Audit.csproj" -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5196
RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aptiverse.Audit.dll", "--urls", "http://0.0.0.0:5196"]
