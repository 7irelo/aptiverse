FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Aptiverse.Calendar.slnx", "./"]
COPY ["src/Aptiverse.Calendar/Aptiverse.Calendar.csproj", "src/Aptiverse.Calendar/"]
COPY ["src/Aptiverse.Calendar.Application/Aptiverse.Calendar.Application.csproj", "src/Aptiverse.Calendar.Application/"]
COPY ["src/Aptiverse.Calendar.Core/Aptiverse.Calendar.Core.csproj", "src/Aptiverse.Calendar.Core/"]
COPY ["src/Aptiverse.Calendar.Domain/Aptiverse.Calendar.Domain.csproj", "src/Aptiverse.Calendar.Domain/"]
COPY ["src/Aptiverse.Calendar.Infrastructure/Aptiverse.Calendar.Infrastructure.csproj", "src/Aptiverse.Calendar.Infrastructure/"]
RUN dotnet restore "Aptiverse.Calendar.slnx"
COPY . .
WORKDIR "/src/src/Aptiverse.Calendar"
RUN dotnet build "Aptiverse.Calendar.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "Aptiverse.Calendar.csproj" -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5196
RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aptiverse.Calendar.dll", "--urls", "http://0.0.0.0:5196"]
