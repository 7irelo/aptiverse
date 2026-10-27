using Aptiverse.Identity.Authentication;
using Aptiverse.Identity.Domain;
using Aptiverse.Identity.Features.AcceptConsents;
using Aptiverse.Identity.Features.ChangeMyPassword;
using Aptiverse.Identity.Features.Common;
using Aptiverse.Identity.Features.CompleteOnboarding;
using Aptiverse.Identity.Features.ForgotPassword;
using Aptiverse.Identity.Features.GoogleSignIn;
using Aptiverse.Identity.Features.ListMySessions;
using Aptiverse.Identity.Features.Login;
using Aptiverse.Identity.Features.RefreshTokens;
using Aptiverse.Identity.Features.Register;
using Aptiverse.Identity.Features.RequestAccountDeletion;
using Aptiverse.Identity.Features.ResendVerification;
using Aptiverse.Identity.Features.ResetPassword;
using Aptiverse.Identity.Features.SaveOnboardingDetails;
using Aptiverse.Identity.Features.SetEducationLevel;
using Aptiverse.Identity.Features.UpdateMyProfile;
using Aptiverse.Identity.Features.VerifyEmail;
using Aptiverse.SharedKernel.Time;

namespace Aptiverse.IntegrationTests;

public sealed class IdentityValidatorTests
{
    private static readonly FixedClock Clock = new(new DateTimeOffset(2026, 10, 27, 10, 0, 0, TimeSpan.Zero));
    private static readonly string Token = SecureTokens.Create();

    [Theory]
    [InlineData("Thandi", "thandi@example.co.za", "long enough password", "student", true)]
    [InlineData("Thandi", "thandi@example.co.za", "long enough password", "parent", true)]
    [InlineData("Thandi", "thandi@example.co.za", "long enough password", "admin", false)]
    [InlineData("Thandi", "thandi@example.co.za", "short", "student", false)]
    [InlineData("Thandi", "thandi@example.co.za", "thandi@example.co.za", "student", false)]
    [InlineData("T", "thandi@example.co.za", "long enough password", "student", false)]
    [InlineData("12345", "thandi@example.co.za", "long enough password", "student", false)]
    [InlineData("Thandi", "thandi@example", "long enough password", "student", false)]
    [InlineData("Thandi", "thandi@@example.com", "long enough password", "student", false)]
    [InlineData("Thandi", "thandi example@x.com", "long enough password", "student", false)]
    public void Register(string name, string email, string password, string role, bool valid)
    {
        var request = new RegisterRequest(name, email, password, role, "2026-10-19", "2026-10-19");
        Assert.Equal(valid, new RegisterValidator().Validate(request).IsValid);
    }

    [Fact]
    public void Register_limits_lengths()
    {
        var validator = new RegisterValidator();
        Assert.False(validator.Validate(new RegisterRequest(new string('a', 121), "a@b.co", "long enough password", "student", "v", "v")).IsValid);
        Assert.False(validator.Validate(new RegisterRequest("Ann", new string('a', 252) + "@b.co", "long enough password", "student", "v", "v")).IsValid);
        Assert.False(validator.Validate(new RegisterRequest("Ann", "a@b.co", new string('p', 129), "student", "v", "v")).IsValid);
        Assert.False(validator.Validate(new RegisterRequest("Ann\u0007", "a@b.co", "long enough password", "student", "v", "v")).IsValid);
        Assert.False(validator.Validate(new RegisterRequest("Ann", "a@b.co", "long enough password", "student", new string('v', 33), "v")).IsValid);
    }

    [Theory]
    [InlineData("a@b.co", "x", true)]
    [InlineData("", "x", false)]
    [InlineData("a@b.co", "", false)]
    public void Login(string email, string password, bool valid)
    {
        Assert.Equal(valid, new LoginValidator().Validate(new LoginRequest(email, password)).IsValid);
        Assert.False(new LoginValidator().Validate(new LoginRequest("a@b.co", new string('p', 129))).IsValid);
    }

