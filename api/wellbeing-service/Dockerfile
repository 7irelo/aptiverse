FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["Aptiverse.Wellbeing.slnx", "./"]
COPY ["src/Aptiverse.Wellbeing/Aptiverse.Wellbeing.csproj", "src/Aptiverse.Wellbeing/"]
COPY ["src/Aptiverse.Wellbeing.Application/Aptiverse.Wellbeing.Application.csproj", "src/Aptiverse.Wellbeing.Application/"]
COPY ["src/Aptiverse.Wellbeing.Core/Aptiverse.Wellbeing.Core.csproj", "src/Aptiverse.Wellbeing.Core/"]
COPY ["src/Aptiverse.Wellbeing.Domain/Aptiverse.Wellbeing.Domain.csproj", "src/Aptiverse.Wellbeing.Domain/"]
COPY ["src/Aptiverse.Wellbeing.Infrastructure/Aptiverse.Wellbeing.Infrastructure.csproj", "src/Aptiverse.Wellbeing.Infrastructure/"]
RUN dotnet restore "Aptiverse.Wellbeing.slnx"
COPY . .
WORKDIR "/src/src/Aptiverse.Wellbeing"
RUN dotnet build "Aptiverse.Wellbeing.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "Aptiverse.Wellbeing.csproj" -c Release -o /app/publish
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5196
RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aptiverse.Wellbeing.dll", "--urls", "http://0.0.0.0:5196"]
