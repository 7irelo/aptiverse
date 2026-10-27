using Aptiverse.Family.Domain;

namespace Aptiverse.Family.UnitTests;

public sealed class SecretsTests
{
    [Fact]
    public void Link_codes_are_twelve_crockford_characters_and_differ_every_time()
    {
        var codes = Enumerable.Range(0, 200).Select(_ => LinkCodes.NewCode()).ToList();

        Assert.All(codes, c =>
        {
            Assert.Equal(LinkCodes.Length, c.Length);
            Assert.Matches("^[0-9A-HJKMNP-TV-Z]{12}$", c);
            Assert.Equal(c, LinkCodes.Normalize(c));
        });
        Assert.Equal(codes.Count, codes.Distinct(StringComparer.Ordinal).Count());
    }

    [Theory]
    [InlineData("abcd-efgh-jkmn", "ABCDEFGHJKMN")]
    [InlineData(" ABCD EFGH JKMN ", "ABCDEFGHJKMN")]
    [InlineData("oOiI-lLAB-CDEF", "001111ABCDEF")]
    public void Typed_codes_are_normalised(string input, string expected) => Assert.Equal(expected, LinkCodes.Normalize(input));

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("ABCD-EFGH-JKM")]
    [InlineData("ABCD-EFGH-JKMNP")]
    [InlineData("ABCD-EFGH-JKMU")]
    [InlineData("ABCD-EFGH-JKM!")]
    [InlineData("ABCD----------EFGH-JKMN")]
    public void Malformed_codes_are_rejected(string? input) => Assert.Null(LinkCodes.Normalize(input));

    [Fact]
    public void Display_selector_and_hash_split_the_code()
    {
        const string code = "7K3Q9XWM2HCD";

        Assert.Equal("7K3Q-9XWM-2HCD", LinkCodes.Display(code));
        Assert.Equal("7K3Q", LinkCodes.SelectorOf(code));
        Assert.Equal(LinkCodes.HashLength, LinkCodes.Hash(code).Length);
        Assert.DoesNotContain(code, LinkCodes.Hash(code), StringComparison.OrdinalIgnoreCase);
        Assert.True(LinkCodes.HashesEqual(LinkCodes.Hash(code), LinkCodes.Hash(LinkCodes.Normalize("7k3q-9xwm-2hcd")!)));
        Assert.False(LinkCodes.HashesEqual(LinkCodes.Hash(code), LinkCodes.Hash("7K3Q9XWM2HCE")));
    }

    [Fact]
    public void Invite_tokens_are_256_bit_base64url_and_stored_only_as_a_hash()
    {
        var token = InviteTokens.NewToken();

        Assert.Equal(43, token.Length);
        Assert.True(InviteTokens.IsWellFormed(token));
        Assert.Equal(InviteTokens.HashLength, InviteTokens.Hash(token).Length);
        Assert.NotEqual(token, InviteTokens.Hash(token));
        Assert.False(InviteTokens.IsWellFormed("short"));
        Assert.False(InviteTokens.IsWellFormed(new string('a', 42) + "/"));
    }

    [Fact]
    public void A_code_burns_after_the_allowed_wrong_guesses()
    {
        var code = LinkCode.Create(Guid.NewGuid(), "ABCD", LinkCodes.Hash("ABCDEFGHJKMN"), TestDb.Now.AddMinutes(15));

        for (var i = 0; i < 4; i++)
        {
            code.RecordFailure(5);
        }

        Assert.True(code.IsActive);
        code.RecordFailure(5);
        Assert.Equal(LinkCodeStatuses.Burned, code.Status);
    }

    [Fact]
    public void Codes_and_invites_expire_at_their_expiry_time()
    {
        var code = LinkCode.Create(Guid.NewGuid(), "ABCD", LinkCodes.Hash("ABCDEFGHJKMN"), TestDb.Now);
        var invite = FamilyInvite.Create(Guid.NewGuid(), "kid@example.test", "Pat", Relationships.Mother, InviteTokens.Hash("t"), TestDb.Now);

        Assert.False(code.IsExpired(TestDb.Now.AddTicks(-1)));
        Assert.True(code.IsExpired(TestDb.Now));
        Assert.Equal(InviteStatuses.Pending, invite.EffectiveStatus(TestDb.Now.AddTicks(-1)));
        Assert.Equal(InviteStatuses.Expired, invite.EffectiveStatus(TestDb.Now));
    }

    [Theory]
    [InlineData("john.smith@gmail.com", "j***@g***.com")]
    [InlineData("a@b.co.za", "a***@b***.za")]
    [InlineData("x@localhost", "x***@l***")]
    [InlineData("not-an-email", "***")]
    public void Emails_are_masked(string email, string masked) => Assert.Equal(masked, Emails.Mask(email));
}
