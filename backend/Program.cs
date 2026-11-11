using backend.Data;
using backend.Health;
using backend.Database;
using Controllers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSingleton<IDbConnectionFactory, NpgsqlConnectionFactory>();
builder.Services.AddScoped<ITableSessionRepository, TableSessionRepository>();
builder.Services.AddHealthChecks().AddCheck<DatabaseHealthCheck>("database");

var auth0Domain = builder.Configuration["Auth0:Domain"];
var auth0Audience = builder.Configuration["Auth0:Audience"];
if (string.IsNullOrWhiteSpace(auth0Domain) || string.IsNullOrWhiteSpace(auth0Audience))
{
    throw new InvalidOperationException(
        "Auth0:Domain and Auth0:Audience must be configured.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{auth0Domain.TrimEnd('/')}/";
        options.Audience = auth0Audience;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            NameClaimType = "sub"
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Waiter", policy =>
        policy.RequireAuthenticatedUser()
            .RequireClaim("permissions", "create:sessions"));
});

var app = builder.Build();

var connectionString = app.Configuration
    .GetConnectionString("DefaultConnection");

if (!app.Environment.IsDevelopment() && string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection is not configured.");
}

if (!string.IsNullOrWhiteSpace(connectionString))
{
    DatabaseMigrator.Run(connectionString);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapTableSessionEndpoints();
app.MapUserEndpoints();

app.MapHealthChecks("/health");

app.Run();
