import Opportunity from "../models/Opportunity.js";

export async function getOpenOpportunities(req, res) {
  try {
    const opportunities = await Opportunity.find({
      status: "open",
    })
      .populate("user", "fullName companyName industryType")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      opportunities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getOpportunityById(req, res) {
  try {
    const opportunity = await Opportunity.findOne({
      _id: req.params.id,
      status: "open",
    }).populate("user", "fullName companyName industryType");

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found",
      });
    }

    res.json({
      success: true,
      opportunity,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}