import SkillProfile from "../models/SkillProfile.js";

export async function getMySkills(req, res) {
  try {
    const skills = await SkillProfile.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      skills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function createSkill(req, res) {
  try {
    const {
      skillId,
      skillName,
      category,
      score,
      level,
      source,
    } = req.body;

    if (!skillName) {
      return res.status(400).json({
        success: false,
        message: "skillName is required",
      });
    }

    const skill = await SkillProfile.create({
      user: req.user._id,
      skillId: skillId || null,
      skillName,
      category: category || "",
      score: score ?? 0,
      level: level || "beginner",
      source: source || "manual",
    });

    res.status(201).json({
      success: true,
      skill,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteSkill(req, res) {
  try {
    const skill = await SkillProfile.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    res.json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}