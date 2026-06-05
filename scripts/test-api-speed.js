async function testSpeed() {
  console.time("API Fetch (sync=false)");
  try {
    const res = await fetch("http://localhost:3000/api/gallery");
    const data = await res.json();
    console.timeEnd("API Fetch (sync=false)");
    console.log("Status:", res.status);
    console.log("Items count:", data.items ? data.items.length : 0);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testSpeed();
