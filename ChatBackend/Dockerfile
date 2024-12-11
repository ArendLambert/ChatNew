# Этап сборки
FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/sdk:8.0 AS build

ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Копируем весь исходный код
COPY . ./

# Восстанавливаем зависимости
RUN dotnet restore Chat/Chat.csproj

# Сборка и публикация основного проекта
WORKDIR /src/Chat
RUN dotnet publish Chat.csproj -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Финальный образ
FROM --platform=linux/amd64 mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

# Копируем опубликованные файлы
COPY --from=build /app/publish .

EXPOSE 7151
EXPOSE 8080
EXPOSE 80
EXPOSE 443

# Указываем точку входа
ENTRYPOINT ["dotnet", "Chat.dll"]
