using Aptiverse.Billing.Contracts;
using Aptiverse.Family.Domain;
using Aptiverse.Family.Features.Common;
using Microsoft.Extensions.Options;
using NSubstitute;

namespace Aptiverse.Family.UnitTests;

public sealed class PolicyTests
{
    private static CancellationToken Ct => TestContext.Current.CancellationToken;

    [Theory]
    [InlineData("parent.1", 1)]
    [InlineData("parent.4", 4)]
    [InlineData("free", 0)]
    [InlineData("student.pro", 0)]
    [InlineData("parent.", 0)]
    [InlineData("parent.x", 0)]
    [InlineData("parent.-2", 0)]
    public void Seats_come_from_the_parent_plan_code(string planCode, int seats) => Assert.Equal(seats, ChildAllowance.SeatsOf(planCode));

    [Theory]
    [InlineData(new[] { "free" }, 1)]
    [InlineData(new[] { "free", "parent.2" }, 2)]
    [InlineData(new[] { "free", "parent.1", "parent.3" }, 3)]
    [InlineData(new[] { "free", "parent.4" }, 4)]
    public async Task The_child_limit_follows_the_best_parent_plan(string[] plans, int expected)
    {
        var allowance = Allowance(plans, childrenWithoutPlan: 1, maxChildren: 6);

        Assert.Equal(expected, await allowance.ForAsync(Guid.NewGuid(), Ct));
    }

    [Fact]
    public async Task The_hard_ceiling_caps_any_plan()
    {
        var allowance = Allowance(["free", "parent.4"], childrenWithoutPlan: 1, maxChildren: 3);

        Assert.Equal(3, await allowance.ForAsync(Guid.NewGuid(), Ct));
    }

    [Fact]
    public void Consent_status_derives_from_age_and_the_latest_row()
    {
        var parent = Guid.NewGuid();
        var other = Guid.NewGuid();
        var student = Guid.NewGuid();
        var grant = ParentalConsentRecord.Grant(student, parent, "v1", "127.0.0.1", "ua", TestDb.Now);
        var withdrawn = ParentalConsentRecord.Withdraw(grant, ConsentRecordSources.Parent, TestDb.Now.AddDays(1));

        Assert.Equal(ConsentStatuses.NotRequired, ConsentView.Of(false, grant, parent).Status);
        Assert.Equal(ConsentStatuses.Required, ConsentView.Of(true, null, parent).Status);
        Assert.Equal(ConsentStatuses.Required, ConsentView.Of(null, null, parent).Status);

        var granted = ConsentView.Of(true, grant, parent);
        Assert.Equal(ConsentStatuses.Granted, granted.Status);
        Assert.True(granted.GrantedByYou);
        Assert.Equal("v1", granted.DocumentVersion);
        Assert.False(ConsentView.Of(true, grant, other).GrantedByYou);

        var after = ConsentView.Of(true, withdrawn, parent);
        Assert.Equal(ConsentStatuses.Withdrawn, after.Status);
        Assert.Null(after.GrantedAt);
    }

    [Fact]
    public void Removing_a_link_is_one_way_and_sharing_changes_are_detected()
    {
        var link = FamilyLink.Create(Guid.NewGuid(), Guid.NewGuid(), Relationships.Father, LinkMethods.LinkCode, Guid.NewGuid(), TestDb.Now);

        Assert.Equal(new Contracts.SharingFlags(true, true, true, false), link.Sharing);
        Assert.False(link.SetSharing(new Contracts.SharingFlags(true, true, true, false), TestDb.Now));
        Assert.True(link.SetSharing(new Contracts.SharingFlags(false, true, true, true), TestDb.Now.AddMinutes(1)));
        Assert.Equal(TestDb.Now.AddMinutes(1), link.SharingChangedAt);

        Assert.True(link.Remove(RemovedBy.Student, TestDb.Now));
        Assert.False(link.Remove(RemovedBy.Parent, TestDb.Now));
        Assert.Equal(RemovedBy.Student, link.RemovedByRole);
    }

    private static ChildAllowance Allowance(IReadOnlyList<string> plans, int childrenWithoutPlan, int maxChildren)
    {
        var entitlements = Substitute.For<IEntitlements>();
        entitlements.GetAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
            .Returns(new EntitlementSet([], plans, plans[^1], null));
        return new ChildAllowance(entitlements, Options.Create(new FamilyOptions { ChildrenWithoutPlan = childrenWithoutPlan, MaxChildren = maxChildren }));
    }
}
