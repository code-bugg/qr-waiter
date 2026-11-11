using System.Security.Claims;

namespace Controllers;

public static class UserEndpoints
{
    public const string CommonRoute = "/api/users";

    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet($"{CommonRoute}/me", (ClaimsPrincipal user) =>
        {
            var subject = user.FindFirstValue("sub");
            if (string.IsNullOrWhiteSpace(subject))
            {
                return Results.Unauthorized();
            }

            var permissions = user.FindAll("permissions")
                .SelectMany(claim => claim.Value.Split(' ', StringSplitOptions.RemoveEmptyEntries))
                .Distinct(StringComparer.Ordinal)
                .ToArray();

            return Results.Ok(new
            {
                subject,
                permissions
            });
        })
        .RequireAuthorization();
    }
}