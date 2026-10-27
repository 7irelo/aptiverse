using Aptiverse.SharedKernel.Domain;

namespace Aptiverse.Academics.Domain;

/// <summary>An exam body following CAPS (decision 29): "nsc" or "ieb". Reference data from the seeder.</summary>
internal sealed class Curriculum : Entity
{
    public const int CodeMaxLength = 16;
    public const int NameMaxLength = 120;
    public const int ShortNameMaxLength = 16;
    public const int DescriptionMaxLength = 500;

    private Curriculum()
    {
    }

    public string Code { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public string ShortName { get; private set; } = string.Empty;

    public string? Description { get; private set; }

    public static Curriculum Create(string code, string name, string shortName, string? description) => new()
    {
        Code = code,
        Name = name,
        ShortName = shortName,
        Description = description,
    };

    /// <summary>Returns true when anything changed.</summary>
    public bool Update(string name, string shortName, string? description)
    {
        if (Name == name && ShortName == shortName && Description == description)
        {
            return false;
        }

        Name = name;
        ShortName = shortName;
        Description = description;
        return true;
    }
}

/// <summary>A CAPS subject. The slug is the old app's subject id, kept so units and migrated data can key on it.</summary>
internal sealed class CatalogSubject : Entity
{
    public const int SlugMaxLength = 32;
    public const int CodeMaxLength = 8;
    public const int NameMaxLength = 120;
    public const int CategoryMaxLength = 24;
    public const int LanguageTypeMaxLength = 24;
    public const int DescriptionMaxLength = 500;

    private CatalogSubject()
    {
    }

    public string Slug { get; private set; } = string.Empty;

    public string Code { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public string Category { get; private set; } = string.Empty;

    public string? LanguageType { get; private set; }

    public string? Description { get; private set; }

    /// <summary>Inactive subjects are hidden from pickers and refuse new enrolments but keep existing ones.</summary>
    public bool IsActive { get; private set; } = true;

    public static CatalogSubject Create(string slug, string code, string name, string category, string? languageType, string? description) => new()
    {
        Slug = slug,
        Code = code,
        Name = name,
        Category = category,
        LanguageType = languageType,
        Description = description,
        IsActive = true,
    };

    public bool Update(string code, string name, string category, string? languageType, string? description)
    {
        if (Code == code && Name == name && Category == category && LanguageType == languageType && Description == description && IsActive)
        {
            return false;
        }

        Code = code;
        Name = name;
        Category = category;
        LanguageType = languageType;
        Description = description;
        IsActive = true;
        return true;
    }

    public bool Deactivate()
    {
        if (!IsActive)
        {
            return false;
        }

        IsActive = false;
        return true;
    }
}

/// <summary>Which subjects a curriculum offers, for which grades.</summary>
internal sealed class CurriculumSubject : Entity
{
    public const int NotesMaxLength = 300;
    public const short MinGradeAllowed = 8;
    public const short MaxGradeAllowed = 12;

    private CurriculumSubject()
    {
    }

    public Guid CurriculumId { get; private set; }

    public Guid SubjectId { get; private set; }

    public short MinGrade { get; private set; }

    public short MaxGrade { get; private set; }

    public bool IsCompulsory { get; private set; }

    public string? Notes { get; private set; }

    public static CurriculumSubject Create(Guid curriculumId, Guid subjectId, short minGrade, short maxGrade, bool isCompulsory, string? notes) => new()
    {
        CurriculumId = curriculumId,
        SubjectId = subjectId,
        MinGrade = minGrade,
        MaxGrade = maxGrade,
        IsCompulsory = isCompulsory,
        Notes = notes,
    };

    public bool Update(short minGrade, short maxGrade, bool isCompulsory, string? notes)
    {
        if (MinGrade == minGrade && MaxGrade == maxGrade && IsCompulsory == isCompulsory && Notes == notes)
        {
            return false;
        }

        MinGrade = minGrade;
        MaxGrade = maxGrade;
        IsCompulsory = isCompulsory;
        Notes = notes;
        return true;
    }
}

/// <summary>A tertiary institution. Courses created by its students are shared through it.</summary>
internal sealed class Institution : Entity
{
    public const int SlugMaxLength = 32;
    public const int NameMaxLength = 160;
    public const int ShortNameMaxLength = 24;
    public const int TypeMaxLength = 32;
    public const int ProvinceMaxLength = 32;

    private Institution()
    {
    }

    public string Slug { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public string? ShortName { get; private set; }

    public string Type { get; private set; } = string.Empty;

    public string? Province { get; private set; }

    public bool IsActive { get; private set; } = true;

    public static Institution Create(string slug, string name, string? shortName, string type, string? province) => new()
    {
        Slug = slug,
        Name = name,
        ShortName = shortName,
        Type = type,
        Province = province,
        IsActive = true,
    };

    public bool Update(string name, string? shortName, string type, string? province)
    {
        if (Name == name && ShortName == shortName && Type == type && Province == province && IsActive)
        {
            return false;
        }

        Name = name;
        ShortName = shortName;
        Type = type;
        Province = province;
        IsActive = true;
        return true;
    }

    public bool Deactivate()
    {
        if (!IsActive)
        {
            return false;
        }

        IsActive = false;
        return true;
    }
}
