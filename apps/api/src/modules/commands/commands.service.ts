import { Injectable, Logger, Inject } from '@nestjs/common';
import { OmnibarCommandPayload, OmniMessage } from '@soustools/api-types';
import { GoogleGenAI, Type, FunctionDeclaration, Content, Part } from '@google/genai';
import { PurchaseOrdersService } from '../items/purchase-orders.service';
import { VendorsService } from '../items/vendors.service';
import { WhiteboardService } from '../items/whiteboard.service';
import { RecipeCostService } from '../recipe/recipe-cost.service';
import { randomUUID } from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { config } from '@soustools/config';

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

const updateItemStatusTool: FunctionDeclaration = {
  name: 'update_item_status',
  description: 'Updates the status of an item (e.g., 86ing an item by setting it to out_of_stock).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemId: { type: Type.STRING, description: 'The ID or name of the item' },
      status: { type: Type.STRING, description: 'The new status (e.g., out_of_stock)' },
    },
    required: ['itemId', 'status'],
  },
};

const adjustThrottleTimeTool: FunctionDeclaration = {
  name: 'adjust_throttle_time',
  description: 'Adjusts the ticket or kitchen throttle time when the kitchen is busy (e.g., "in the weeds").',
  parameters: {
    type: Type.OBJECT,
    properties: {
      minutes: { type: Type.NUMBER, description: 'The number of minutes to add to the throttle time' },
    },
    required: ['minutes'],
  },
};

const reconcileInventoryTool: FunctionDeclaration = {
  name: 'reconcile_inventory',
  description: 'Performs an absolute overwrite of an inventory count (e.g., "we have 3 gallons all day").',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemId: { type: Type.STRING, description: 'The ID or name of the item' },
      quantity: { type: Type.NUMBER, description: 'The absolute quantity on hand' },
      unit: { type: Type.STRING, description: 'The unit of measure' },
    },
    required: ['itemId', 'quantity', 'unit'],
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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
      const isLockedOut = await this.cacheManager.get('gemini_quota_lockout');
      const history = payload.chatHistory || [];

      if (isLockedOut) {
        return this.fallbackToOllama(history, emitMessage);
      }

      const contents = this.mapToGeminiContent(history);
      
      // We will loop to handle function calls
      let isDone = false;
      let finalResult = null;
      let iterations = 0;

      while (!isDone && iterations < 5) {
        iterations++;
        
        let response;
        try {
          response = await this.ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents,
            config: {
              systemInstruction: {
                role: 'system',
                parts: [{ text: "You are the Sous Chef of a high-volume restaurant. You must always acknowledge commands first with 'Heard, Chef' or 'Yes, Chef'. Use kitchen vernacular casually. You have a slightly gritty, service-industry sense of humor." }]
              },
              tools: [{
                functionDeclarations: [addToPurchaseOrderTool, addToWhiteboardTool, getRecipeCostTool, updateItemStatusTool, adjustThrottleTimeTool, reconcileInventoryTool]
              }]
            }
          });
        } catch (genError: any) {
          if (genError.status === 429 || genError.message?.includes('429')) {
            this.logger.warn('Gemini 429 Quota Exceeded. Setting lockout and falling back to Ollama.');
            await this.cacheManager.set('gemini_quota_lockout', true, 3600000); // 3600 seconds in ms
            if (emitMessage) {
              emitMessage({ id: randomUUID(), role: 'agent_step', content: 'Quota exceeded. Falling back to local Ollama...', timestamp: new Date() });
            }
            return this.fallbackToOllama(history, emitMessage);
          }
          throw genError;
        }

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
          } else if (functionName === 'update_item_status') {
            agentMessageContent = `Updating item ${args.itemId} status to ${args.status}...`;
            if (emitMessage) emitMessage({ id: randomUUID(), role: 'agent_step', content: agentMessageContent, timestamp: new Date() });
            toolResponseData = { success: true, message: `Status updated.` };
          } else if (functionName === 'adjust_throttle_time') {
            agentMessageContent = `Adding ${args.minutes} minutes to throttle time...`;
            if (emitMessage) emitMessage({ id: randomUUID(), role: 'agent_step', content: agentMessageContent, timestamp: new Date() });
            toolResponseData = { success: true, message: `Throttle time adjusted.` };
          } else if (functionName === 'reconcile_inventory') {
            agentMessageContent = `Setting inventory for ${args.itemId} to ${args.quantity} ${args.unit}...`;
            if (emitMessage) emitMessage({ id: randomUUID(), role: 'agent_step', content: agentMessageContent, timestamp: new Date() });
            toolResponseData = { success: true, message: `Inventory reconciled.` };
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

  private async fallbackToOllama(history: OmniMessage[], emitMessage?: (msg: OmniMessage) => void) {
    this.logger.log('Routing to local Ollama model (qwen2.5-coder:3b)');
    try {
      const messages = history.map(m => ({
        role: m.role === 'agent_step' ? 'assistant' : (m.role === 'model' ? 'assistant' : 'user'),
        content: m.content
      }));

      // Add system prompt
      messages.unshift({
        role: 'system',
        content: "You are the Sous Chef of a high-volume restaurant. You must always acknowledge commands first with 'Heard, Chef' or 'Yes, Chef'. Use kitchen vernacular casually. You have a slightly gritty, service-industry sense of humor."
      });

      const ollamaUrl = `${config.OLLAMA_HOST || 'http://127.0.0.1:11434'}/api/chat`;
      const response = await fetch(ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen2.5-coder:3b',
          messages,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama responded with status ${response.status}`);
      }

      const data = await response.json();
      const reply = data.message?.content || 'Heard, chef (Ollama fallback).';

      if (emitMessage) {
        emitMessage({
          id: randomUUID(),
          role: 'model',
          content: reply,
          timestamp: new Date()
        });
      }
      return { action: 'SUCCESS', message: reply };
    } catch (err: any) {
      this.logger.error('Ollama fallback failed', err);
      const fallbackMsg = 'I failed to understand that command, Chef (and fallback failed).';
      if (emitMessage) {
        emitMessage({ id: randomUUID(), role: 'model', content: fallbackMsg, timestamp: new Date() });
      }
      return { action: 'ERROR', message: fallbackMsg };
    }
  }
}
