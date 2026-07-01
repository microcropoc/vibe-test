namespace VibeTest.Server.Models.Responses;

public class SubmitResponse
{
    public int CorrectAnswerOrder { get; set; }
    public string? Explanation { get; set; }
}

public class TestResultResponse
{
    public int TestId { get; set; }
    public string TestName { get; set; } = string.Empty;
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int IncorrectAnswers { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class TestHistoryItem
{
    public int TestId { get; set; }
    public string TestName { get; set; } = string.Empty;
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public double ScorePercent { get; set; }
    public DateTime CompletedAt { get; set; }
}

public class AnsweredQuestionResponse
{
    public int QuestionOrder { get; set; }
    public int SelectedAnswerOrder { get; set; }
    public int CorrectAnswerOrder { get; set; }
    public bool IsCorrect { get; set; }
    public string? Explanation { get; set; }
}

public class AnsweredQuestionsResponse
{
    public List<AnsweredQuestionResponse> Answers { get; set; } = [];
}
