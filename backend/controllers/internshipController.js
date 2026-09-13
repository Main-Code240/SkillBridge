import Internship from "../models/Internship.js";
import InternshipTask from "../models/InternshipTask.js";
import MentorFeedback from "../models/MentorFeedback.js";

export async function getMyInternships(req, res) {
  try {
    const internships = await Internship.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      internships,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getInternshipById(req, res) {
  try {
    const internship = await Internship.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    const [tasks, feedback] = await Promise.all([
      InternshipTask.find({
        internship: internship._id,
        user: req.user._id,
      }).sort({ createdAt: -1 }),

      MentorFeedback.find({
        internship: internship._id,
        user: req.user._id,
      }).sort({ createdAt: -1 }),
    ]);

    res.json({
      success: true,
      internship,
      tasks,
      feedback,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function createTask(req, res) {
  try {
    const internship = await Internship.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    const task = await InternshipTask.create({
      internship: internship._id,
      user: req.user._id,
      title: req.body.title,
      description: req.body.description || "",
      dueDate: req.body.dueDate || null,
      status: req.body.status || "pending",
    });

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateTask(req, res) {
  try {
    const task = await InternshipTask.findOneAndUpdate(
      {
        _id: req.params.taskId,
        internship: req.params.id,
        user: req.user._id,
      },
      {
        status: req.body.status,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateInternship(req, res) {
  try {
    const allowed = ["progress", "status"];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowed.includes(key))
    );

    const internship = await Internship.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: "Internship not found",
      });
    }

    res.json({
      success: true,
      internship,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}