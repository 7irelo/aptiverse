# syntax=docker/dockerfile:1.7
#
# One image, two roles. The API is the default command; the worker overrides it:
#   docker run IMAGE                                   -> API (host/Aptiverse.Host.dll)
#   docker run IMAGE worker/Aptiverse.Worker.dll       -> worker
#   docker run IMAGE host/Aptiverse.Host.dll resources setup   -> create Wolverine tables (migration task)
#
# Multi-arch: build for Graviton with `docker buildx build --platform linux/arm64 .`
# The SDK stage runs natively on the build machine and cross-publishes for TARGETARCH.

ARG DOTNET_VERSION=10.0

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:${DOTNET_VERSION} AS build
ARG TARGETARCH
WORKDIR /src

# Restore first, from project files only, so the layer is cached until dependencies change.
COPY global.json nuget.config Directory.Build.props Directory.Packages.props .editorconfig ./
COPY src/Aptiverse.SharedKernel/Aptiverse.SharedKernel.csproj src/Aptiverse.SharedKernel/
COPY src/Aptiverse.Host/Aptiverse.Host.csproj src/Aptiverse.Host/
COPY src/Aptiverse.Worker/Aptiverse.Worker.csproj src/Aptiverse.Worker/
COPY src/Modules/Support/Aptiverse.Support/Aptiverse.Support.csproj src/Modules/Support/Aptiverse.Support/
COPY src/Modules/Support/Aptiverse.Support.Contracts/Aptiverse.Support.Contracts.csproj src/Modules/Support/Aptiverse.Support.Contracts/
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet restore src/Aptiverse.Host/Aptiverse.Host.csproj -a $TARGETARCH \
 && dotnet restore src/Aptiverse.Worker/Aptiverse.Worker.csproj -a $TARGETARCH

COPY src/ src/

# OpenAPI generation is a CI concern (it diffs openapi/v1.json); skip it inside the image build.
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet publish src/Aptiverse.Host/Aptiverse.Host.csproj -c Release -a $TARGETARCH --no-restore \
      -p:OpenApiGenerateDocuments=false -p:UseAppHost=false -o /app/host \
 && dotnet publish src/Aptiverse.Worker/Aptiverse.Worker.csproj -c Release -a $TARGETARCH --no-restore \
      -p:UseAppHost=false -o /app/worker

# Chiselled Ubuntu: no shell, no package manager, non-root by default. The -extra variant adds ICU and
# tzdata, which display times in Africa/Johannesburg and keep culture-aware formatting correct.
FROM mcr.microsoft.com/dotnet/aspnet:${DOTNET_VERSION}-noble-chiseled-extra AS runtime
WORKDIR /app
COPY --from=build /app ./

ENV ASPNETCORE_HTTP_PORTS=8080 \
    DOTNET_EnableDiagnostics=0 \
    DOTNET_gcServer=1
EXPOSE 8080
USER $APP_UID

ENTRYPOINT ["dotnet"]
CMD ["host/Aptiverse.Host.dll"]
