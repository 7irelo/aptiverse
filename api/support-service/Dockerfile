FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Aptiverse.Support.slnx", "./"]
COPY ["src/Aptiverse.Support/Aptiverse.Support.csproj", "src/Aptiverse.Support/"]
COPY ["src/Aptiverse.Support.Application/Aptiverse.Support.Application.csproj", "src/Aptiverse.Support.Application/"]
COPY ["src/Aptiverse.Support.Core/Aptiverse.Support.Core.csproj", "src/Aptiverse.Support.Core/"]
COPY ["src/Aptiverse.Support.Domain/Aptiverse.Support.Domain.csproj", "src/Aptiverse.Support.Domain/"]
COPY ["src/Aptiverse.Support.Infrastructure/Aptiverse.Support.Infrastructure.csproj", "src/Aptiverse.Support.Infrastructure/"]
RUN dotnet restore "Aptiverse.Support.slnx"
COPY . .
WORKDIR "/src/src/Aptiverse.Support"
RUN dotnet build "Aptiverse.Support.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "Aptiverse.Support.csproj" -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5196
RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aptiverse.Support.dll", "--urls", "http://0.0.0.0:5196"]