    [Fact]
    public void Tokens_must_look_like_issued_tokens()
    {
        Assert.True(new RefreshTokensValidator().Validate(new RefreshTokensRequest(Token)).IsValid);
        Assert.False(new RefreshTokensValidator().Validate(new RefreshTokensRequest(Token[..42])).IsValid);
        Assert.False(new RefreshTokensValidator().Validate(new RefreshTokensRequest(Token[..42] + "=")).IsValid);
        Assert.True(new VerifyEmailValidator().Validate(new VerifyEmailRequest(Token)).IsValid);
        Assert.False(new VerifyEmailValidator().Validate(new VerifyEmailRequest("x")).IsValid);
        Assert.True(new ResetPasswordValidator().Validate(new ResetPasswordRequest(Token, "long enough password")).IsValid);
        Assert.False(new ResetPasswordValidator().Validate(new ResetPasswordRequest(Token, "short")).IsValid);
        Assert.True(new GoogleSignInValidator().Validate(new GoogleSignInRequest("token")).IsValid);
        Assert.False(new GoogleSignInValidator().Validate(new GoogleSignInRequest(new string('t', 4097))).IsValid);
    }

    [Fact]
    public void Email_only_requests()
    {
        Assert.True(new ForgotPasswordValidator().Validate(new ForgotPasswordRequest("a@b.co")).IsValid);
        Assert.False(new ForgotPasswordValidator().Validate(new ForgotPasswordRequest(new string('a', 257))).IsValid);
        Assert.True(new ResendVerificationValidator().Validate(new ResendVerificationRequest()).IsValid);
        Assert.False(new ResendVerificationValidator().Validate(new ResendVerificationRequest("not-an-email")).IsValid);
    }

    [Theory]
    [InlineData("high_school", true)]
    [InlineData("tertiary", true)]
    [InlineData("primary", false)]
    [InlineData("HIGH_SCHOOL", false)]
    public void Education_level(string level, bool valid)
    {
        Assert.Equal(valid, new SetEducationLevelValidator().Validate(new SetEducationLevelRequest(level)).IsValid);
    }

    [Theory]
    [InlineData(11, "nsc", null, -16, true)]
    [InlineData(null, null, "phd", -30, true)]
    [InlineData(7, null, null, null, false)]
    [InlineData(null, "caps", null, null, false)]
    [InlineData(null, null, "nqf_7", null, false)]
    [InlineData(null, null, null, -9, false)]
    [InlineData(null, null, null, -81, false)]
    public void Onboarding_details(int? grade, string? curriculum, string? studyLevel, int? ageYears, bool valid)
    {
        var dob = ageYears is { } years ? DateOnly.FromDateTime(Clock.UtcNow.UtcDateTime).AddYears(years) : (DateOnly?)null;
        Assert.Equal(valid, new SaveOnboardingDetailsValidator(Clock).Validate(new SaveOnboardingDetailsRequest(grade, curriculum, studyLevel, null, null, dob)).IsValid);
    }

    [Fact]
    public void Onboarding_completion()
    {
        var validator = new CompleteOnboardingValidator(Clock);
        Assert.True(validator.Validate(new CompleteOnboardingRequest(AdultConfirmed: true)).IsValid);
        Assert.False(validator.Validate(new CompleteOnboardingRequest(AdultConfirmed: false)).IsValid);
        Assert.False(validator.Validate(new CompleteOnboardingRequest(Programme: "x")).IsValid);
        Assert.False(validator.Validate(new CompleteOnboardingRequest(InstitutionName: new string('i', 201))).IsValid);
        Assert.False(validator.Validate(new CompleteOnboardingRequest(EducationLevel: "university")).IsValid);
    }

    [Fact]
    public void Profile_update()
    {
        var validator = new UpdateMyProfileValidator(Clock);
        Assert.True(validator.Validate(new UpdateMyProfileRequest()).IsValid);
        Assert.True(validator.Validate(new UpdateMyProfileRequest { Name = "Sipho", PhoneNumber = "+27821234567" }).IsValid);
        Assert.True(validator.Validate(new UpdateMyProfileRequest { PhoneNumber = null }).IsValid);
        Assert.False(validator.Validate(new UpdateMyProfileRequest { PhoneNumber = "0821234567" }).IsValid);
        Assert.False(validator.Validate(new UpdateMyProfileRequest { Name = "1" }).IsValid);
        Assert.False(validator.Validate(new UpdateMyProfileRequest { AdultConfirmed = false }).IsValid);
    }

