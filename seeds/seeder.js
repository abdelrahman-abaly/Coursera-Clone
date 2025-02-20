const mongoose = require("mongoose-seed");

mongoose.connect("mongodb://localhost:27017/mydb", () => {
  mongoose.loadModels(["./models/User"]);

  mongoose.clearModels(["User"], () => {
    mongoose.populateModels(
      [
        {
          model: "User",
          documents: [
            { name: "Admin User", email: "admin@example.com", role: "admin" },
            { name: "Regular User", email: "user@example.com", role: "user" },
          ],
        },
      ],
      () => {
        console.log("Seeding completed!");
        mongoose.disconnect();
      }
    );
  });
});
