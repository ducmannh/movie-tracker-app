# ====================================================================
# Dockerfile cho MovieTracker Backend (.NET Web API)
# ====================================================================

# Giai đoạn 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy file .csproj và restore dependencies trước để tận dụng Docker layer cache
COPY ["MovieTrackerBE.csproj", "./"]
RUN dotnet restore "MovieTrackerBE.csproj"

# Copy toàn bộ mã nguồn và biên dịch Release
COPY . .
RUN dotnet publish "MovieTrackerBE.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Giai đoạn 2: Runtime Image (Siêu nhẹ, bảo mật)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Cấu hình biến môi trường
ENV ASPNETCORE_URLS=http://+:5032
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5032

# Copy kết quả publish từ giai đoạn 1
COPY --from=build /app/publish .

# Chạy ứng dụng
ENTRYPOINT ["dotnet", "MovieTrackerBE.dll"]
