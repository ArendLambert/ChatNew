using Chat.Application.Services;
using Chat.DataAccess.Repositories;
using Chat.DataAccess;
using Chat.Endpoints;
using Chat.Extensions;
using Chat.Infrastructure;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Указываем адрес и порт сервера
        builder.WebHost.UseUrls("http://0.0.0.0:8080");

        // Add services to the container.
        builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(nameof(JwtOptions)));
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddDbContext<ChatDbContext>(
            options =>
            {
                options.UseNpgsql(builder.Configuration.GetConnectionString(nameof(ChatDbContext)));
            });
        builder.Services.AddApiAuthentifications(builder.Services.BuildServiceProvider().GetRequiredService<IOptions<JwtOptions>>());
        builder.Services.AddScoped<IUsersService, UsersService>();
        builder.Services.AddScoped<IFriendPairService, FriendPairService>();
        builder.Services.AddScoped<IUserRepository, UserRepository>();
        builder.Services.AddScoped<IFriendRepository, FriendRepository>();
        builder.Services.AddScoped<IJwtProvider, JwtProvider>();
        builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
        builder.Services.AddScoped<UsersService>();

        var app = builder.Build();
        app.UseCors("AllowSpecificOrigin");

        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseCors(x =>
        {
            x.SetIsOriginAllowed(origin => true)
             .AllowAnyHeader()
             .AllowAnyMethod()
             .AllowCredentials();
        });

        app.MapControllers();
        app.MapUsersEndpoints();

        app.UseCookiePolicy(new CookiePolicyOptions
        {
            MinimumSameSitePolicy = SameSiteMode.None,
            HttpOnly = HttpOnlyPolicy.None,
            Secure = CookieSecurePolicy.Always
        });

        app.UseAuthentication();
        app.UseAuthorization();

        // Выводим адрес сервера в консоль
        var serverAddresses = app.Urls;
        Console.WriteLine("AAAAAAAAAAAAAAAAAAAA BBBBBBBBBBBBBBBBBBBBBB CCCCCCCCCCCCCCCCCCCCC:");
        foreach (var address in serverAddresses)
        {
            Console.WriteLine(address);
        }

        app.Run();
    }
}
