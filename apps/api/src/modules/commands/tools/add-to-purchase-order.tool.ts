import { randomUUID } from "crypto";
import { Command } from "../command.decorator";
import { CommandTool, CommandExecutionContext } from "../command.interface";
import { addToPurchaseOrderTool } from "../commands-tools";
import { PurchaseOrdersService } from "../../items/purchase-orders.service";
import { VendorsService } from "../../items/vendors.service";

@Command(addToPurchaseOrderTool)
export class AddToPurchaseOrderTool implements CommandTool {
  constructor(
    private readonly vendorsService: VendorsService,
    private readonly purchaseOrdersService: PurchaseOrdersService,
  ) {}

  async execute(args: any, context: CommandExecutionContext) {
    const agentMessageContent = `Adding ${args.quantity} ${args.unit} ${args.itemName} to ${args.vendorName} draft PO...`;
    if (context.emitMessage) {
      context.emitMessage({
        id: randomUUID(),
        role: "agent_step",
        content: agentMessageContent,
        timestamp: new Date(),
      });
    }

    const vendors = await this.vendorsService.findAll(context.orgId);
    const matchedVendor = vendors.find((v: any) =>
      v.name?.toLowerCase().includes(args.vendorName.toLowerCase()),
    );

    if (matchedVendor) {
      const rawName = `${args.quantity} ${args.unit} ${args.itemName}`.trim();
      await this.purchaseOrdersService.addItemToDraft({
        vendor_id: matchedVendor.id as string,
        raw_name: rawName,
        ordered_qty: args.quantity,
      });
      return {
        success: true,
        message: `Successfully added to ${matchedVendor.name} PO.`,
      };
    } else {
      return {
        success: false,
        error: `Vendor ${args.vendorName} not found.`,
      };
    }
  }
}
