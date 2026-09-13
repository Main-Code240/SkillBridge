import Certificate from "../models/Certificate.js";

export async function getMyCertificates(req, res) {
  try {
    const certificates = await Certificate.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function createCertificate(req, res) {
  try {
    const certificate = await Certificate.create({
      user: req.user._id,
      title: req.body.title,
      issuer: req.body.issuer || "",
      issueDate: req.body.issueDate || null,
      expiryDate: req.body.expiryDate || null,
      certificateUrl: req.body.certificateUrl || "",
      skillName: req.body.skillName || "",
    });

    res.status(201).json({
      success: true,
      certificate,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteCertificate(req, res) {
  try {
    const certificate = await Certificate.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    res.json({
      success: true,
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}