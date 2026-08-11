import { Client, Environment } from "square";
import { serverConfig } from "./packages/config/src/server.ts";

async function run() {
  // Use a hardcoded token or Infisical token from environment
  const client = new Client({
    environment: Environment.Production,
    accessToken: process.env.SQUARE_ACCESS_TOKEN || "test",
  });
  
  try {
    const locations = await client.locationsApi.listLocations();
    const locId = locations.result.locations?.[0]?.id;
    if (!locId) {
      console.log("No locations");
      return;
    }
    const orders = await client.ordersApi.searchOrders({
      locationIds: [locId],
      query: {
        filter: { stateFilter: { states: ["COMPLETED"] } }
      },
      limit: 5
    });
    console.log(JSON.stringify(orders.result.orders?.[0]?.tenders, null, 2));
    console.log("---");
    console.log(JSON.stringify(orders.result.orders?.[0]?.returnAmounts, null, 2));
  } catch (err: any) {
    console.error(err.message);
  }
}
run();
