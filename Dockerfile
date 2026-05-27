# syntax=docker/dockerfile:1

# === Stage 1: build the frontend ===
FROM node:20-alpine AS frontend-build
WORKDIR /src
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build
# output: /src/dist

# === Stage 2: build the backend ===
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src
COPY backend/Caseflow.csproj ./backend/
RUN dotnet restore backend/Caseflow.csproj
COPY backend/ ./backend/
RUN dotnet publish backend/Caseflow.csproj \
    -c Release \
    -o /app/out \
    --no-restore

# === Stage 3: runtime ===
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=backend-build /app/out ./
COPY --from=frontend-build /src/dist ./wwwroot

VOLUME ["/data"]

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "Caseflow.dll"]
