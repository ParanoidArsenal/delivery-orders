FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY Directory.Build.props ./
COPY src/DeliveryOrders.Api/DeliveryOrders.Api.csproj src/DeliveryOrders.Api/
RUN dotnet restore src/DeliveryOrders.Api/DeliveryOrders.Api.csproj
COPY . .
RUN dotnet publish src/DeliveryOrders.Api/DeliveryOrders.Api.csproj \
      -c Release -o /app --no-restore /p:OpenApiGenerateDocuments=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
RUN apt-get update \
    && apt-get install --no-install-recommends -y curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app ./
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "DeliveryOrders.Api.dll"]
