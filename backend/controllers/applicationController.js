import Application from "../models/Application.js";
import Opportunity from "../models/Opportunity.js";

export async function getMyApplications(req, res) {
  try {
    const applications = await Application.find({
      user: req.user._id,
    })
      .populate("opportunity")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function applyToOpportunity(req, res) {
  try {
    const {
      opportunity,
      coverLetter,
      resumeUrl,
      matchScore,
      matchedSkills,
      missingSkills,
      industryNotes,
    } = req.body;

    if (!opportunity) {
      return res.status(400).json({
        success: false,
        message: "opportunity is required",
      });
    }

    const existing = await Application.findOne({
      user: req.user._id,
      opportunity,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this opportunity",
        application: existing,
      });
    }

    const target = await Opportunity.findOne({
      _id: opportunity,
      status: "open",
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "Opportunity is not available",
      });
    }

    const application = await Application.create({
      user: req.user._id,
      opportunity,
      coverLetter: coverLetter || "",
      resumeUrl: resumeUrl || "",
      matchScore: matchScore ?? 0,
      matchedSkills: matchedSkills || [],
      missingSkills: missingSkills || [],
      industryNotes: industryNotes || "",
    });

    const populated = await application.populate("opportunity");

    res.status(201).json({
      success: true,
      application: populated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}