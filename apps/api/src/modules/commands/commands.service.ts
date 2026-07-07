import { Injectable, Logger } from '@nestjs/common';
import { OmnibarCommandPayload, OmniMessage } from '@soustools/api-types';
import { GoogleGenAI, Type, FunctionDeclaration, Content, Part } from '@google/genai';
import { PurchaseOrdersService } from '../items/purchase-orders.service';
import { VendorsService } from '../items/vendors.service';
import { WhiteboardService } from '../items/whiteboard.service';
import { RecipeCostService } from '../recipe/recipe-cost.service';
import { randomUUID } from 'crypto';

const addToPurchaseOrderTool: FunctionDeclaration = {
  name: 'add_to_purchase_order',
  description: 'Adds an item to a draft purchase order for a specific vendor.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemName: { type: Type.STRING, description: 'The name of the item to add' },
      quantity: { type: Type.NUMBER, description: 'The quantity to order' },
      unit: { type: Type.STRING, description: 'The unit of measure (e.g., cases, lbs, unit)' },
      vendorName: { type: Type.STRING, description: 'The name of the vendor' },
    },
    required: ['itemName', 'quantity', 'unit', 'vendorName'],
  },
};

const addToWhiteboardTool: FunctionDeclaration = {
  name: 'add_to_whiteboard',
  description: 'Adds an item to the kitchen whiteboard when a vendor is not specified or unknown.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemName: { type: Type.STRING, description: 'The name of the item to add' },
      quantity: { type: Type.NUMBER, description: 'The quantity to order' },
      unit: { type: Type.STRING, description: 'The unit of measure' },
    },
    required: ['itemName', 'quantity', 'unit'],
  },
};

const getRecipeCostTool: FunctionDeclaration = {
  name: 'get_recipe_cost',
  description: 'Calculates the current cost of a specific recipe.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      recipeId: { type: Type.STRING, description: 'The ID of the recipe' },
    },
    required: ['recipeId'],
  },
};

@Injectable()
export class CommandsService {
  private readonly logger = new Logger(CommandsService.name);
  private readonly ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
    private readonly vendorsService: VendorsService,
    private readonly whiteboardService: WhiteboardService,
    private readonly recipeCostService: RecipeCostService,
  ) {}

  private mapToGeminiContent(chatHistory: OmniMessage[]): Content[] {
    return chatHistory.map((msg) => ({
      role: msg.role === 'model' || msg.role === 'agent_step' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  }

  async handleCommand(
    payload: OmnibarCommandPayload,
    orgId: string,
    emitMessage?: (msg: OmniMessage) => void,
  ) {
    this.logger.log(`\n🤖 AI COMMAND RECEIVED [${payload.source}]`);

    try {
      const history = payload.chatHistory || [];
      const contents = this.mapToGeminiContent(history);
      
      // We will loop to handle function calls
      let isDone = false;
      let finalResult = null;
      let iterations = 0;

      while (!isDone && iterations < 5) {
        iterations++;
        
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents,
          config: {
            tools: [{
              functionDeclarations: [addToPurchaseOrderTool, addToWhiteboardTool, getRecipeCostTool]
            }]
          }
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
          const call = response.functionCalls[0];
          const functionName = call.name;
          const args = call.args as Record<string, any>;

          this.logger.log(`🛠️ Tool invoked: ${functionName}`, args);

          let toolResponseData: any = {};
          let agentMessageContent = `Executing ${functionName}...`;

          if (functionName === 'add_to_purchase_order') {
            agentMessageContent = `Adding ${args.quantity} ${args.unit} ${args.itemName} to ${args.vendorName} draft PO...`;
            if (emitMessage) {
              emitMessage({ id: randomUUID(), role: 'agent_step', content: agentMessageContent, timestamp: new Date() });
            }

            const vendors = await this.vendorsService.findAll(orgId);
            const matchedVendor = vendors.find((v: any) => v.name?.toLowerCase().includes(args.vendorName.toLowerCase()));

            if (matchedVendor) {
              const rawName = `${args.quantity} ${args.unit} ${args.itemName}`.trim();
              await this.purchaseOrdersService.addItemToDraft({
                vendor_id: matchedVendor.id as string,
                raw_name: rawName,
                ordered_qty: args.quantity,
              });
              toolResponseData = { success: true, message: `Successfully added to ${matchedVendor.name} PO.` };
            } else {
              toolResponseData = { success: false, error: `Vendor ${args.vendorName} not found.` };
            }
          } else if (functionName === 'add_to_whiteboard') {
            agentMessageContent = `Adding ${args.quantity} ${args.unit} ${args.itemName} to the Whiteboard...`;
            if (emitMessage) {
              emitMessage({ id: randomUUID(), role: 'agent_step', content: agentMessageContent, timestamp: new Date() });
            }

            const rawName = `${args.quantity} ${args.unit} ${args.itemName}`.trim();
            await this.whiteboardService.create({ raw_name: rawName });
            toolResponseData = { success: true, message: `Added to whiteboard.` };
          } else if (functionName === 'get_recipe_cost') {
            agentMessageContent = `Calculating cost for recipe...`;
            if (emitMessage) {
              emitMessage({ id: randomUUID(), role: 'agent_step', content: agentMessageContent, timestamp: new Date() });
            }
            
            try {
              const cost = await this.recipeCostService.getRecipeCost(args.recipeId);
              toolResponseData = { success: true, cost };
            } catch (err: any) {
              toolResponseData = { success: false, error: err.message };
            }
          }

          // Append model's function call to history
          contents.push({
            role: 'model',
            parts: [{ functionCall: call }] as Part[],
          });

          // Append tool response to history
          contents.push({
            role: 'user', // SDK uses 'user' for function responses, or 'function' depending on SDK version. GenAI uses 'user' with functionResponse part.
            parts: [{
              functionResponse: {
                name: functionName,
                response: toolResponseData
              }
            }] as Part[],
          });
        } else if (response.text) {
          isDone = true;
          finalResult = { action: 'SUCCESS', message: response.text };
          
          if (emitMessage) {
            emitMessage({
              id: randomUUID(),
              role: 'model',
              content: response.text,
              timestamp: new Date()
            });
          }
        } else {
          isDone = true;
          finalResult = { action: 'ERROR', message: 'No recognizable response from model.' };
        }
      }

      return finalResult;
    } catch (error) {
      this.logger.error('Failed to parse or execute command via Gemini', error);
      const fallbackMsg = 'I failed to understand that command, Chef.';
      if (emitMessage) {
        emitMessage({
          id: randomUUID(),
          role: 'model',
          content: fallbackMsg,
          timestamp: new Date()
        });
      }
      return {
        action: 'ERROR',
        message: fallbackMsg,
      };
    }
  }
}
