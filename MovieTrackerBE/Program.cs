using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using MovieTrackerBE.Data;
using MovieTrackerBE.Repositories;
using MovieTrackerBE.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Thêm Controllers
builder.Services.AddControllers();

// 2. Cấu hình Swagger / OpenAPI với hỗ trợ JWT Bearer Token
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "MovieTracker API",
        Version = "v1",
        Description = "API cho ứng dụng quản lý phim MovieTracker (ASP.NET Core Web API + Dapper)"
    });

    // Cấu hình nút 'Authorize' trong Swagger UI để test JWT Bearer
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token của bạn (không cần gõ tiền tố 'Bearer ', chỉ cần dán chuỗi token vào):"
    });

    options.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer"),
            new List<string>()
        }
    });
});

// 3. Đăng ký Dependency Injection (Dapper Factory, Repositories, Services)
builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// 4. Cấu hình JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"] 
    ?? throw new InvalidOperationException("JwtSettings:Secret chưa được thiết lập.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Phù hợp cho môi trường local development
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "MovieTrackerBE",
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"] ?? "MovieTrackerFE",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    // Đọc token từ Cookie "accessToken" nếu client gửi lên qua Cookie
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Cookies.TryGetValue("accessToken", out var token))
            {
                context.Token = token;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// 5. Cấu hình CORS để Frontend (Vite: 5173, etc.) có thể kết nối
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFE", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Tự động kiểm tra và nâng cấp bảng Users (RefreshToken, RefreshTokenExpiryTime)
using (var scope = app.Services.CreateScope())
{
    try
    {
        var userRepo = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        await userRepo.EnsureSchemaAsync();
        app.Logger.LogInformation("Đã kiểm tra cấu trúc bảng Users và RefreshToken thành công.");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Chưa thể kết nối CSDL để kiểm tra bảng Users: {Message}", ex.Message);
    }
}

// 6. Kích hoạt Swagger UI (hỗ trợ kiểm thử trực tiếp trên server qua /swagger)
if (app.Environment.IsDevelopment() || builder.Configuration.GetValue<bool>("EnableSwagger", true))
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MovieTracker API v1");
        c.RoutePrefix = "swagger"; // Đường dẫn truy cập: /swagger
    });
}

app.UseHttpsRedirection();

// Kích hoạt CORS trước Authentication
app.UseCors("AllowFE");

// Kích hoạt Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map Controller routes
app.MapControllers();

app.Run();
