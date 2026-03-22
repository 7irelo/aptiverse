FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Aptiverse.Moderation.slnx", "./"]
COPY ["src/Aptiverse.Moderation/Aptiverse.Moderation.csproj", "src/Aptiverse.Moderation/"]
COPY ["src/Aptiverse.Moderation.Application/Aptiverse.Moderation.Application.csproj", "src/Aptiverse.Moderation.Application/"]
COPY ["src/Aptiverse.Moderation.Core/Aptiverse.Moderation.Core.csproj", "src/Aptiverse.Moderation.Core/"]
COPY ["src/Aptiverse.Moderation.Domain/Aptiverse.Moderation.Domain.csproj", "src/Aptiverse.Moderation.Domain/"]
COPY ["src/Aptiverse.Moderation.Infrastructure/Aptiverse.Moderation.Infrastructure.csproj", "src/Aptiverse.Moderation.Infrastructure/"]
RUN dotnet restore "Aptiverse.Moderation.slnx"
COPY . .
WORKDIR "/src/src/Aptiverse.Moderation"
RUN dotnet build "Aptiverse.Moderation.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "Aptiverse.Moderation.csproj" -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5196
RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aptiverse.Moderation.dll", "--urls", "http://0.0.0.0:5196"]
