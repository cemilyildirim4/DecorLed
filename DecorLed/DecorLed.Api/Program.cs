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

// 4. JWT Kimlik Doğrulama Servisi (Dışarıdan okunan 'key' değişkenini verdik)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key), // <-- appsettings'ten gelen gerçek key
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 5. HTTP İstek Boru Hattı (Middleware Pipeline)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("ReactCorsPolicy");

// 🚨 KRİTİK DÜZELTME: Önce kimlik kontrolü (Authentication), sonra yetki kontrolü (Authorization)
app.UseAuthentication(); 
app.UseAuthorization();
app.UseStaticFiles();
app.MapControllers();
app.Run();