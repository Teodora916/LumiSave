using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using LumiSave.Application;
using LumiSave.Application.Interfaces;
using LumiSave.Application.Services;
using LumiSave.Domain.Entities;
using LumiSave.Domain.Interfaces;
using LumiSave.Infrastructure.Data;
using LumiSave.Infrastructure.Repositories;
using LumiSave.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Stripe;
using LumiSave.API.Middleware;

// ─── Serilog ───────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // Serilog from config
    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .WriteTo.Console());

    // ─── 1. DbContext ───
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("Default"),
            npgsql => npgsql.MigrationsAssembly("LumiSave.Infrastructure")));

    // ─── 2. ASP.NET Identity ───
    builder.Services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
    {
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequiredLength = 8;
        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

    // ─── 3. JWT Authentication ───
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

    // ─── 4. Authorization ───
    builder.Services.AddAuthorization(options =>
    {
        options.AddPolicy("AdminOnly", p => p.RequireRole("ADMIN"));
        options.AddPolicy("CustomerOrAdmin", p => p.RequireRole("CUSTOMER", "ADMIN"));
    });

    // ─── 5. FluentValidation ───
    builder.Services.AddFluentValidationAutoValidation();
    builder.Services.AddValidatorsFromAssembly(typeof(ApplicationAssemblyMarker).Assembly);

    // ─── 6. AutoMapper ───
    builder.Services.AddAutoMapper(typeof(ApplicationAssemblyMarker).Assembly);

    // ─── 7. Stripe ───
    StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];

    // ─── 8. Repositories ───
    builder.Services.AddScoped<IProductRepository, ProductRepository>();
    builder.Services.AddScoped<IOrderRepository, OrderRepository>();
    builder.Services.AddScoped<ICartRepository, CartRepository>();
    builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
    builder.Services.AddScoped<IStripeTransactionRepository, StripeTransactionRepository>();
    builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
    builder.Services.AddScoped<ILedCalculatorSessionRepository, LedCalculatorSessionRepository>();
    builder.Services.AddScoped<ISmartHomeCalculatorSessionRepository, SmartHomeCalculatorSessionRepository>();

    // ─── 9. Infrastructure Services ───
    builder.Services.AddScoped<IEmailService, EmailService>();
    builder.Services.AddScoped<IStripeService, StripeService>();


    // ─── 10. Application Services ───
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IProductService, LumiSave.Application.Services.ProductService>();
    builder.Services.AddScoped<ICartService, CartService>();
    builder.Services.AddScoped<IOrderService, OrderService>();
    builder.Services.AddScoped<IWebhookService, WebhookService>();
    builder.Services.AddScoped<ILedCalculatorService, LedCalculatorService>();
    builder.Services.AddScoped<ISmartHomeCalculatorService, SmartHomeCalculatorService>();
    builder.Services.AddScoped<IReviewService, LumiSave.Application.Services.ReviewService>();
    builder.Services.AddScoped<ICategoryService, CategoryService>();
    builder.Services.AddScoped<IStripeAdminService, StripeAdminService>();
    builder.Services.AddScoped<IUserService, UserService>();
    builder.Services.AddScoped<IReportService, ReportService>();

    // ─── 11. CORS ───
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? ["http://localhost:5173"];

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("ReactApp", policy =>
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
    });

    // ─── 12. Controllers ───
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();

    // ─── 13. Swagger with JWT ───
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "LumiSave API",
            Version = "v1",
            Description = "Energy efficiency platform — LED Calculator, Smart Home Calculator & E-Commerce"
        });

        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter JWT Bearer token: **Bearer {token}**"
        });

        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                },
                []
            }
        });
    });

    // ─── Build App ───────────────────────────────────────
    var app = builder.Build();

    // ─── Run migrations and seed ───
    await ApplyMigrationsAndSeedAsync(app);

    // ─── Middleware pipeline ───
    app.UseExceptionMiddleware();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "LumiSave API v1");
            c.RoutePrefix = "swagger";
        });
    }

    app.UseSerilogRequestLogging();
    app.UseCors("ReactApp");
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application startup failed");
}
finally
{
    Log.CloseAndFlush();
}

static async Task ApplyMigrationsAndSeedAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        logger.LogInformation("Applying migrations...");
        await context.Database.MigrateAsync();

        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        logger.LogInformation("Seeding data...");
        await LumiSave.Infrastructure.Data.DataSeeder.SeedAsync(context, userManager, roleManager);
        logger.LogInformation("Database ready.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Migration or seed failed.");
    }
}
