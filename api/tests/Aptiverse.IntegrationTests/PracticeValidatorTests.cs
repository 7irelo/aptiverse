using System.Reflection;
using Aptiverse.AiTutor.Contracts;
using Aptiverse.Practice.Domain;
using Aptiverse.Practice.Features.Common;
using Aptiverse.Practice.Features.GenerateTest;
using Aptiverse.Practice.Features.GetTest;
using Aptiverse.Practice.Features.ListTests;
using Aptiverse.Practice.Features.ReportFocusLoss;
using Aptiverse.Practice.Features.SaveAnswer;
using Aptiverse.Practice.Generation;

namespace Aptiverse.IntegrationTests;

/// <summary>Validators and pure Practice rules; no database needed.</summary>
public sealed class PracticeValidatorTests
{
    private static readonly Guid Assessment = Guid.CreateVersion7();
    private static readonly DateTimeOffset T0 = new(2026, 10, 27, 10, 0, 0, TimeSpan.Zero);

    [Theory]
    [InlineData("quiz", "untimed", null, 10, null, true)]
    [InlineData("quiz", "timed", 30, null, null, true)]
    [InlineData("quiz", null, null, null, null, false)]
    [InlineData("quiz", "timed", null, null, null, false)]
    [InlineData("quiz", "timed", 4, null, null, false)]
    [InlineData("quiz", "timed", 181, null, null, false)]
    [InlineData("quiz", "untimed", 30, null, null, false)]
    [InlineData("quiz", "untimed", null, 4, null, false)]
    [InlineData("quiz", "untimed", null, 41, null, false)]
    [InlineData("quiz", "untimed", null, null, 60, false)]
    [InlineData("exam_paper", null, null, null, 60, true)]
    [InlineData("exam_paper", "timed", null, null, 150, true)]
    [InlineData("exam_paper", "untimed", null, null, 60, false)]
    [InlineData("exam_paper", null, null, null, null, false)]
    [InlineData("exam_paper", null, null, null, 29, false)]
    [InlineData("exam_paper", null, 60, null, 60, false)]
    [InlineData("exam_paper", null, null, 10, 60, false)]
    [InlineData("flashcards", null, null, 20, null, true)]
    [InlineData("flashcards", "timed", 10, null, null, false)]
    [InlineData("essay", "timed", 45, null, null, true)]
    [InlineData("essay", "untimed", null, 3, null, false)]
    [InlineData("reading", "untimed", null, 5, null, true)]
    [InlineData("crossword", "untimed", null, null, null, false)]
    public void Generate_request(string format, string? mode, int? duration, int? count, int? marks, bool valid)
    {
        var request = new GeneratePracticeTestRequest(Assessment, format, ["Algebra"], mode, null, false, duration, count, marks);
        Assert.Equal(valid, new GeneratePracticeTestValidator().Validate(request).IsValid);
    }

    [Theory]
    [InlineData("Algebra", true)]
    [InlineData("  Quadratic equations  ", true)]
    [InlineData("", false)]
    [InlineData("   ", false)]
    [InlineData("<b>bold</b>", false)]
    [InlineData("{{template}}", false)]
    [InlineData("line\u0007break", false)]
    public void Generate_topics(string topic, bool valid)
    {
        var request = new GeneratePracticeTestRequest(Assessment, "quiz", [topic], "untimed");
        Assert.Equal(valid, new GeneratePracticeTestValidator().Validate(request).IsValid);
    }

    [Fact]
    public void Generate_request_rejects_too_many_topics_bad_difficulty_and_an_empty_assessment()
    {
        var validator = new GeneratePracticeTestValidator();
        var nine = Enumerable.Range(1, 9).Select(i => $"Topic {i}").ToList();
        Assert.False(validator.Validate(new GeneratePracticeTestRequest(Assessment, "quiz", nine, "untimed")).IsValid);
        Assert.False(validator.Validate(new GeneratePracticeTestRequest(Assessment, "quiz", [new string('a', 81)], "untimed")).IsValid);
        Assert.False(validator.Validate(new GeneratePracticeTestRequest(Assessment, "quiz", null, "untimed", "impossible")).IsValid);
        Assert.False(validator.Validate(new GeneratePracticeTestRequest(Guid.Empty, "quiz", null, "untimed")).IsValid);
        Assert.True(validator.Validate(new GeneratePracticeTestRequest(Assessment, "quiz", null, "untimed", "stretch", FocusOnWeakest: true)).IsValid);
    }

