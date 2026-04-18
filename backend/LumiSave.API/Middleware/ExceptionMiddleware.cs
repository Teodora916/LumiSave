using System.Net;
using System.Text.Json;
using LumiSave.Application.DTOs.Common;
using LumiSave.Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace LumiSave.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = new ApiErrorResponse
        {
            Timestamp = DateTime.UtcNow
        };

        switch (exception)
        {
            case Domain.Exceptions.ValidationException ve:
                context.Response.StatusCode = ve.StatusCode;
                response.StatusCode = ve.StatusCode;
                response.Message = ve.Message;
                response.Errors = ve.Errors;
                break;

            case BusinessException be:
                context.Response.StatusCode = be.StatusCode;
                response.StatusCode = be.StatusCode;
                response.Message = be.Message;
                break;

            default:
                context.Response.StatusCode = 500;
                response.StatusCode = 500;
                response.Message = "An unexpected error occurred. Please try again later.";
                break;
        }

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}

public static class ExceptionMiddlewareExtensions
{
    public static IApplicationBuilder UseExceptionMiddleware(this IApplicationBuilder app)
        => app.UseMiddleware<ExceptionMiddleware>();
}
