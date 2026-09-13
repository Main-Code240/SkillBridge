import Project from "../models/Project.js";

export async function getMyProjects(req, res) {
  try {
    const projects = await Project.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function createProject(req, res) {
  try {
    const project = await Project.create({
      user: req.user._id,
      title: req.body.title,
      description: req.body.description || "",
      projectUrl: req.body.projectUrl || "",
      repoUrl: req.body.repoUrl || "",
      skillsUsed: req.body.skillsUsed || [],
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
    });

    res.status(201).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteProject(req, res) {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}