const go = async () => {
  const form = {
    name: "Test Frontend Payload",
    order_method: "MANUAL",
    email: "",
    phone: "",
    order_days: []
  };
  const res = await fetch("http://127.0.0.1:6001/vendors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  console.log(await res.json());
};
go();
