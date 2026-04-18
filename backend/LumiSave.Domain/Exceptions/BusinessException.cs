namespace LumiSave.Domain.Exceptions;

public class BusinessException : Exception
{
    public int StatusCode { get; }

    public BusinessException(string message, int statusCode = 400) : base(message)
    {
        StatusCode = statusCode;
    }
}

public class NotFoundException : BusinessException
{
    public NotFoundException(string entity, Guid id)
        : base($"{entity} with ID '{id}' was not found.", 404) { }

    public NotFoundException(string message)
        : base(message, 404) { }
}

public class UnauthorizedException : BusinessException
{
    public UnauthorizedException(string message = "Access denied.")
        : base(message, 401) { }
}

public class ConflictException : BusinessException
{
    public ConflictException(string message)
        : base(message, 409) { }
}

public class ValidationException : BusinessException
{
    public IEnumerable<string> Errors { get; }

    public ValidationException(IEnumerable<string> errors)
        : base("One or more validation errors occurred.", 422)
    {
        Errors = errors;
    }
}
