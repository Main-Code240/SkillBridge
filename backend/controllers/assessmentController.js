import Assessment from "../models/Assessment.js";
import AssessmentAttempt from "../models/AssessmentAttempt.js";
import SkillProfile from "../models/SkillProfile.js";

export async function getAssessmentById(req, res) {
  try {
    const assessment = await Assessment.findOne({
      _id: req.params.id,
      isActive: true,
    }).select("-questions.correctAnswer");

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    res.json({
      success: true,
      assessment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function submitAssessment(req, res) {
  try {
    const { answers = [] } = req.body;

    const assessment = await Assessment.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    let totalWeight = 0;
    let earnedWeight = 0;

    const processedAnswers = assessment.questions.map((question) => {
      const submitted = answers.find(
        (item) => String(item.questionId) === String(question._id)
      );

      const answer = submitted?.answer || "";

      const isCorrect =
        answer.trim().toLowerCase() ===
        String(question.correctAnswer).trim().toLowerCase();

      totalWeight += question.weight || 1;

      if (isCorrect) {
        earnedWeight += question.weight || 1;
      }

      return {
        questionId: question._id,
        answer,
        isCorrect,
      };
    });

    const score =
      totalWeight === 0
        ? 0
        : Math.round((earnedWeight / totalWeight) * 100);

    const passed = score >= assessment.passingScore;

    const attempt = await AssessmentAttempt.create({
      user: req.user._id,
      assessment: assessment._id,
      answers: processedAnswers,
      score,
      passed,
    });

    if (assessment.skillId) {
      const existing = await SkillProfile.findOne({
        user: req.user._id,
        skillId: assessment.skillId,
      });

      if (existing) {
        existing.score = score;
        existing.source = "assessment";
        existing.isVerified = true;
        await existing.save();
      } else {
        await SkillProfile.create({
          user: req.user._id,
          skillId: assessment.skillId,
          skillName: assessment.title,
          score,
          level:
            score >= 80
              ? "advanced"
              : score >= 60
                ? "intermediate"
                : "beginner",
          source: "assessment",
          isVerified: true,
        });
      }
    }

    res.status(201).json({
      success: true,
      attempt,
      score,
      passed,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}