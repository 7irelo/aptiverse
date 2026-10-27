using Aptiverse.Academics.Domain;
using Aptiverse.Academics.Persistence.Configurations;
using Aptiverse.SharedKernel.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.Academics.Persistence;

internal sealed class AcademicsDbContext(DbContextOptions<AcademicsDbContext> options) : ModuleDbContext(options)
{
    public DbSet<Curriculum> Curricula => Set<Curriculum>();

    public DbSet<CatalogSubject> CatalogSubjects => Set<CatalogSubject>();

    public DbSet<CurriculumSubject> CurriculumSubjects => Set<CurriculumSubject>();

    public DbSet<Institution> Institutions => Set<Institution>();

    public DbSet<StudyUnit> StudyUnits => Set<StudyUnit>();

    public DbSet<Enrolment> Enrolments => Set<Enrolment>();

    public DbSet<Topic> Topics => Set<Topic>();

    public DbSet<Assessment> Assessments => Set<Assessment>();

    protected override string Schema => AcademicsModule.Schema;

    protected override void ApplyConfigurations(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new CurriculumConfiguration());
        modelBuilder.ApplyConfiguration(new CatalogSubjectConfiguration());
        modelBuilder.ApplyConfiguration(new CurriculumSubjectConfiguration());
        modelBuilder.ApplyConfiguration(new InstitutionConfiguration());
        modelBuilder.ApplyConfiguration(new StudyUnitConfiguration());
        modelBuilder.ApplyConfiguration(new EnrolmentConfiguration());
        modelBuilder.ApplyConfiguration(new TopicConfiguration());
        modelBuilder.ApplyConfiguration(new AssessmentConfiguration());
    }
}
