FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Aptiverse.Booking.slnx", "./"]
COPY ["src/Aptiverse.Booking/Aptiverse.Booking.csproj", "src/Aptiverse.Booking/"]
COPY ["src/Aptiverse.Booking.Application/Aptiverse.Booking.Application.csproj", "src/Aptiverse.Booking.Application/"]
COPY ["src/Aptiverse.Booking.Core/Aptiverse.Booking.Core.csproj", "src/Aptiverse.Booking.Core/"]
COPY ["src/Aptiverse.Booking.Domain/Aptiverse.Booking.Domain.csproj", "src/Aptiverse.Booking.Domain/"]
COPY ["src/Aptiverse.Booking.Infrastructure/Aptiverse.Booking.Infrastructure.csproj", "src/Aptiverse.Booking.Infrastructure/"]

RUN dotnet restore "Aptiverse.Booking.slnx"

COPY . .
WORKDIR "/src/src/Aptiverse.Booking"
RUN dotnet build "Aptiverse.Booking.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Aptiverse.Booking.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 5000

RUN useradd --create-home --home-dir /app --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Aptiverse.Booking.dll", "--urls", "http://0.0.0.0:5196"]