async function testSync() {
  console.log("Fetching http://localhost:3000/api/gallery?sync=true...");
  try {
    const res = await fetch("http://localhost:3000/api/gallery?sync=true");
    console.log("Response status:", res.status);
    const data = await res.json();
    console.log("Response source:", data.source);
    console.log("Response items count:", data.items ? data.items.length : 0);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testSync();
