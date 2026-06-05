async function checkResized() {
  const url = 'https://lh3.googleusercontent.com/d/1KosVqZFrnrrCBaFBjhzKLo0XacmXTpgn=w400';
  try {
    const res = await fetch(url, { method: 'GET' });
    console.log("Status:", res.status);
    console.log("Content-Length:", res.headers.get('content-length'));
    console.log("Content-Type:", res.headers.get('content-type'));
  } catch (err) {
    console.error(err);
  }
}

checkResized();
