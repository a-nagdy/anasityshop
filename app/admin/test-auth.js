// Simple test script to check authentication
console.log("=== Authentication Test ===");

// Check if we're in browser
if (typeof document !== "undefined") {
  console.log("Running in browser");
  console.log("All cookies:", document.cookie);

  // Test getCookie function
  try {
    const { getCookie } = require("cookies-next");
    const token = getCookie("auth_token");
    console.log("getCookie result:", token);
  } catch (e) {
    console.log("getCookie error:", e.message);
  }

  // Test direct cookie parsing
  const match = document.cookie.match(/auth_token=([^;]+)/);
  const directToken = match ? match[1] : null;
  console.log("Direct cookie parsing:", directToken);
} else {
  console.log("Running in server/SSR");
}

console.log("=== End Test ===");
