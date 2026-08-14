async function run() {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const paymentRes = await fetch(
    "https://connect.squareup.com/v2/payments/NUVBfhqP0kbG8UFOzYHS4At4CnRZY",
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const payment = await paymentRes.json();
  console.log(JSON.stringify(payment, null, 2));
}
run().catch(console.error);
