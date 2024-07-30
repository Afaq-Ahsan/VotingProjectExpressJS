const express = require("express");
const Candidate = require("../models/candidate");
const User = require("../models/user");
const verifyToken = require("../middleware/jwtMiddleWare");

const router = express.Router();

require("dotenv").config();

const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user && user.role === "admin";
  } catch (error) {
    console.error(error);
    return false;
  }
};

router.post("/", verifyToken, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).send({ error: "User does not have admin role" });
    }

    const data = req.body;

    const newCandidate = await Candidate.create(data);

    res.status(200).json({ newCandidate });
    console.log(newCandidate);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.put("/:candidateID", verifyToken, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).send({ error: "User does not have admin role" });
    }
    const candidateID = req.params.candidateID;
    console.log("candidateID", candidateID);
    const updatedCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updatedCandidateData
    );

    console.log("response", response);

    if (!response) {
      return res.status(403).send({ error: "Candidate not found" });
    }

    console.log("candidate data updated");
    res.status(202).send(response);
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

router.delete("/:candidateID", verifyToken, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).send({ error: "User does not have admin role" });
    }
    const candidateID = req.params.candidateID;

    const response = await Candidate.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(403).send({ error: "Candidate not found" });
    }

    console.log("candidate deleted");
    res.status(202).send(response);
  } catch (error) {
    console.error(error);
    res.status(400).send({ msg: "Internal Server Error" });
  }
});

//let's start voting

router.post("/vote/:candidateID", verifyToken, async (req, res) => {
  const candidateID = req.params.candidateID;
  const userId = req.user.id;

  try {
    const candidate = await Candidate.findById(candidateID);

    if (!candidate) {
      return res.status(404).send({ error: "Candidate not found" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    if (user.isVoted) {
      return res.status(400).send({ error: "You have already voted" });
    }

    if (user.role === "admin") {
      return res.status(403).send({ error: "Admins are not allowed to vote" });
    }

    // Record the vote
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save(); // Save the changes to the candidate document

    // Mark the user as having voted
    user.isVoted = true;
    await user.save(); // Save the changes to the user document

    return res.status(200).json({ message: "Vote recorded successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/vote/count", async (req, res) => {
  console.log("@@@@@@@@@@@@@@@");

  try {
    // Find all candidates and sort them by voteCount in descending order
    const candidates = await Candidate.find().sort({ voteCount: "desc" });

    // Map the candidates to only return their name and voteCount
    const voteRecord = candidates.map((data) => ({
      party: data.party,
      count: data.voteCount,
    }));

    console.log("Vote record:", voteRecord);

    return res.status(200).json(voteRecord);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
