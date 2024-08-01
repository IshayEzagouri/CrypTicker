import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
// Base URL for API requests
const baseUrl = "https://rest.coinapi.io/v1";
const apiKey = process.env.COINAPI_KEY;

// Fetch all assets
export const fetchAllAssets = async () => {
  try {
    const response = await axios.get(`${baseUrl}/assets?apikey=${apiKey}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assets:", error.message);
    return [];
  }
};

// Fetch icons for all assets
export const fetchAssetIcons = async (size) => {
  try {
    const response = await axios.get(
      `${baseUrl}/assets/icons/${size}?apikey=${apiKey}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching asset icons:", error.message);
    return [];
  }
};

// Map asset icons to assets
export const mapIconsToAssets = (assets, icons) => {
  const iconMap = new Map();
  icons.forEach((icon) => {
    iconMap.set(icon.asset_id, icon.url);
  });

  return assets.map((asset) => ({
    ...asset,
    iconUrl: iconMap.get(asset.asset_id) || null,
  }));
};

// Construct endpoints with assets and icons
export const constructEndpoints = (assets) => {
  return assets.map((asset) => ({
    name: asset.name,
    price: asset.price_usd ? asset.price_usd.toFixed(2) : "N/A",
    volumeD: asset.volume_1day_usd,
    volumeM: asset.volume_1mth_usd,
    totalSupply: asset.supply_total || "N/A",
    maxSupply: asset.supply_max || "N/A",
    iconUrl: asset.iconUrl,
  }));
};

// Filter assets by volume, type (crypto), and price
export const filterAssetsByVolume = (assets, minVolume) => {
  return assets.filter(
    (asset) =>
      asset.volume_1hrs_usd &&
      asset.volume_1hrs_usd >= minVolume &&
      asset.type_is_crypto === 1 &&
      asset.price_usd &&
      asset.price_usd <= 80000
  );
};
