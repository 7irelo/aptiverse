using System.Reflection;
using Aptiverse.Academics;
using Aptiverse.Academics.Contracts;
using Aptiverse.AiTutor;
using Aptiverse.AiTutor.Contracts;
using Aptiverse.Identity;
using Aptiverse.Identity.Contracts;
using Aptiverse.Practice;
using Aptiverse.Practice.Contracts;
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
        new("AiTutor", typeof(AiTutorModule).Assembly, typeof(TutorTurnCompleted).Assembly, Schema: AiTutorModule.Schema),
        new("Academics", typeof(AcademicsModule).Assembly, typeof(StudyUnitEnrolled).Assembly),
        new("Practice", typeof(PracticeModule).Assembly, typeof(PracticeAttemptGraded).Assembly),
    ];

    public static readonly Assembly SharedKernel = typeof(Entity).Assembly;

    public static readonly Assembly[] Hosts = [Assembly.Load("Aptiverse.Host"), Assembly.Load("Aptiverse.Worker")];

    public static TheoryData<string> Names => new(All.Select(m => m.Name));

    public static ModuleInfo Get(string name) => All.Single(m => m.Name == name);
}

/// <summary>A registered module. Schema is set only when it differs from the lower-cased module name.</summary>
internal sealed record ModuleInfo(string Name, Assembly Implementation, Assembly Contracts, string? Schema = null)
{
    public string RootNamespace => Implementation.GetName().Name!;

    public string ExpectedSchema => Schema ?? Name.ToLowerInvariant();
}
