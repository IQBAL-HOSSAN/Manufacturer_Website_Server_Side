const router = require("express").Router();

router.get("/parts", async (req, res) => {
  const query = {};
  const getParts = res.send("this is parts");
  console.log("server get");
});

module.exports = router;
