import express from "express";
import session from "express-session";
import {
  fetchAllAssets,
  fetchAssetIcons,
  filterAssetsByVolume,
  mapIconsToAssets,
  constructEndpoints,
} from "./utils.js";

const app = express();
const port = 3000;

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // Session expiration time in milliseconds (1 day)
  })
);

app.use(express.static("public"));

app.set("view engine", "ejs"); // Ensure EJS is set as the view engine

app.get("/", async (req, res) => {
  try {
    const minVolume = 300000000;

    // Check if the assets are already cached
    if (req.session.filteredAssets && req.session.assetIcons) {
      console.log("Returning cached assets");
      const filteredAssets = req.session.filteredAssets;
      const assetIcons = req.session.assetIcons;

      // Map icons to cached assets
      const assetsWithIcons = mapIconsToAssets(filteredAssets, assetIcons);

      // Construct endpoints with assets and icons
      const endpoints = constructEndpoints(assetsWithIcons);

      console.log("Extracted data from cache:", endpoints);
      return res.render("index", { assets: endpoints });
    }

    // Fetch and filter the data
    const allAssets = await fetchAllAssets();
    const filteredAssets = await filterAssetsByVolume(allAssets, minVolume);

    // Fetch asset icons
    const assetIcons = await fetchAssetIcons(50); // Example size, adjust as needed

    // Map icons to assets
    const assetsWithIcons = mapIconsToAssets(filteredAssets, assetIcons);

    // Construct endpoints with assets and icons
    const endpoints = constructEndpoints(assetsWithIcons);

    // Cache assets and icons
    req.session.filteredAssets = filteredAssets;
    req.session.assetIcons = assetIcons;

    console.log("Extracted data:", endpoints);
    res.render("index", { assets: endpoints });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