    [Theory]
    [InlineData(1, null, null, 0, true)]
    [InlineData(null, "My answer", null, 3, true)]
    [InlineData(null, null, "unsure", 0, true)]
    [InlineData(null, null, null, 0, false)]
    [InlineData(1, "both", null, 0, false)]
    [InlineData(6, null, null, 0, false)]
    [InlineData(-1, null, null, 0, false)]
    [InlineData(null, null, "maybe", 0, false)]
    [InlineData(1, null, null, -1, false)]
    [InlineData(null, "bell\u0007", null, 0, false)]
    public void Save_answer_request(int? index, string? text, string? rating, int revision, bool valid)
    {
        Assert.Equal(valid, new SaveAttemptAnswerValidator().Validate(new SaveAttemptAnswerRequest(index, text, rating, revision)).IsValid);
    }

    [Fact]
    public void Save_answer_text_is_capped_at_5000_characters_and_keeps_newlines()
    {
        var validator = new SaveAttemptAnswerValidator();
        Assert.True(validator.Validate(new SaveAttemptAnswerRequest(null, "Line one\nLine two\ttabbed", null, 0)).IsValid);
        Assert.True(validator.Validate(new SaveAttemptAnswerRequest(null, new string('a', 5000), null, 0)).IsValid);
        Assert.False(validator.Validate(new SaveAttemptAnswerRequest(null, new string('a', 5001), null, 0)).IsValid);
    }

    [Theory]
    [InlineData(null, null, 1, 20, true)]
    [InlineData("ready", true, 2, 50, true)]
    [InlineData("archived", false, 1, 1, true)]
    [InlineData("done", null, 1, 20, false)]
    [InlineData(null, null, 0, 20, false)]
    [InlineData(null, null, 1, 51, false)]
    [InlineData(null, null, 1, 0, false)]
    public void List_request(string? status, bool? attempted, int page, int pageSize, bool valid)
    {
        Assert.Equal(valid, new ListPracticeTestsValidator().Validate(new ListPracticeTestsRequest(null, status, attempted, page, pageSize)).IsValid);
        Assert.False(new ListPracticeTestsValidator().Validate(new ListPracticeTestsRequest(Guid.Empty, null, null)).IsValid);
    }

    [Theory]
    [InlineData("visibility_hidden", true)]
    [InlineData("window_blur", true)]
    [InlineData("", false)]
    [InlineData("tab_switch", false)]
    public void Focus_loss_request(string kind, bool valid)
    {
        Assert.Equal(valid, new ReportFocusLossValidator().Validate(new ReportFocusLossRequest(kind)).IsValid);
    }

    [Fact]
    public void Pre_submission_records_carry_no_answer_key_fields()
    {
        string[] forbidden = ["AnswerIndex", "ExpectedAnswer", "AcceptableAnswers", "Memo", "Explanation", "CorrectIndex", "CorrectAnswer"];
        foreach (var type in new[] { typeof(AttemptState), typeof(AttemptQuestion), typeof(SavedAnswerView), typeof(PracticeTestInstructions) })
        {
            var names = type.GetProperties(BindingFlags.Public | BindingFlags.Instance).Select(p => p.Name).ToList();
            Assert.Empty(names.Intersect(forbidden));
        }
    }

    [Fact]
    public void The_paper_mapper_drops_untrusted_questions_and_keeps_valid_ones()
    {
        GeneratedOption[] good = [new("A", "No", false), new("B", "Yes", true), new("C", "Maybe", false)];
        var paper = new GeneratedPaper(
            [
                new GeneratedSection("Section A", [
                    Generated("mcq", 2, good),
                    Generated("mcq", 2, [new("A", "x", true), new("B", "y", true)]),
                    Generated("mcq", 2, [new("A", "x", true)]),
                    Generated("riddle", 2, []),
                    Generated("short", 0, []),
                    Generated("short", 51, []),
                    Generated("short", 3, [], stem: "   "),
                    Generated("numeric", 4, [], answer: ""),
                    Generated("flashcard", 1, [], answer: "", memo: ""),
                    Generated("short", 3, [], topic: "  "),
                ]),
            ],
            0,
            []);

        var questions = PaperMapper.Map(Guid.CreateVersion7(), paper);

        Assert.Equal(2, questions.Count);
        Assert.Equal([1, 2], questions.Select(q => q.Position));
        Assert.Equal(1, questions[0].AnswerIndex);
        Assert.Equal(["No", "Yes", "Maybe"], questions[0].Options);
        Assert.Equal("Section A", questions[0].Section);
        Assert.Equal(PaperMapper.DefaultTopic, questions[1].Topic);
        Assert.Empty(questions[1].Options);
        Assert.Null(questions[1].AnswerIndex);
    }

