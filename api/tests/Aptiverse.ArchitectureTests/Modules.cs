using System.Reflection;
using Aptiverse.Identity;
using Aptiverse.Identity.Contracts;
using Aptiverse.SharedKernel.Domain;
using Aptiverse.Support;
using Aptiverse.Support.Contracts;

namespace Aptiverse.ArchitectureTests;

/// <summary>Registry of module assemblies. Add each new module here; the rules then apply to it automatically.</summary>
internal static class Modules
{
    public static readonly ModuleInfo[] All =
    [
        new("Identity", typeof(IdentityModule).Assembly, typeof(UserRegistered).Assembly),
        new("Support", typeof(SupportModule).Assembly, typeof(FaqPublished).Assembly),
    ];

    public static readonly Assembly SharedKernel = typeof(Entity).Assembly;

    public static readonly Assembly[] Hosts = [Assembly.Load("Aptiverse.Host"), Assembly.Load("Aptiverse.Worker")];

    public static TheoryData<string> Names => new(All.Select(m => m.Name));

    public static ModuleInfo Get(string name) => All.Single(m => m.Name == name);
}

internal sealed record ModuleInfo(string Name, Assembly Implementation, Assembly Contracts)
{
    public string RootNamespace => Implementation.GetName().Name!;
}
