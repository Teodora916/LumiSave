using LumiSave.Domain.Entities;
using LumiSave.Domain.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LumiSave.Infrastructure.Data;

public static class DataSeeder
{
    private const string AdminEmail = "admin@lumisave.rs";
    private const string AdminPassword = "Admin123!";

    public static async Task SeedAsync(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager)
    {
        // Seed Roles
        await SeedRolesAsync(roleManager);

        // Seed Admin
        await SeedAdminAsync(userManager);

        // Seed Categories
        var categories = await SeedCategoriesAsync(context);

        // Seed Products
        await SeedProductsAsync(context, categories);
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole<Guid>> roleManager)
    {
        string[] roles = ["ADMIN", "CUSTOMER"];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
        }
    }

    private static async Task SeedAdminAsync(UserManager<ApplicationUser> userManager)
    {
        if (await userManager.FindByEmailAsync(AdminEmail) != null) return;

        var admin = new ApplicationUser
        {
            UserName = AdminEmail,
            Email = AdminEmail,
            FirstName = "Admin",
            LastName = "LumiSave",
            EmailConfirmed = true,
            IsActive = true
        };

        var result = await userManager.CreateAsync(admin, AdminPassword);
        if (result.Succeeded)
            await userManager.AddToRoleAsync(admin, "ADMIN");
    }

    private static async Task<Dictionary<string, Category>> SeedCategoriesAsync(AppDbContext context)
    {
        if (await context.Categories.IgnoreQueryFilters().AnyAsync())
            return await context.Categories.IgnoreQueryFilters()
                .ToDictionaryAsync(c => c.Name);

        var categories = new List<Category>
        {
            new() { Id = Guid.NewGuid(), Name = "LED Lighting", Slug = "led-lighting", Description = "High-efficiency LED bulbs and fixtures", SortOrder = 1 },
            new() { Id = Guid.NewGuid(), Name = "Smart Bulbs", Slug = "smart-bulbs", Description = "WiFi and Zigbee smart light bulbs", SortOrder = 2 },
            new() { Id = Guid.NewGuid(), Name = "Smart Switches & Dimmers", Slug = "smart-switches-dimmers", Description = "Smart wall switches and dimmers", SortOrder = 3 },
            new() { Id = Guid.NewGuid(), Name = "Smart Plugs", Slug = "smart-plugs", Description = "Smart power outlets and plugs", SortOrder = 4 },
            new() { Id = Guid.NewGuid(), Name = "Sensors & Detection", Slug = "sensors-detection", Description = "Motion, door, and environmental sensors", SortOrder = 5 },
            new() { Id = Guid.NewGuid(), Name = "Smart Thermostats", Slug = "smart-thermostats", Description = "Intelligent heating and cooling control", SortOrder = 6 },
            new() { Id = Guid.NewGuid(), Name = "Smart Hubs & Controllers", Slug = "smart-hubs-controllers", Description = "Central automation hubs", SortOrder = 7 },
            new() { Id = Guid.NewGuid(), Name = "Energy Monitors", Slug = "energy-monitors", Description = "Real-time electricity consumption monitoring", SortOrder = 8 },
            new() { Id = Guid.NewGuid(), Name = "Solar Kits", Slug = "solar-kits", Description = "Solar panels and starter sets", SortOrder = 9 },
            new() { Id = Guid.NewGuid(), Name = "Bundles", Slug = "bundles", Description = "Curated energy-saving package deals", SortOrder = 10 },
        };

        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();
        return categories.ToDictionary(c => c.Name);
    }

    private static async Task SeedProductsAsync(AppDbContext context, Dictionary<string, Category> categories)
    {
        if (await context.Products.IgnoreQueryFilters().AnyAsync()) return;

        var products = new List<Product>
        {
            // LED Lighting
            new()
            {
                Name = "Philips 10W E27 LED Bulb",
                Slug = "philips-10w-e27-led-bulb",
                Description = "Energy-saving LED bulb replacing 60W incandescent. Warm white light with 806lm output.",
                ShortDescription = "60W replacement, 806lm, 2700K warm white",
                SKU = "LED-E27-10W-001",
                Price = 690m, CompareAtPrice = 890m,
                StockQuantity = 200, CategoryId = categories["LED Lighting"].Id,
                Brand = "Philips", IsFeatured = true,
                WattageOld = 60, WattageLed = 10, LuminousFlux = 806,
                ColorTemperature = 2700, CRI = 80, SocketType = "E27",
                BulbType = "Incandescent", IsDimmable = false,
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Voltage": "220-240V", "Lifetime": "15000h", "EnergyClass": "A+"}"""
            },
            new()
            {
                Name = "OSRAM 14W E27 LED 100W Replacement",
                Slug = "osram-14w-e27-led-100w",
                Description = "High-power LED bulb replacing 100W incandescent. 1521lm daylight output.",
                ShortDescription = "100W replacement, 1521lm, 6500K daylight",
                SKU = "LED-E27-14W-002",
                Price = 890m, CompareAtPrice = 1190m,
                StockQuantity = 150, CategoryId = categories["LED Lighting"].Id,
                Brand = "OSRAM",
                WattageOld = 100, WattageLed = 14, LuminousFlux = 1521,
                ColorTemperature = 6500, CRI = 80, SocketType = "E27",
                BulbType = "Incandescent", IsDimmable = false,
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Voltage": "220-240V", "Lifetime": "15000h", "EnergyClass": "A++"}"""
            },
            new()
            {
                Name = "Ledvance 7W GU10 LED Spot",
                Slug = "ledvance-7w-gu10-led-spot",
                Description = "GU10 LED spotlight replacing 50W halogen. Perfect for kitchen and bathroom.",
                ShortDescription = "50W halogen replacement, 400lm",
                SKU = "LED-GU10-7W-003",
                Price = 590m, CompareAtPrice = 790m,
                StockQuantity = 250, CategoryId = categories["LED Lighting"].Id,
                Brand = "Ledvance",
                WattageOld = 50, WattageLed = 7, LuminousFlux = 400,
                ColorTemperature = 3000, CRI = 80, SocketType = "GU10",
                BulbType = "Halogen", IsDimmable = true,
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Voltage": "220-240V", "BeamAngle": "36°", "Lifetime": "20000h"}"""
            },
            new()
            {
                Name = "Philips 18W T8 LED Tube 120cm",
                Slug = "philips-18w-t8-led-tube-120cm",
                Description = "T8 LED tube replacing 36W fluorescent. Direct replacement, no ballast needed.",
                ShortDescription = "36W fluorescent replacement, 2000lm",
                SKU = "LED-T8-18W-004",
                Price = 1290m, CompareAtPrice = 1690m,
                StockQuantity = 100, CategoryId = categories["LED Lighting"].Id,
                Brand = "Philips",
                WattageOld = 36, WattageLed = 18, LuminousFlux = 2000,
                ColorTemperature = 4000, CRI = 80, SocketType = "G13",
                BulbType = "T8Fluorescent", IsDimmable = false,
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Length": "120cm", "Voltage": "220-240V", "Lifetime": "50000h"}"""
            },

            // Smart Bulbs
            new()
            {
                Name = "TP-Link Tapo L530E Smart Bulb",
                Slug = "tp-link-tapo-l530e-smart-bulb",
                Description = "WiFi smart bulb with 16 million colors, voice control, and scheduling. No hub required.",
                ShortDescription = "WiFi, 16M colors, 806lm, works with Alexa & Google",
                SKU = "SMART-BULB-001",
                Price = 1890m, CompareAtPrice = 2490m,
                StockQuantity = 80, CategoryId = categories["Smart Bulbs"].Id,
                Brand = "TP-Link", IsFeatured = true, IsSmartDevice = true,
                WattageLed = 8, LuminousFlux = 806, SocketType = "E27", IsDimmable = true,
                SmartProtocol = "WiFi", SmartHomeCategory = "SmartBulb", StandbyWattage = 0.5m,
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Protocol": "WiFi 2.4GHz", "App": "Tapo", "ColorRange": "2500K-6500K"}"""
            },
            new()
            {
                Name = "IKEA TRÅDFRI LED E27 Zigbee",
                Slug = "ikea-tradfri-led-e27-zigbee",
                Description = "Zigbee smart bulb with long range and low power standby. Works with IKEA Dirigera hub.",
                ShortDescription = "Zigbee, warm white, 1000lm, requires hub",
                SKU = "SMART-BULB-002",
                Price = 1290m,
                StockQuantity = 120, CategoryId = categories["Smart Bulbs"].Id,
                Brand = "IKEA", IsSmartDevice = true,
                WattageLed = 9, LuminousFlux = 1000, SocketType = "E27", IsDimmable = true,
                SmartProtocol = "Zigbee", SmartHomeCategory = "SmartBulb", StandbyWattage = 0.3m,
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Protocol": "Zigbee 3.0", "ColorTemperature": "2200K-4000K"}"""
            },

            // Smart Plugs
            new()
            {
                Name = "TP-Link Tapo P110 Smart Plug with Energy Monitoring",
                Slug = "tp-link-tapo-p110-smart-plug",
                Description = "WiFi smart plug with real-time energy monitoring. Track consumption per device.",
                ShortDescription = "WiFi, energy monitoring, 3680W max",
                SKU = "SMART-PLUG-001",
                Price = 1790m, CompareAtPrice = 2290m,
                StockQuantity = 150, CategoryId = categories["Smart Plugs"].Id,
                Brand = "TP-Link", IsFeatured = true, IsSmartDevice = true,
                SmartProtocol = "WiFi", SmartHomeCategory = "SmartPlug", StandbyWattage = 0.5m,
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"MaxLoad": "3680W", "Protocol": "WiFi 2.4GHz", "Monitoring": "Real-time"}"""
            },
            new()
            {
                Name = "Shelly Plug S Smart Plug",
                Slug = "shelly-plug-s-smart-plug",
                Description = "Compact WiFi smart plug with energy metering. Local API support for advanced automation.",
                ShortDescription = "WiFi, energy metering, local API",
                SKU = "SMART-PLUG-002",
                Price = 2290m,
                StockQuantity = 90, CategoryId = categories["Smart Plugs"].Id,
                Brand = "Shelly", IsSmartDevice = true,
                SmartProtocol = "WiFi", SmartHomeCategory = "SmartPlug", StandbyWattage = 0.4m,
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"MaxLoad": "2500W", "Protocol": "WiFi 2.4GHz", "API": "REST/MQTT"}"""
            },
            new()
            {
                Name = "SONOFF S26R2 WiFi Smart Plug",
                Slug = "sonoff-s26r2-wifi-smart-plug",
                Description = "Affordable WiFi smart plug with scheduling and voice control.",
                ShortDescription = "WiFi, scheduling, Alexa/Google Home",
                SKU = "SMART-PLUG-003",
                Price = 1190m,
                StockQuantity = 200, CategoryId = categories["Smart Plugs"].Id,
                Brand = "SONOFF", IsSmartDevice = true,
                SmartProtocol = "WiFi", SmartHomeCategory = "SmartPlug", StandbyWattage = 0.3m,
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"MaxLoad": "2300W", "Protocol": "WiFi 2.4GHz"}"""
            },

            // Sensors & Detection
            new()
            {
                Name = "Aqara Motion Sensor P1",
                Slug = "aqara-motion-sensor-p1",
                Description = "Zigbee PIR motion sensor with 5m range and 170° detection angle.",
                ShortDescription = "Zigbee, 5m range, 170° detection",
                SKU = "SENSOR-PIR-001",
                Price = 1990m,
                StockQuantity = 75, CategoryId = categories["Sensors & Detection"].Id,
                Brand = "Aqara", IsSmartDevice = true,
                SmartProtocol = "Zigbee", SmartHomeCategory = "Sensor",
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Range": "5m", "Angle": "170°", "Battery": "CR2450", "Zigbee": "3.0"}"""
            },
            new()
            {
                Name = "Shelly Door/Window Sensor",
                Slug = "shelly-door-window-sensor",
                Description = "WiFi door and window sensor with real-time alerts and automation.",
                ShortDescription = "WiFi, magnetic, 1 year battery",
                SKU = "SENSOR-DW-001",
                Price = 1590m,
                StockQuantity = 60, CategoryId = categories["Sensors & Detection"].Id,
                Brand = "Shelly", IsSmartDevice = true,
                SmartProtocol = "WiFi", SmartHomeCategory = "Sensor",
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Battery": "CR2032", "Range": "50m", "Protocol": "WiFi 2.4GHz"}"""
            },

            // Smart Thermostats
            new()
            {
                Name = "Tado Smart Thermostat Starter Kit",
                Slug = "tado-smart-thermostat-starter-kit",
                Description = "Complete smart thermostat system with geofencing and AI learning. Saves up to 22% on heating.",
                ShortDescription = "Geofencing, AI learning, saves 22% on heating",
                SKU = "THERM-001",
                Price = 14990m, CompareAtPrice = 18990m,
                StockQuantity = 25, CategoryId = categories["Smart Thermostats"].Id,
                Brand = "Tado", IsFeatured = true, IsSmartDevice = true,
                SmartProtocol = "WiFi", SmartHomeCategory = "Thermostat",
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Heating": "Gas/Electric/HeatPump", "Zones": "1+", "Geofencing": "Yes"}"""
            },
            new()
            {
                Name = "Salus SP600 WiFi Smart Plug Thermostat",
                Slug = "salus-sp600-wifi-smart-plug-thermostat",
                Description = "Smart plug thermostat for electric heaters. Schedule and control remotely.",
                ShortDescription = "WiFi, 3600W, for electric heaters",
                SKU = "THERM-002",
                Price = 3990m,
                StockQuantity = 40, CategoryId = categories["Smart Thermostats"].Id,
                Brand = "Salus", IsSmartDevice = true,
                SmartProtocol = "WiFi", SmartHomeCategory = "Thermostat",
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"MaxLoad": "3600W", "Protocol": "WiFi 2.4GHz", "TempRange": "5-40°C"}"""
            },

            // Smart Hubs
            new()
            {
                Name = "SONOFF Zigbee 3.0 USB Dongle Plus",
                Slug = "sonoff-zigbee-30-usb-dongle-plus",
                Description = "USB Zigbee coordinator compatible with Home Assistant, Zigbee2MQTT. No subscription.",
                ShortDescription = "Zigbee coordinator, Home Assistant compatible",
                SKU = "HUB-ZB-001",
                Price = 2890m,
                StockQuantity = 55, CategoryId = categories["Smart Hubs & Controllers"].Id,
                Brand = "SONOFF", IsSmartDevice = true,
                SmartProtocol = "Zigbee", SmartHomeCategory = "Hub",
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Standard": "Zigbee 3.0", "Range": "100m", "Devices": "200+"}"""
            },

            // Energy Monitors
            new()
            {
                Name = "Shelly 3EM Three-Phase Energy Monitor",
                Slug = "shelly-3em-three-phase-energy-monitor",
                Description = "Professional three-phase energy monitor with real-time data and export.",
                ShortDescription = "3-phase, 120A per phase, local API",
                SKU = "ENERGY-MON-001",
                Price = 8990m, CompareAtPrice = 11990m,
                StockQuantity = 20, CategoryId = categories["Energy Monitors"].Id,
                Brand = "Shelly", IsFeatured = true, IsSmartDevice = true,
                SmartProtocol = "WiFi", SmartHomeCategory = "EnergyMonitor",
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Phases": "3", "MaxCurrent": "120A/phase", "API": "REST/MQTT"}"""
            },
            new()
            {
                Name = "Emporia Vue 2 Energy Monitor",
                Slug = "emporia-vue-2-energy-monitor",
                Description = "Smart home energy monitor with circuit-level tracking. 16 individual circuits.",
                ShortDescription = "16 circuit monitoring, cloud dashboard",
                SKU = "ENERGY-MON-002",
                Price = 6490m,
                StockQuantity = 30, CategoryId = categories["Energy Monitors"].Id,
                Brand = "Emporia", IsSmartDevice = true,
                SmartProtocol = "WiFi", SmartHomeCategory = "EnergyMonitor",
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Circuits": "16", "Protocol": "WiFi 2.4GHz", "CloudSync": "Yes"}"""
            },

            // Solar Kits
            new()
            {
                Name = "Balcony Solar Power Station 600W",
                Slug = "balcony-solar-power-station-600w",
                Description = "Plug-and-play balcony solar kit with 2x300W panels and micro-inverter. Easy installation.",
                ShortDescription = "2x300W panels + micro-inverter, plug & play",
                SKU = "SOLAR-600W-001",
                Price = 89900m, CompareAtPrice = 110000m,
                StockQuantity = 10, CategoryId = categories["Solar Kits"].Id,
                Brand = "Hoymiles", IsFeatured = true,
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Power": "600W", "Panels": "2x300W", "Inverter": "600W", "Warranty": "10 years"}"""
            },

            // Smart Switches
            new()
            {
                Name = "Shelly 1 Mini WiFi Smart Switch",
                Slug = "shelly-1-mini-wifi-smart-switch",
                Description = "Compact WiFi relay for any switch or button. Fits in standard junction boxes.",
                ShortDescription = "WiFi relay, 10A, in-wall installation",
                SKU = "SWITCH-001",
                Price = 1490m,
                StockQuantity = 100, CategoryId = categories["Smart Switches & Dimmers"].Id,
                Brand = "Shelly", IsSmartDevice = true,
                SmartProtocol = "WiFi", SmartHomeCategory = "SmartSwitch",
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"MaxLoad": "2300W", "Protocol": "WiFi 2.4GHz", "API": "REST/MQTT"}"""
            },

            // Bundles
            new()
            {
                Name = "Smart Home Starter Bundle",
                Slug = "smart-home-starter-bundle",
                Description = "Everything you need to start your smart home journey: 4 smart plugs + 2 smart bulbs + 1 motion sensor.",
                ShortDescription = "4x Smart Plug + 2x Smart Bulb + Motion Sensor",
                SKU = "BUNDLE-STARTER-001",
                Price = 9490m, CompareAtPrice = 13290m,
                StockQuantity = 30, CategoryId = categories["Bundles"].Id,
                IsFeatured = true, IsSmartDevice = true,
                SmartProtocol = "WiFi",
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Includes": "4x TP-Link P110, 2x Tapo L530E, 1x Aqara Motion Sensor"}"""
            },
            new()
            {
                Name = "LED Office Upgrade Kit",
                Slug = "led-office-upgrade-kit",
                Description = "Complete LED lighting upgrade for a standard office: 10x T8 LED tubes + 6x E27 LED bulbs.",
                ShortDescription = "10x T8 18W + 6x E27 10W LED tubes",
                SKU = "BUNDLE-LED-OFFICE-001",
                Price = 19490m, CompareAtPrice = 25990m,
                StockQuantity = 15, CategoryId = categories["Bundles"].Id,
                WattageLed = 18, WattageOld = 36, BulbType = "T8Fluorescent",
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Includes": "10x Philips T8 18W, 6x Philips E27 10W", "TotalSavings": "~70%"}"""
            },
            new()
            {
                Name = "Vampire Power Killer Bundle",
                Slug = "vampire-power-killer-bundle",
                Description = "5x smart plugs with energy monitoring to eliminate standby power waste in your home.",
                ShortDescription = "5x Smart Plugs with energy monitoring",
                SKU = "BUNDLE-VAMPIRE-001",
                Price = 7490m, CompareAtPrice = 8950m,
                StockQuantity = 40, CategoryId = categories["Bundles"].Id,
                IsSmartDevice = true, SmartProtocol = "WiFi", SmartHomeCategory = "SmartPlug",
                ImageUrls = """["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500"]""",
                Specifications = """{"Includes": "5x TP-Link Tapo P110", "AnnualSavings": "~3000 RSD"}"""
            }
        };

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();
    }
}