    [Fact]
    public void Password_change_and_deletion()
    {
        Assert.True(new ChangeMyPasswordValidator().Validate(new ChangeMyPasswordRequest("old password", "a new password")).IsValid);
        Assert.True(new ChangeMyPasswordValidator().Validate(new ChangeMyPasswordRequest(null, "a new password")).IsValid);
        Assert.False(new ChangeMyPasswordValidator().Validate(new ChangeMyPasswordRequest("same password", "same password")).IsValid);

        Assert.True(new RequestAccountDeletionValidator().Validate(new RequestAccountDeletionRequest("DELETE", "pw", "Done")).IsValid);
        Assert.False(new RequestAccountDeletionValidator().Validate(new RequestAccountDeletionRequest("delete")).IsValid);
        Assert.False(new RequestAccountDeletionValidator().Validate(new RequestAccountDeletionRequest("DELETE", Reason: new string('r', 1001))).IsValid);

        Assert.True(new AcceptConsentsValidator().Validate(new AcceptConsentsRequest("v1", "v1")).IsValid);
        Assert.False(new AcceptConsentsValidator().Validate(new AcceptConsentsRequest(string.Empty, "v1")).IsValid);
    }

    [Theory]
    [InlineData("  Mixed@Example.COM ", "Mixed@example.com")]
    [InlineData("plain@example.co.za", "plain@example.co.za")]
    public void Emails_keep_the_local_part_and_lowercase_the_domain(string input, string expected)
    {
        Assert.Equal(expected, EmailAddresses.Clean(input));
    }

    [Theory]
    [InlineData("2010-10-28", "2026-10-27", 15)]
    [InlineData("2010-10-27", "2026-10-27", 16)]
    [InlineData("2008-02-29", "2026-02-28", 17)]
    public void Ages_count_birthdays(string dob, string today, int age)
    {
        Assert.Equal(age, Ages.AgeOn(DateOnly.Parse(dob, System.Globalization.CultureInfo.InvariantCulture), DateOnly.Parse(today, System.Globalization.CultureInfo.InvariantCulture)));
    }

    [Theory]
    [InlineData("196.25.1.77", "196.25.1.0")]
    [InlineData("2001:db8:85a3:8d3:1319:8a2e:370:7348", "2001:db8:85a3::")]
    [InlineData("::ffff:10.1.2.3", "10.1.2.0")]
    [InlineData(null, null)]
    public void Session_ip_addresses_are_masked(string? ip, string? masked)
    {
        Assert.Equal(masked, SessionDisplay.MaskIp(ip));
    }

    [Fact]
    public void Device_labels_name_browser_and_os_only()
    {
        Assert.Equal(
            "Chrome on Android",
            SessionDisplay.DeviceLabel("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36"));
        Assert.Equal(
            "Safari on iOS",
            SessionDisplay.DeviceLabel("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"));
        Assert.Equal("Unknown device", SessionDisplay.DeviceLabel(null));
    }

    [Fact]
    public void Lockout_counts_failures_like_identity()
    {
        var user = User.Create("a@b.co", "A@B.CO", "Ann", emailConfirmed: true);
        var now = Clock.UtcNow;
        for (var i = 1; i < 5; i++)
        {
            Assert.False(user.RecordFailedSignIn(now, 5, TimeSpan.FromMinutes(15)));
        }

        Assert.True(user.RecordFailedSignIn(now, 5, TimeSpan.FromMinutes(15)));
        Assert.True(user.IsLockedOut(now.AddMinutes(14)));
        Assert.False(user.IsLockedOut(now.AddMinutes(15)));
        Assert.Equal(0, user.AccessFailedCount);
    }

    private sealed class FixedClock(DateTimeOffset now) : IClock
    {
        public DateTimeOffset UtcNow { get; } = now;
    }
}
