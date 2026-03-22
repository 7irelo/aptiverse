FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Aptiverse.AcademicPlanning.slnx", "./"]
COPY ["src/Aptiverse.Api/Aptiverse.AcademicPlanning.csproj", "src/Aptiverse.Api/"]
COPY ["src/Aptiverse.Api.Application/Aptiverse.AcademicPlanning.Application.csproj", "src/Aptiverse.Api.Application/"]
COPY ["src/Aptiverse.Api.Core/Aptiverse.AcademicPlanning.Core.csproj", "src/Aptiverse.Api.Core/"]
COPY ["src/Aptiverse.Api.Domain/Aptiverse.AcademicPlanning.Domain.csproj", "src/Aptiverse.Api.Domain/"]
COPY ["src/Aptiverse.Api.Infrastructure/Aptiverse.AcademicPlanning.Infrastructure.csproj", "src/Aptiverse.Api.Infrastructure/"]

RUN dotnet restore "Aptiverse.AcademicPlanning.slnx"

COPY . .
WORKDIR "/src/src/Aptiverse.Api"
RUN dotnet build "Aptiverse.AcademicPlanning.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Aptiverse.AcademicPlanning.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5000

RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aptiverse.AcademicPlanning.dll", "--urls", "http://0.0.0.0:5196"]