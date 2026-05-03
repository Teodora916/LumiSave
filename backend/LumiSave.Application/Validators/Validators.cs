using FluentValidation;
using LumiSave.Application.DTOs.Auth;
using LumiSave.Application.DTOs.Calculator;
using LumiSave.Application.DTOs.Cart;
using LumiSave.Application.DTOs.Orders;
using LumiSave.Application.DTOs.Products;
using LumiSave.Application.DTOs.Reviews;

namespace LumiSave.Application.Validators;

// ─── Auth ───

public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one number.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");
        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password).WithMessage("Passwords do not match.");
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

// ─── Products ───

public class CreateProductValidator : AbstractValidator<CreateProductDto>
{
    private static readonly string[] AllowedBulbTypes =
        ["Incandescent", "CFL", "Halogen", "T8Fluorescent", "MR16", "PAR", "LED"];

    public CreateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.SKU).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CategoryId).NotEqual(Guid.Empty);
        RuleFor(x => x.BulbType)
            .Must(bt => bt == null || AllowedBulbTypes.Contains(bt))
            .WithMessage($"BulbType must be one of: {string.Join(", ", AllowedBulbTypes)}");
    }
}

public class UpdateProductValidator : AbstractValidator<UpdateProductDto>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Name).MaximumLength(300).When(x => x.Name != null);
        RuleFor(x => x.Price).GreaterThan(0).When(x => x.Price.HasValue);
        RuleFor(x => x.SKU).MaximumLength(100).When(x => x.SKU != null);
    }
}

// ─── Cart ───

public class AddToCartValidator : AbstractValidator<AddToCartDto>
{
    public AddToCartValidator()
    {
        RuleFor(x => x.ProductId).NotEqual(Guid.Empty);
        RuleFor(x => x.Quantity).InclusiveBetween(1, 100);
    }
}

public class UpdateCartItemValidator : AbstractValidator<UpdateCartItemDto>
{
    public UpdateCartItemValidator()
    {
        RuleFor(x => x.Quantity).InclusiveBetween(1, 100);
    }
}

// ─── Orders ───

public class CreateOrderValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.ShippingFirstName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ShippingLastName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ShippingAddress).NotEmpty().MaximumLength(500);
        RuleFor(x => x.ShippingCity).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ShippingPostalCode).NotEmpty().Length(4, 10);
        RuleFor(x => x.ShippingCountry).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ShippingPhone).NotEmpty().MaximumLength(50);
    }
}

// ─── Reviews ───

public class CreateReviewValidator : AbstractValidator<CreateReviewDto>
{
    public CreateReviewValidator()
    {
        RuleFor(x => x.Rating).InclusiveBetween(1, 5);
        RuleFor(x => x.Title).MaximumLength(200).When(x => x.Title != null);
        RuleFor(x => x.Comment).MaximumLength(2000).When(x => x.Comment != null);
    }
}

// ─── LED Calculator ───

public class LedCalculatorInputValidator : AbstractValidator<LedCalculatorInputDto>
{
    private static readonly string[] AllowedBulbTypes =
        ["Incandescent", "CFL", "Halogen", "T8Fluorescent", "MR16", "PAR", "LED"];

    public LedCalculatorInputValidator()
    {
        RuleFor(x => x.LightingGroups).NotEmpty().WithMessage("At least one lighting group is required.");
        RuleFor(x => x.LightingGroups).Must(g => g.Count <= 20)
            .WithMessage("Maximum 20 lighting groups allowed.");
        RuleFor(x => x.ElectricityPriceRsd).InclusiveBetween(1, 100);

        RuleForEach(x => x.LightingGroups).ChildRules(g =>
        {
            g.RuleFor(x => x.BulbCount).InclusiveBetween(1, 1000);
            g.RuleFor(x => x.DailyUsageHours).InclusiveBetween(0.1m, 24m);
            g.RuleFor(x => x.WattageOld).GreaterThan(0);
            g.RuleFor(x => x.BulbType)
                .NotEmpty()
                .Must(bt => AllowedBulbTypes.Contains(bt))
                .WithMessage($"BulbType must be one of: {string.Join(", ", AllowedBulbTypes)}");
        });
    }
}

// ─── Smart Home Calculator ───

public class SmartHomeCalculatorInputValidator : AbstractValidator<SmartHomeCalculatorInputDto>
{
    public SmartHomeCalculatorInputValidator()
    {
        RuleFor(x => x.ElectricityPriceRsd).InclusiveBetween(1, 100);

        RuleFor(x => x).Must(x =>
            x.VampirePower != null || x.SmartPlug != null ||
            x.Thermostat != null || x.LightingAutomation != null)
            .WithMessage("At least one module must be specified.");

        When(x => x.VampirePower != null, () =>
        {
            RuleForEach(x => x.VampirePower!.Devices).ChildRules(d =>
            {
                d.RuleFor(x => x.Quantity).InclusiveBetween(1, 50);
                d.RuleFor(x => x.DeviceType).NotEmpty();
            });
        });

        When(x => x.Thermostat != null, () =>
        {
            RuleFor(x => x.Thermostat!.MonthlyHeatingCostRsd).GreaterThan(0);
            RuleFor(x => x.Thermostat!.ZoneCount).InclusiveBetween(1, 20);
        });
    }
}
