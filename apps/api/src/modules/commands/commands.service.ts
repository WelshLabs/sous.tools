import { Injectable, Logger } from '@nestjs/common';
import { OmnibarCommandPayload } from '@soustools/api-types';
import { GoogleGenAI } from '@google/genai';
import { PurchaseOrdersService } from '../items/purchase-orders.service';
import { VendorsService } from '../items/vendors.service';
import { WhiteboardService } from '../items/whiteboard.service';

@Injectable()
export class CommandsService {
  private readonly logger = new Logger(CommandsService.name);
  private readonly ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
    private readonly vendorsService: VendorsService,
    private readonly whiteboardService: WhiteboardService,
  ) {}

  async handleCommand(payload: OmnibarCommandPayload, orgId: string, emitState?: (state: string, message: string) => void) {
    this.logger.log(`\n🤖 AI COMMAND RECEIVED [${payload.source}]: ${payload.command}`);
    if (payload.context) {
      this.logger.log(`Context: ${JSON.stringify(payload.context)}`);
    }

    try {
      if (emitState) emitState('processing_nlp', 'Analyzing command...');
      // Prompt Gemini to extract details
      const prompt = `Extract the following structured data from this kitchen command: "${payload.command}"
If the user wants to add an item to an order, action should be "ADD_TO_ORDER".
Also extract quantity (number, default 1), unit (string, default "unit"), itemName (string), and vendorName (string, leave null if not mentioned or implied).
Respond ONLY with a valid JSON object in this format:
{"action": "ADD_TO_ORDER", "quantity": 1, "unit": "cases", "itemName": "tomatoes", "vendorName": "sysco"}
`;

      const aiResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      if (!aiResponse.text) {
        throw new Error('No response from Gemini');
      }

      const parsed = JSON.parse(aiResponse.text);

      if (parsed.action === 'ADD_TO_ORDER') {
        if (emitState) emitState('processing_nlp', 'Drafting order...');
        const qty = parsed.quantity || 1;
        const unit = parsed.unit || '';
        const item = parsed.itemName;
        const vendorName = parsed.vendorName;
        
        let targetVendorId: string | null = null;
        let finalVendorName: string | null = null;
        
        // Attempt to match vendorName to a vendor in DB
        if (vendorName) {
          if (emitState) emitState('processing_nlp', `Verifying vendor: ${vendorName}...`);
          const vendors = await this.vendorsService.findAll(orgId);
          const matchedVendor = vendors.find((v: any) => 
            v.name?.toLowerCase().includes(vendorName.toLowerCase())
          );
          if (matchedVendor) {
            targetVendorId = matchedVendor.id as string;
            finalVendorName = matchedVendor.name as string;
          }
        }

        const rawName = `${qty} ${unit} ${item}`.trim();

        if (targetVendorId) {
          // Vendor found, add to DRAFT PO
          if (emitState) emitState('processing_nlp', 'Adding to purchase order...');
          await this.purchaseOrdersService.addItemToDraft({
            vendor_id: targetVendorId,
            raw_name: rawName,
            ordered_qty: qty,
          });
          return {
            action: 'ADD_TO_ORDER',
            message: `Added ${qty} ${unit} ${item} to the ${finalVendorName} draft order`,
          };
        } else {
          // No vendor mentioned or vendor not found, fallback to Whiteboard
          if (emitState) emitState('processing_nlp', 'Adding to whiteboard...');
          await this.whiteboardService.create({
            raw_name: rawName,
          });
          return {
            action: 'ADD_TO_ORDER',
            message: `Added ${qty} ${unit} ${item} to the Whiteboard`,
          };
        }
      }

      return {
        action: parsed.action || 'ACKNOWLEDGED',
        message: 'Command processed, but no specific action taken.',
      };
    } catch (error) {
      this.logger.error('Failed to parse or execute command via Gemini', error);
      return {
        action: 'ERROR',
        message: 'I failed to understand that command, Chef.',
      };
    }
  }
}
