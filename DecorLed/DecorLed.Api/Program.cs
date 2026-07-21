using DecorLed.Api.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Önce Konfigürasyonları Okuyoruz (Sıralama Önemli!)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var secretKey = builder.Configuration["JwtSettings:SecretKey"];

// Güvenlik Kontrolü: appsettings.json'da key unutulduysa sistem ayağa kalkarken uyarsın
if (string.IsNullOrEmpty(secretKey) || secretKey.Length < 32)
{
    throw new Exception("JWT SecretKey eksik veya 32 karakterden kısa! Lütfen appsettings.json dosyasını kontrol edin.");
}

var key = Encoding.UTF8.GetBytes(secretKey);

// 2. CORS Politikası
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactCorsPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 3. Bağımlılık Enjeksiyonları (Repositories)
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();

// 4. JWT Kimlik Doğrulama Servisi (Dışarıdan okunan 'key' değişkenini verdik)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]))
        };
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 🛠️ ENTEGRASYON: Swagger Konfigürasyonu (JWT Kilit Butonu Desteği)
builder.Services.AddSwaggerGen(opt =>
{
    opt.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "DecorLed API", Version = "v1" });

    // Swagger'a JWT Bearer güvenliğini tanımlıyoruz
    opt.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Lütfen kutucuğa 'Bearer {tokeniniz}' şeklinde giriniz. \n\nÖrnek: Bearer eyJhbGciOi...",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });

    // Tüm endpoint'lerin (uç noktaların) bu güvenlik kuralına tabi olabileceğini belirtiyoruz
    opt.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[]{}
        }
    });
});

var app = builder.Build();

// 5. HTTP İstek Boru Hattı (Middleware Pipeline)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("ReactCorsPolicy");

// 🔑 KRİTİK SIRALAMA DÜZELTMESİ: 
// Resimler ve statik dosyalar auth kontrolüne girmeden herkese açık olarak jet hızıyla dönsün.
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();