    [Fact]
    public void The_paper_mapper_trims_to_column_limits_and_caps_the_question_count()
    {
        var long1 = new string('s', 5000);
        var many = Enumerable.Range(0, PracticeTest.MaxQuestions + 5).Select(_ => Generated("short", 1, [], stem: long1, topic: new string('t', 200))).ToList();
        var questions = PaperMapper.Map(Guid.CreateVersion7(), new GeneratedPaper([new GeneratedSection(new string('n', 200), many)], 0, []));

        Assert.Equal(PracticeTest.MaxQuestions, questions.Count);
        Assert.All(questions, q =>
        {
            Assert.Equal(Question.StemMaxLength, q.Stem.Length);
            Assert.Equal(Question.TopicMaxLength, q.Topic.Length);
            Assert.Equal(Question.SectionMaxLength, q.Section!.Length);
        });
    }

    [Fact]
    public void Multiple_choice_marking_is_exact()
    {
        var question = Question.Create(Guid.CreateVersion7(), 1, "mcq", "Q", ["A", "B", "C"], 2, null, "", "", "T", null, 3, null);
        Assert.Equal((true, 3, Marking.CorrectFeedback), Marking.MarkChoice(question, 2));
        Assert.Equal((false, 0, "The correct option is C."), Marking.MarkChoice(question, 0));
        Assert.Equal((false, 0, Marking.NoAnswerFeedback), Marking.MarkChoice(question, null));
    }

    [Fact]
    public void Topic_tally_excludes_pending_marks_and_never_exceeds_the_available_marks()
    {
        var tallies = Marking.Tally(
        [
            new MarkedQuestion("Algebra", 2, true, 2, false),
            new MarkedQuestion("Algebra", 3, false, 1, false),
            new MarkedQuestion("Algebra", 8, false, 0, true),
            new MarkedQuestion("Geometry", 4, true, 9, false),
        ]);

        Assert.Equal(new TopicTally("Algebra", 3, 1, 5, 3, 2), tallies[0]);
        Assert.Equal(new TopicTally("Geometry", 1, 1, 4, 4, 1), tallies[1]);
        Assert.Equal(28.57m, Marking.Percent(2, 7));
        Assert.Equal(0m, Marking.Percent(0, 0));
        Assert.Equal(100m, Marking.Percent(9, 4));
    }

    [Fact]
    public void Timed_attempts_keep_a_fixed_deadline_and_never_pause()
    {
        var test = ReadyTest("quiz", "timed", 30);
        var attempt = Attempt.Start(test, T0);

        Assert.Equal(T0.AddMinutes(30), attempt.DeadlineAt);
        Assert.Equal(1800, attempt.RemainingSeconds(T0));
        Assert.Equal(0, attempt.RemainingSeconds(T0.AddHours(1)));
        Assert.Equal("practice.pause_not_allowed", attempt.Pause(T0.AddMinutes(1)).Error!.Code);
        Assert.False(attempt.IsPastGrace(T0.AddMinutes(30).AddSeconds(10), TimeSpan.FromSeconds(10)));
        Assert.True(attempt.IsPastGrace(T0.AddMinutes(30).AddSeconds(11), TimeSpan.FromSeconds(10)));
        Assert.True(attempt.HasDeadline(T0.AddMinutes(30).AddTicks(5)));
        Assert.False(attempt.HasDeadline(T0.AddMinutes(31)));

        attempt.Submit(T0.AddMinutes(45), SubmitSources.Deadline);
        Assert.Equal(1800, Marking.SecondsOnTask(attempt, 30));
    }

