using System.Reflection;
using NetArchTest.Rules;

namespace Aptiverse.ArchitectureTests;

public sealed class ModuleBoundaryTests
{
    [Theory]
    [MemberData(nameof(Modules.Names), MemberType = typeof(Modules))]
    public void Module_references_only_shared_kernel_and_contracts(string module)
    {
        var info = Modules.Get(module);

        var offending = AptiverseReferences(info.Implementation)
            .Where(name => name != Modules.SharedKernel.GetName().Name && !name.EndsWith(".Contracts", StringComparison.Ordinal))
            .ToList();

        Assert.True(offending.Count == 0, $"{module} references module internals: {string.Join(", ", offending)}");
    }

    [Theory]
    [MemberData(nameof(Modules.Names), MemberType = typeof(Modules))]
    public void Contracts_reference_no_module_implementation(string module)
    {
        var info = Modules.Get(module);

        var offending = AptiverseReferences(info.Contracts)
            .Where(name => !name.EndsWith(".Contracts", StringComparison.Ordinal))
            .ToList();

        Assert.True(offending.Count == 0, $"{module}.Contracts references: {string.Join(", ", offending)}");
    }

    [Fact]
    public void Shared_kernel_does_not_depend_on_modules()
    {
        var result = Types.InAssembly(Modules.SharedKernel)
            .ShouldNot()
            .HaveDependencyOnAny(Modules.All.Select(m => m.RootNamespace).ToArray())
            .GetResult();

        Assert.True(result.IsSuccessful, Describe(result));
    }

    [Theory]
    [MemberData(nameof(Modules.Names), MemberType = typeof(Modules))]
    public void Module_types_are_internal_except_registration_and_message_handlers(string module)
    {
        var info = Modules.Get(module);

        var leaked = info.Implementation.GetTypes()
            .Where(t => t.IsPublic && !IsCompilerGenerated(t))
            .Where(t => !IsRegistration(t, info) && !IsWolverineHandler(t))
            .Select(t => t.FullName)
            .ToList();

        Assert.True(leaked.Count == 0, $"Public types in {module}: {string.Join(", ", leaked)}");
    }

    [Theory]
    [MemberData(nameof(Modules.Names), MemberType = typeof(Modules))]
    public void Hosts_use_only_the_module_registration_surface(string module)
    {
        var info = Modules.Get(module);
        var internalNamespaces = info.Implementation.GetTypes()
            .Select(t => t.Namespace)
            .Where(ns => ns is not null && ns != info.RootNamespace)
            .Distinct()
            .ToArray();

        foreach (var host in Modules.Hosts)
        {
            var result = Types.InAssembly(host).ShouldNot().HaveDependencyOnAny(internalNamespaces!).GetResult();
            Assert.True(result.IsSuccessful, $"{host.GetName().Name}: {Describe(result)}");
        }
    }

    [Fact]
    public void Every_module_project_is_registered_for_these_rules()
    {
        var modulesDir = Path.Combine(RepoRoot(), "src", "Modules");
        var onDisk = Directory.GetDirectories(modulesDir)
            .SelectMany(Directory.GetDirectories)
            .Select(Path.GetFileName)
            .OfType<string>()
            .Where(name => name.StartsWith("Aptiverse.", StringComparison.Ordinal) && !name.EndsWith(".Contracts", StringComparison.Ordinal))
            .Select(name => name["Aptiverse.".Length..]);

        var unregistered = onDisk.Except(Modules.All.Select(m => m.Name), StringComparer.Ordinal).ToList();

        Assert.True(unregistered.Count == 0, $"Add to Modules.cs (and Host, Worker, Aptiverse.slnx): {string.Join(", ", unregistered)}");
    }

    private static string RepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "Aptiverse.slnx")))
        {
            dir = dir.Parent;
        }

        return dir?.FullName ?? throw new InvalidOperationException("Aptiverse.slnx not found above the test output folder.");
    }

    private static IEnumerable<string> AptiverseReferences(Assembly assembly) =>
        assembly.GetReferencedAssemblies()
            .Select(a => a.Name!)
            .Where(name => name.StartsWith("Aptiverse.", StringComparison.Ordinal));

    private static bool IsRegistration(Type type, ModuleInfo info) =>
        type.IsAbstract && type.IsSealed && type.Name == $"{info.Name}Module" && type.Namespace == info.RootNamespace;

    // Wolverine generates code against message handlers, so they must be public. Allowed only when every
    // Handle method consumes a message type from a Contracts assembly.
    private static bool IsWolverineHandler(Type type)
    {
        var handles = type.GetMethods(BindingFlags.Public | BindingFlags.Static | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.Name is "Handle" or "HandleAsync" or "Consume" or "ConsumeAsync")
            .ToList();

        return type.Name.EndsWith("Handler", StringComparison.Ordinal)
            && handles.Count > 0
            && handles.All(m => m.GetParameters().FirstOrDefault()?.ParameterType.Assembly.GetName().Name?.EndsWith(".Contracts", StringComparison.Ordinal) == true);
    }

    private static bool IsCompilerGenerated(Type type) =>
        type.GetCustomAttributes(typeof(System.Runtime.CompilerServices.CompilerGeneratedAttribute), false).Length > 0;

    private static string Describe(NetArchTest.Rules.TestResult result) =>
        result.IsSuccessful ? string.Empty : "Violations: " + string.Join(", ", result.FailingTypeNames ?? []);
}
