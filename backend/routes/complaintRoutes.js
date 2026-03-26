const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");

// Generate short complaint ID
function generateComplaintId() {
    return "CC-" + Math.floor(100000 + Math.random() * 900000);
}

// ================================
// CREATE COMPLAINT
// ================================
router.post("/", async (req, res) => {
    try {
        const complaint = new Complaint({
            complaintId: generateComplaintId(),
            name: req.body.name,
            category: req.body.category,
            area: req.body.area,
            latitude: req.body.latitude, 
            longitude: req.body.longitude,
            description: req.body.description,
            status: "Pending",
            reportCount: 1
        });

        await complaint.save();
        res.json({ complaintId: complaint.complaintId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ================================
// GET ALL COMPLAINTS
// ================================
router.get("/", async (req, res) => {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
});

// ================================
// TRACK COMPLAINT (SHORT ID)
// ================================
router.get("/track/:complaintId", async (req, res) => {
    const complaint = await Complaint.findOne({
        complaintId: req.params.complaintId
    });

    if (!complaint) {
        return res.status(404).json({ message: "Not found" });
    }

    res.json({ status: complaint.status });
});

// ================================
// REPORT SAME ISSUE
// ================================
router.put("/report-same/:id", async (req, res) => {
    const complaint = await Complaint.findById(req.params.id);
    complaint.reportCount += 1;
    await complaint.save();
    res.json({ reportCount: complaint.reportCount });
});

// ================================
// UPDATE STATUS (ADMIN)
// ================================
router.put("/:id", async (req, res) => {
    const updated = await Complaint.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true }
    );

    if (!updated) {
        return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ status: updated.status });
});



// DELETE complaint (only if Resolved)
router.delete("/:id", async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        if (complaint.status !== "Resolved") {
            return res.status(403).json({
                message: "Only resolved complaints can be deleted"
            });
        }

        await Complaint.findByIdAndDelete(req.params.id);
        res.json({ message: "Complaint deleted successfully" });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});
module.exports = router;