    [Fact]
    public void Untimed_pauses_are_excluded_from_time_on_task()
    {
        var attempt = Attempt.Start(ReadyTest("quiz", "untimed", null), T0);
        Assert.Null(attempt.DeadlineAt);
        Assert.True(attempt.Pause(T0.AddMinutes(10)).IsSuccess);
        Assert.True(attempt.Pause(T0.AddMinutes(11)).IsSuccess);
        Assert.Equal(1, attempt.PauseCount);
        Assert.True(attempt.Resume(T0.AddMinutes(20)).IsSuccess);
        Assert.Equal(600, attempt.PausedSecondsTotal);
        Assert.True(attempt.Pause(T0.AddMinutes(25)).IsSuccess);

        // Submitting while paused closes the open pause first.
        attempt.Submit(T0.AddMinutes(30), SubmitSources.Student);
        Assert.Equal(900, attempt.PausedSecondsTotal);
        Assert.Equal(900, Marking.SecondsOnTask(attempt, null));
        Assert.Equal("practice.attempt_not_active", attempt.Resume(T0.AddMinutes(31)).Error!.Code);
    }

    [Theory]
    [InlineData("grade_11", "Grade 11", 11)]
    [InlineData("grade_8", "Grade 8", 8)]
    [InlineData("first_year", "First year", null)]
    [InlineData("phd", "PhD", null)]
    [InlineData("honours", "Honours", null)]
    public void Levels_are_labelled_for_the_ai_service(string key, string label, int? grade)
    {
        Assert.Equal(label, GenerationText.HumanLevel(key));
        Assert.Equal(grade, GenerationText.Grade(key));
    }

    [Theory]
    [InlineData("Mathematics", "mathematics")]
    [InlineData("Life Sciences", "life_sciences")]
    [InlineData("  Economics & Management 101 ", "economics_management_101")]
    [InlineData("Afrikaans Huistaal", "afrikaans_huistaal")]
    [InlineData("Français", "francais")]
    [InlineData("!!!", "general")]
    public void Subject_keys_are_snake_case(string name, string key) => Assert.Equal(key, GenerationText.SubjectKey(name));

    [Theory]
    [InlineData("quiz", 10, null, 25)]
    [InlineData("quiz", 40, null, 100)]
    [InlineData("reading", 5, null, 28)]
    [InlineData("flashcards", 20, null, 20)]
    [InlineData("exam_paper", 0, 120, 120)]
    [InlineData("essay", 0, null, null)]
    public void Question_counts_become_marks_for_the_ai_service(string format, int count, int? paperMarks, int? expected) =>
        Assert.Equal(expected, GenerationText.TotalMarks(format, count, paperMarks));

    [Theory]
    [InlineData("generating", "queued", "queued")]
    [InlineData("generating", "running", "running")]
    [InlineData("generating", "failed", "failed")]
    [InlineData("ready", "succeeded", "ready")]
    [InlineData("archived", "succeeded", "ready")]
    [InlineData("failed", "failed", "failed")]
    [InlineData("generating", null, "queued")]
    public void Generation_status_maps_to_one_public_value(string testStatus, string? jobStatus, string expected) =>
        Assert.Equal(expected, PublicStatus.Of(testStatus, jobStatus));

    [Theory]
    [InlineData(1, 10)]
    [InlineData(2, 20)]
    [InlineData(3, 40)]
    [InlineData(20, 3600)]
    public void Retry_backoff_doubles_and_is_capped(int attempt, int seconds) =>
        Assert.Equal(TimeSpan.FromSeconds(seconds), Backoff.Delay(10, attempt));

    private static PracticeTest ReadyTest(string format, string mode, int? duration)
    {
        var test = PracticeTest.CreateGenerating(
            Guid.CreateVersion7(), Guid.CreateVersion7(), Guid.CreateVersion7(), "Mathematics", "grade_11", "high_school", "T", format, mode, duration, ["A"], "core", false);
        test.MarkReady(3, 7);
        return test;
    }

    private static GeneratedQuestion Generated(
        string type,
        int marks,
        GeneratedOption[] options,
        string stem = "What is it?",
        string answer = "An answer",
        string memo = "Point one",
        string topic = "Algebra") =>
        new("q", type, topic, "routine", marks, stem, options, answer, memo, "Because.");
}
