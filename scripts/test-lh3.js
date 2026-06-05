async function checkHeaders() {
  const url = 'https://lh3.googleusercontent.com/d/1KosVqZFrnrrCBaFBjhzKLo0XacmXTpgn';
  try {
    const res = await fetch(url, { method: 'GET' });
    console.log("Status:", res.status);
    console.log("Headers:");
    for (const [key, value] of res.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
  } catch (err) {
    console.error(err);
  }
}

checkHeaders();
