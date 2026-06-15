FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY apps/api/*.csproj ./apps/api/
RUN dotnet restore apps/api/Api.csproj

COPY apps/api/ ./apps/api/
RUN dotnet publish apps/api/Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5164
ENV ASPNETCORE_URLS=http://+:5164
ENTRYPOINT ["dotnet", "Api.dll"]