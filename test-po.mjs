async function test() {
  const res = await fetch("http://127.0.0.1:6001/purchase-orders");
  console.log(res.status, await res.text());
}
test();
