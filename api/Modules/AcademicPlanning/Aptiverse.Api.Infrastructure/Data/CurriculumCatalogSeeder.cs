using Aptiverse.AcademicPlanning.Domain.Models.AcademicPlanning;
using Aptiverse.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Aptiverse.AcademicPlanning.Infrastructure.Data
{
    // Seeds the canonical FET-phase subject catalog. Structural seed data
    // (not user content) — students pick from this list when adding a
    // subject. Additive and idempotent at the row level: re-running adds
    // newly-defined curricula / subjects / junction rows without touching
    // what's already there.
    //
    // Coverage:
    //   NSC       — National Senior Certificate (DBE / CAPS, public + most private)
    //   IEB       — Independent Examinations Board (private schools, NSC equivalent)
    //   Cambridge — Cambridge International (CIE) IGCSE / AS / A-Level, used by
    //               a handful of independent schools in SA. Students typically
    //               take IGCSE in Grade 10-11, AS Level in Grade 11-12, and
    //               A-Level in Grade 12+.
    //
    // Some subjects are shared between curricula via the CurriculumSubject
    // junction (e.g. Mathematics is one canonical Subject row referenced by
    // all three curricula). Cambridge-specific subjects (Further Maths,
    // separate Physics/Chemistry/Biology, Global Perspectives, foreign
    // languages) get their own Subject rows.
    public static class CurriculumCatalogSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext db, CancellationToken ct = default)
        {
            await UpsertCurriculaAsync(db, ct);
            await UpsertSubjectsAsync(db, ct);
            await UpsertJunctionsAsync(db, ct);
            await UpsertInstitutionsAsync(db, ct);
            await db.SaveChangesAsync(ct);
        }

        // Recognised SA tertiary institutions: all 26 public universities,
        // major private higher-ed providers, and well-known public TVET
        // colleges. Not exhaustive on TVET (there are 50) — the signup picker
        // offers an "Other" fallback. Idempotent upsert by id.
        private static async Task UpsertInstitutionsAsync(ApplicationDbContext db, CancellationToken ct)
        {
            const string uni = "university";
            const string uot = "university_of_technology";
            const string comp = "comprehensive_university";
            const string tvet = "tvet";
            const string priv = "private_college";

            var desired = new (string Id, string Name, string? Short, string Type, string Province)[]
            {
                // ── Public universities (traditional) ──
                ("uct",   "University of Cape Town", "UCT", uni, "Western Cape"),
                ("wits",  "University of the Witwatersrand", "Wits", uni, "Gauteng"),
                ("up",    "University of Pretoria", "UP", uni, "Gauteng"),
                ("su",    "Stellenbosch University", "SU", uni, "Western Cape"),
                ("ukzn",  "University of KwaZulu-Natal", "UKZN", uni, "KwaZulu-Natal"),
                ("ufs",   "University of the Free State", "UFS", uni, "Free State"),
                ("ru",    "Rhodes University", "RU", uni, "Eastern Cape"),
                ("uwc",   "University of the Western Cape", "UWC", uni, "Western Cape"),
                ("ufh",   "University of Fort Hare", "UFH", uni, "Eastern Cape"),
                ("ul",    "University of Limpopo", "UL", uni, "Limpopo"),
                ("nwu",   "North-West University", "NWU", uni, "North West"),

                // ── Universities of technology ──
                ("cput",  "Cape Peninsula University of Technology", "CPUT", uot, "Western Cape"),
                ("cut",   "Central University of Technology", "CUT", uot, "Free State"),
                ("dut",   "Durban University of Technology", "DUT", uot, "KwaZulu-Natal"),
                ("mut",   "Mangosuthu University of Technology", "MUT", uot, "KwaZulu-Natal"),
                ("tut",   "Tshwane University of Technology", "TUT", uot, "Gauteng"),
                ("vut",   "Vaal University of Technology", "VUT", uot, "Gauteng"),

                // ── Comprehensive universities ──
                ("uj",    "University of Johannesburg", "UJ", comp, "Gauteng"),
                ("nmu",   "Nelson Mandela University", "NMU", comp, "Eastern Cape"),
                ("unisa", "University of South Africa", "UNISA", comp, "Gauteng"),
                ("univen","University of Venda", "Univen", comp, "Limpopo"),
                ("wsu",   "Walter Sisulu University", "WSU", comp, "Eastern Cape"),
                ("unizulu","University of Zululand", "UniZulu", comp, "KwaZulu-Natal"),

                // ── Newer public universities ──
                ("spu",   "Sol Plaatje University", "SPU", uni, "Northern Cape"),
                ("ump",   "University of Mpumalanga", "UMP", uni, "Mpumalanga"),
                ("smu",   "Sefako Makgatho Health Sciences University", "SMU", uni, "Gauteng"),

                // ── Major private higher-ed ──
                ("varsity_college", "The IIE's Varsity College", "Varsity College", priv, "National"),
                ("rosebank_college","The IIE's Rosebank College", "Rosebank College", priv, "National"),
                ("vega",            "The IIE's Vega School", "Vega", priv, "National"),
                ("eduvos",          "Eduvos", "Eduvos", priv, "National"),
                ("boston",          "Boston City Campus", "Boston", priv, "National"),
                ("damelin",         "Damelin", "Damelin", priv, "National"),
                ("richfield",       "Richfield Graduate Institute of Technology", "Richfield", priv, "National"),
                ("mancosa",         "MANCOSA", "MANCOSA", priv, "KwaZulu-Natal"),
                ("regenesys",       "Regenesys Business School", "Regenesys", priv, "Gauteng"),
                ("milpark",         "Milpark Education", "Milpark", priv, "National"),
                ("stadio",          "STADIO Higher Education", "STADIO", priv, "National"),
                ("afda",            "AFDA (The School for the Creative Economy)", "AFDA", priv, "National"),
                ("redandyellow",    "Red & Yellow Creative School of Business", "Red & Yellow", priv, "Western Cape"),
                ("cornerstone",     "Cornerstone Institute", "Cornerstone", priv, "Western Cape"),

                // ── Public TVET colleges (well-known subset) ──
                ("tvet_cape_town",  "College of Cape Town", "College of Cape Town", tvet, "Western Cape"),
                ("tvet_false_bay",  "False Bay TVET College", "False Bay", tvet, "Western Cape"),
                ("tvet_northlink",  "Northlink TVET College", "Northlink", tvet, "Western Cape"),
                ("tvet_boland",     "Boland TVET College", "Boland", tvet, "Western Cape"),
                ("tvet_west_coast", "West Coast TVET College", "West Coast", tvet, "Western Cape"),
                ("tvet_tshwane_north","Tshwane North TVET College", "Tshwane North", tvet, "Gauteng"),
                ("tvet_tshwane_south","Tshwane South TVET College", "Tshwane South", tvet, "Gauteng"),
                ("tvet_ekurhuleni_east","Ekurhuleni East TVET College", "Ekurhuleni East", tvet, "Gauteng"),
                ("tvet_ekurhuleni_west","Ekurhuleni West TVET College", "Ekurhuleni West", tvet, "Gauteng"),
                ("tvet_sedibeng",   "Sedibeng TVET College", "Sedibeng", tvet, "Gauteng"),
                ("tvet_swgc",       "South West Gauteng TVET College", "SWGC", tvet, "Gauteng"),
                ("tvet_thekwini",   "Thekwini TVET College", "Thekwini", tvet, "KwaZulu-Natal"),
                ("tvet_coastal",    "Coastal KZN TVET College", "Coastal KZN", tvet, "KwaZulu-Natal"),
                ("tvet_elangeni",   "Elangeni TVET College", "Elangeni", tvet, "KwaZulu-Natal"),
                ("tvet_majuba",     "Majuba TVET College", "Majuba", tvet, "KwaZulu-Natal"),
                ("tvet_umgungundlovu","Umgungundlovu TVET College", "Umgungundlovu", tvet, "KwaZulu-Natal"),
                ("tvet_buffalo_city","Buffalo City TVET College", "Buffalo City", tvet, "Eastern Cape"),
                ("tvet_ksd",        "King Sabata Dalindyebo TVET College", "KSD", tvet, "Eastern Cape"),
                ("tvet_eastcape_midlands","Eastcape Midlands TVET College", "Eastcape Midlands", tvet, "Eastern Cape"),
                ("tvet_motheo",     "Motheo TVET College", "Motheo", tvet, "Free State"),
                ("tvet_maluti",     "Maluti TVET College", "Maluti", tvet, "Free State"),
                ("tvet_capricorn",  "Capricorn TVET College", "Capricorn", tvet, "Limpopo"),
                ("tvet_vhembe",     "Vhembe TVET College", "Vhembe", tvet, "Limpopo"),
                ("tvet_ehlanzeni",  "Ehlanzeni TVET College", "Ehlanzeni", tvet, "Mpumalanga"),
                ("tvet_gert_sibande","Gert Sibande TVET College", "Gert Sibande", tvet, "Mpumalanga"),
                ("tvet_nkangala",   "Nkangala TVET College", "Nkangala", tvet, "Mpumalanga"),
                ("tvet_orbit",      "Orbit TVET College", "Orbit", tvet, "North West"),
                ("tvet_vuselela",   "Vuselela TVET College", "Vuselela", tvet, "North West"),
                ("tvet_nc_urban",   "Northern Cape Urban TVET College", "NC Urban", tvet, "Northern Cape"),
                ("tvet_nc_rural",   "Northern Cape Rural TVET College", "NC Rural", tvet, "Northern Cape"),

                // ── Fallback ──
                ("other", "Other / not listed", "Other", priv, "National"),
            };

            var existingIds = await db.Set<Institution>().AsNoTracking().Select(i => i.Id).ToListAsync(ct);
            foreach (var (id, name, shortName, type, province) in desired)
            {
                if (existingIds.Contains(id)) continue;
                db.Set<Institution>().Add(new Institution
                {
                    Id = id,
                    Name = name,
                    ShortName = shortName,
                    Type = type,
                    Province = province,
                });
            }
        }

        private static async Task UpsertCurriculaAsync(ApplicationDbContext db, CancellationToken ct)
        {
            var desired = new[]
            {
                new Curriculum
                {
                    Id = "nsc",
                    Name = "National Senior Certificate (NSC)",
                    ShortName = "NSC",
                    Description = "South Africa's national matric qualification, set by the Department of Basic Education under the CAPS curriculum. Sat by most public and private schools.",
                },
                new Curriculum
                {
                    Id = "ieb",
                    Name = "Independent Examinations Board (IEB)",
                    ShortName = "IEB",
                    Description = "NSC-equivalent matric qualification used by most independent (private) schools in South Africa.",
                },
                new Curriculum
                {
                    Id = "cambridge",
                    Name = "Cambridge International (CIE)",
                    ShortName = "CIE",
                    Description = "International qualification used by a handful of South African independent schools. Students typically sit IGCSE in Grade 10–11, AS-Level in Grade 11–12, and A-Level in Grade 12+.",
                },
            };

            var existingIds = await db.Set<Curriculum>().AsNoTracking().Select(c => c.Id).ToListAsync(ct);
            foreach (var c in desired)
            {
                if (!existingIds.Contains(c.Id)) db.Set<Curriculum>().Add(c);
            }
        }

        private static async Task UpsertSubjectsAsync(ApplicationDbContext db, CancellationToken ct)
        {
            var desired = AllSubjects();

            var existingIds = await db.Set<Subject>().AsNoTracking().Select(s => s.Id).ToListAsync(ct);
            foreach (var s in desired)
            {
                if (!existingIds.Contains(s.Id)) db.Set<Subject>().Add(s);
            }
        }

        private static async Task UpsertJunctionsAsync(ApplicationDbContext db, CancellationToken ct)
        {
            var desired = AllJunctions();

            var existingPairs = await db.Set<CurriculumSubject>()
                .AsNoTracking()
                .Select(cs => new { cs.CurriculumId, cs.SubjectId })
                .ToListAsync(ct);
            var existing = existingPairs
                .Select(p => $"{p.CurriculumId}|{p.SubjectId}")
                .ToHashSet();

            foreach (var (curriculumId, subjectId, isCompulsory) in desired)
            {
                var key = $"{curriculumId}|{subjectId}";
                if (!existing.Contains(key))
                {
                    db.Set<CurriculumSubject>().Add(new CurriculumSubject
                    {
                        CurriculumId = curriculumId,
                        SubjectId = subjectId,
                        IsCompulsory = isCompulsory,
                    });
                }
            }
        }

        // -- Canonical catalog ----------------------------------------------

        private static List<Subject> AllSubjects() =>
        [
            // SA-curriculum languages (NSC + IEB) — Home & FAL pairs
            new() { Id = "eng_hl",    Code = "ENG HL",  Name = "English Home Language",   Category = "language", LanguageType = "home" },
            new() { Id = "eng_fal",   Code = "ENG FAL", Name = "English First Additional Language", Category = "language", LanguageType = "first_additional" },
            new() { Id = "afr_hl",    Code = "AFR HL",  Name = "Afrikaans Home Language", Category = "language", LanguageType = "home" },
            new() { Id = "afr_fal",   Code = "AFR FAL", Name = "Afrikaans First Additional Language", Category = "language", LanguageType = "first_additional" },
            new() { Id = "afr_sal",   Code = "AFR SAL", Name = "Afrikaans Second Additional Language", Category = "language", LanguageType = "second_additional" },
            new() { Id = "zul_hl",    Code = "ZUL HL",  Name = "isiZulu Home Language",   Category = "language", LanguageType = "home" },
            new() { Id = "zul_fal",   Code = "ZUL FAL", Name = "isiZulu First Additional Language", Category = "language", LanguageType = "first_additional" },
            new() { Id = "xho_hl",    Code = "XHO HL",  Name = "isiXhosa Home Language",  Category = "language", LanguageType = "home" },
            new() { Id = "xho_fal",   Code = "XHO FAL", Name = "isiXhosa First Additional Language", Category = "language", LanguageType = "first_additional" },
            new() { Id = "sep_hl",    Code = "SEP HL",  Name = "Sepedi Home Language",    Category = "language", LanguageType = "home" },
            new() { Id = "sot_hl",    Code = "SOT HL",  Name = "Sesotho Home Language",   Category = "language", LanguageType = "home" },
            new() { Id = "tsn_hl",    Code = "TSN HL",  Name = "Setswana Home Language",  Category = "language", LanguageType = "home" },
            new() { Id = "tso_hl",    Code = "TSO HL",  Name = "Xitsonga Home Language",  Category = "language", LanguageType = "home" },
            new() { Id = "ven_hl",    Code = "VEN HL",  Name = "Tshivenda Home Language", Category = "language", LanguageType = "home" },
            new() { Id = "ssw_hl",    Code = "SSW HL",  Name = "siSwati Home Language",   Category = "language", LanguageType = "home" },
            new() { Id = "nbl_hl",    Code = "NBL HL",  Name = "isiNdebele Home Language", Category = "language", LanguageType = "home" },

            // Cambridge languages — different framing (First / Second Language)
            new() { Id = "cie_eng_first",  Code = "CIE ENG 1L",  Name = "English – First Language",  Category = "language", LanguageType = "home",             Description = "Cambridge IGCSE / AS / A-Level English as a first language." },
            new() { Id = "cie_eng_second", Code = "CIE ENG 2L",  Name = "English – Second Language", Category = "language", LanguageType = "first_additional", Description = "Cambridge IGCSE English as a second language." },
            new() { Id = "cie_eng_lit",    Code = "CIE ENG LIT", Name = "English Literature",        Category = "language", Description = "Cambridge IGCSE / AS / A-Level English Literature." },
            new() { Id = "cie_afr_second", Code = "CIE AFR 2L",  Name = "Afrikaans – Second Language", Category = "language", LanguageType = "first_additional", Description = "Cambridge IGCSE Afrikaans as a second language." },
            new() { Id = "cie_zul_first",  Code = "CIE ZUL 1L",  Name = "isiZulu – First Language",  Category = "language", LanguageType = "home",             Description = "Cambridge IGCSE isiZulu as a first language." },
            new() { Id = "french",         Code = "FREN",        Name = "French (Foreign Language)", Category = "language", LanguageType = "second_additional" },
            new() { Id = "german",         Code = "GERM",        Name = "German (Foreign Language)", Category = "language", LanguageType = "second_additional" },
            new() { Id = "spanish",        Code = "SPAN",        Name = "Spanish (Foreign Language)", Category = "language", LanguageType = "second_additional" },
            new() { Id = "mandarin",       Code = "MAND",        Name = "Mandarin Chinese",          Category = "language", LanguageType = "second_additional" },
            new() { Id = "latin",          Code = "LATN",        Name = "Latin (Classical)",         Category = "language", LanguageType = "second_additional" },

            // Mathematics
            new() { Id = "math",          Code = "MATH",     Name = "Mathematics",            Category = "mathematics" },
            new() { Id = "math_lit",      Code = "MLIT",     Name = "Mathematical Literacy",  Category = "mathematics" },
            new() { Id = "further_math",  Code = "FMATH",    Name = "Further Mathematics",    Category = "mathematics", Description = "Cambridge A-Level enrichment for strong mathematicians." },

            // Natural Sciences — NSC combines, Cambridge separates
            new() { Id = "physci",         Code = "PHSC",    Name = "Physical Sciences",      Category = "natural_science", Description = "NSC / IEB combined physics + chemistry course." },
            new() { Id = "lifesci",        Code = "LSCI",    Name = "Life Sciences",          Category = "natural_science", Description = "NSC / IEB biology course." },
            new() { Id = "agrsci",         Code = "AGRI",    Name = "Agricultural Sciences",  Category = "natural_science" },
            new() { Id = "physics",        Code = "PHY",     Name = "Physics",                Category = "natural_science", Description = "Cambridge IGCSE / AS / A-Level physics." },
            new() { Id = "chemistry",      Code = "CHEM",    Name = "Chemistry",              Category = "natural_science", Description = "Cambridge IGCSE / AS / A-Level chemistry." },
            new() { Id = "biology",        Code = "BIO",     Name = "Biology",                Category = "natural_science", Description = "Cambridge IGCSE / AS / A-Level biology." },
            new() { Id = "combined_sci",   Code = "CSCI",    Name = "Combined Sciences",      Category = "natural_science", Description = "Cambridge IGCSE blended physics, chemistry and biology." },
            new() { Id = "marine_sci",     Code = "MARS",    Name = "Marine Science",         Category = "natural_science", Description = "Cambridge AS / A-Level only." },
            new() { Id = "environmental",  Code = "ENVM",    Name = "Environmental Management", Category = "natural_science" },

            // Commerce
            new() { Id = "acc", Code = "ACC", Name = "Accounting",        Category = "commerce" },
            new() { Id = "bus", Code = "BUS", Name = "Business Studies",  Category = "commerce" },
            new() { Id = "eco", Code = "ECO", Name = "Economics",         Category = "commerce" },

            // Humanities
            new() { Id = "geo",         Code = "GEO",   Name = "Geography",         Category = "humanities" },
            new() { Id = "hist",        Code = "HIST",  Name = "History",           Category = "humanities" },
            new() { Id = "religion",    Code = "RELS",  Name = "Religion Studies",  Category = "humanities" },
            new() { Id = "psychology",  Code = "PSYC",  Name = "Psychology",        Category = "humanities", Description = "Cambridge AS / A-Level only." },
            new() { Id = "sociology",   Code = "SOCY",  Name = "Sociology",         Category = "humanities", Description = "Cambridge AS / A-Level only." },
            new() { Id = "global_persp", Code = "GP",   Name = "Global Perspectives", Category = "humanities", Description = "Cambridge IGCSE / AS / A-Level critical-thinking and research course." },

            // Services
            new() { Id = "tourism",        Code = "TOUR", Name = "Tourism",             Category = "services" },
            new() { Id = "hosp",           Code = "HOSP", Name = "Hospitality Studies", Category = "services" },
            new() { Id = "consumer",       Code = "CONS", Name = "Consumer Studies",    Category = "services" },
            new() { Id = "travel_tourism", Code = "TTOU", Name = "Travel & Tourism",    Category = "services", Description = "Cambridge IGCSE / AS travel and tourism." },
            new() { Id = "food_nutrition", Code = "FOOD", Name = "Food & Nutrition",    Category = "services", Description = "Cambridge IGCSE / AS food and nutrition." },

            // Technical
            new() { Id = "cat",        Code = "CAT",   Name = "Computer Applications Technology", Category = "technical", Description = "NSC / IEB office applications and digital literacy." },
            new() { Id = "it",         Code = "IT",    Name = "Information Technology",  Category = "technical", Description = "NSC / IEB programming-focused IT." },
            new() { Id = "egd",        Code = "EGD",   Name = "Engineering Graphics and Design", Category = "technical" },
            new() { Id = "civil_tech", Code = "CTEC",  Name = "Civil Technology",        Category = "technical" },
            new() { Id = "elec_tech",  Code = "ETEC",  Name = "Electrical Technology",   Category = "technical" },
            new() { Id = "mech_tech",  Code = "MTEC",  Name = "Mechanical Technology",   Category = "technical" },
            new() { Id = "agri_mgmt",  Code = "AMP",   Name = "Agricultural Management Practices", Category = "technical" },
            new() { Id = "agri_tech",  Code = "ATEC",  Name = "Agricultural Technology", Category = "technical" },
            new() { Id = "compsci",    Code = "CS",    Name = "Computer Science",        Category = "technical", Description = "Cambridge IGCSE / AS / A-Level programming + theory." },
            new() { Id = "ict",        Code = "ICT",   Name = "Information & Communication Technology", Category = "technical", Description = "Cambridge IGCSE / AS ICT — office apps + intro to systems." },
            new() { Id = "design_tech", Code = "DT",   Name = "Design & Technology",     Category = "technical", Description = "Cambridge IGCSE / AS / A-Level product / systems design." },

            // Arts
            new() { Id = "visual_arts", Code = "VART", Name = "Visual Arts",         Category = "arts" },
            new() { Id = "drama",       Code = "DRAM", Name = "Dramatic Arts",       Category = "arts" },
            new() { Id = "music",       Code = "MUSI", Name = "Music",               Category = "arts" },
            new() { Id = "dance",       Code = "DANC", Name = "Dance Studies",       Category = "arts" },
            new() { Id = "design",      Code = "DESI", Name = "Design",              Category = "arts" },
            new() { Id = "art_design",  Code = "ART",  Name = "Art & Design",        Category = "arts", Description = "Cambridge IGCSE / AS / A-Level fine art + design." },
            new() { Id = "theatre",     Code = "THE",  Name = "Theatre",             Category = "arts", Description = "Cambridge IGCSE / AS / A-Level performance and devising." },

            // Sport
            new() { Id = "pe",          Code = "PE",   Name = "Physical Education",  Category = "arts", Description = "Cambridge IGCSE / AS / A-Level physical education and sport science." },

            // Life Orientation — compulsory in NSC and IEB
            new() { Id = "lo",          Code = "LO",   Name = "Life Orientation",    Category = "life_orientation" },

            // IEB-only Advanced Programme variants
            new() { Id = "ap_math",     Code = "AP MATH", Name = "Advanced Programme Mathematics", Category = "mathematics", Description = "IEB-only enrichment course alongside core Mathematics." },
            new() { Id = "ap_eng",      Code = "AP ENG",  Name = "Advanced Programme English",     Category = "language",    Description = "IEB-only enrichment course alongside English HL." },
            new() { Id = "ap_afr",      Code = "AP AFR",  Name = "Advanced Programme Afrikaans",   Category = "language",    Description = "IEB-only enrichment course alongside Afrikaans HL." },
        ];

        private static List<(string CurriculumId, string SubjectId, bool IsCompulsory)> AllJunctions()
        {
            var rows = new List<(string, string, bool)>();

            // NSC ----------------------------------------------------------------
            string[] nsc =
            [
                "eng_hl", "eng_fal", "afr_hl", "afr_fal", "afr_sal", "zul_hl", "zul_fal",
                "xho_hl", "xho_fal", "sep_hl", "sot_hl", "tsn_hl", "tso_hl",
                "ven_hl", "ssw_hl", "nbl_hl",
                "math", "math_lit",
                "physci", "lifesci", "agrsci",
                "acc", "bus", "eco",
                "geo", "hist", "religion",
                "tourism", "hosp", "consumer",
                "cat", "it", "egd", "civil_tech", "elec_tech", "mech_tech",
                "agri_mgmt", "agri_tech",
                "visual_arts", "drama", "music", "dance", "design",
                "lo",
            ];
            foreach (var s in nsc) rows.Add(("nsc", s, s == "lo"));

            // IEB — same as NSC plus AP variants ----------------------------------
            foreach (var s in nsc) rows.Add(("ieb", s, s == "lo"));
            foreach (var s in new[] { "ap_math", "ap_eng", "ap_afr" }) rows.Add(("ieb", s, false));

            // Cambridge — shared canonical subjects + Cambridge-specific entries --
            string[] cambridgeShared =
            [
                // Maths
                "math",
                // Commerce
                "acc", "bus", "eco",
                // Humanities
                "geo", "hist", "religion",
                // Arts (Cambridge offers Music + Design alongside its own art_design)
                "music", "design",
            ];
            string[] cambridgeOwn =
            [
                // Languages
                "cie_eng_first", "cie_eng_second", "cie_eng_lit",
                "cie_afr_second", "cie_zul_first",
                "french", "german", "spanish", "mandarin", "latin",
                // Maths
                "further_math",
                // Sciences
                "physics", "chemistry", "biology", "combined_sci",
                "marine_sci", "environmental",
                // Humanities
                "psychology", "sociology", "global_persp",
                // Services
                "travel_tourism", "food_nutrition",
                // Technical
                "compsci", "ict", "design_tech",
                // Arts
                "art_design", "theatre", "pe",
            ];
            foreach (var s in cambridgeShared) rows.Add(("cambridge", s, false));
            foreach (var s in cambridgeOwn) rows.Add(("cambridge", s, false));

            return rows;
        }
    }
}
