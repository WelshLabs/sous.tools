import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { Neo4jService } from "./neo4j.service";

export class SupabaseWebhookPayload {
  type!: "INSERT" | "UPDATE" | "DELETE";
  table!: string;
  schema!: string;
  record!: Record<string, any> | null;
  old_record!: Record<string, any> | null;
}

@Injectable()
export class Neo4jSyncService {
  private readonly logger = new Logger(Neo4jSyncService.name);

  constructor(private readonly neo4jService: Neo4jService) {}

  /**
   * Processes the incoming database webhook payload and translates it to Cypher queries.
   */
  async handleWebhook(payload: SupabaseWebhookPayload): Promise<void> {
    const { table, type, schema } = payload;
    this.logger.log(`Processing database webhook: [${schema}.${table}] [${type}]`);

    switch (table) {
      case "users":
        await this.syncUser(payload);
        break;
      case "recipes":
        await this.syncRecipe(payload);
        break;
      case "organizations":
        await this.syncOrganization(payload);
        break;
      case "vendors":
        await this.syncVendor(payload);
        break;
      case "items":
        await this.syncItem(payload);
        break;
      case "recipe_ingredients":
        await this.syncRecipeIngredient(payload);
        break;
      case "inventory_on_hand":
        await this.syncInventoryOnHand(payload);
        break;
      case "purchase_orders":
        await this.syncPurchaseOrder(payload);
        break;
      case "purchase_order_items":
        await this.syncPurchaseOrderItem(payload);
        break;
      case "vendor_item_aliases":
        await this.syncVendorItemAlias(payload);
        break;
      case "tickets":
        await this.syncTicket(payload);
        break;
      case "orders":
        await this.syncOrder(payload);
        break;
      case "order_items":
        await this.syncOrderItem(payload);
        break;
      case "shifts":
        await this.syncShift(payload);
        break;
      case "time_clocks":
        await this.syncTimeClock(payload);
        break;
      case "invoices":
        await this.syncInvoice(payload);
        break;
      case "invoice_items":
        await this.syncInvoiceItem(payload);
        break;
      case "wastage_logs":
        await this.syncWastageLog(payload);
        break;
      default:
        this.logger.warn(`Received sync request for unhandled table: ${schema}.${table}`);
        break;
    }
  }

  private async syncUser(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing user ID in DELETE payload");
      }

      this.logger.log(`Deleting User node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (u:User {id: $id})
        DETACH DELETE u
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing user record or ID in ${type} payload`);
      }

      const id = record.id;
      const rawMeta = record.raw_user_meta_data || {};
      const fullName = rawMeta.full_name || rawMeta.name || null;

      const properties = {
        email: record.email || null,
        role: record.role || null,
        fullName,
        createdAt: record.created_at || null,
        updatedAt: record.updated_at || null,
      };

      this.logger.log(`Upserting User node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (u:User {id: $id})
        SET u += $properties
        `,
        { id, properties },
      );
    }
  }

  private async syncRecipe(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing recipe ID in DELETE payload");
      }

      this.logger.log(`Deleting Recipe node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (r:Recipe {id: $id})
        DETACH DELETE r
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing recipe record or ID in ${type} payload`);
      }

      const id = record.id;
      const organizationId = record.organization_id;

      if (!organizationId) {
        throw new BadRequestException("Missing organization_id in recipe record");
      }

      const properties = {
        title: record.title || null,
        yieldCount: record.yield_count ? parseFloat(record.yield_count) : null,
        yieldUnit: record.yield_unit || null,
        vesselId: record.vessel_id || null,
        categoryId: record.category_id || null,
        status: record.status || null,
        sourceBook: record.source_book || null,
        sourceAuthor: record.source_author || null,
        sourcePageStart: record.source_page_start || null,
        sourcePageEnd: record.source_page_end || null,
        sourceDocumentUrl: record.source_document_url || null,
        posItemId: record.pos_item_id || null,
        costPerYield: record.cost_per_yield ? parseFloat(record.cost_per_yield) : 0,
        grossMargin: record.gross_margin ? parseFloat(record.gross_margin) : 0,
        createdAt: record.created_at || null,
      };

      this.logger.log(`Upserting Recipe node and Organization relationship in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (r:Recipe {id: $id})
        SET r += $properties
        WITH r
        MERGE (o:Organization {id: $organizationId})
        MERGE (r)-[:BELONGS_TO]->(o)
        `,
        { id, properties, organizationId },
      );
    }
  }

  private async syncOrganization(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing organization ID in DELETE payload");
      }

      this.logger.log(`Deleting Organization node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (o:Organization {id: $id})
        DETACH DELETE o
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing organization record or ID in ${type} payload`);
      }

      const id = record.id;
      const properties = {
        name: record.name || null,
        createdAt: record.created_at || null,
      };

      this.logger.log(`Upserting Organization node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (o:Organization {id: $id})
        SET o += $properties
        `,
        { id, properties },
      );
    }
  }

  private async syncVendor(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing vendor ID in DELETE payload");
      }

      this.logger.log(`Deleting Vendor node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (v:Vendor {id: $id})
        DETACH DELETE v
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing vendor record or ID in ${type} payload`);
      }

      const id = record.id;
      const organizationId = record.organization_id;

      if (!organizationId) {
        throw new BadRequestException("Missing organization_id in vendor record");
      }

      const properties = {
        name: record.name || null,
        orderMethod: record.order_method || null,
        email: record.email || null,
        phone: record.phone || null,
        createdAt: record.created_at || null,
        updatedAt: record.updated_at || null,
      };

      this.logger.log(`Upserting Vendor node and Organization relationship in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (v:Vendor {id: $id})
        SET v += $properties
        WITH v
        MERGE (o:Organization {id: $organizationId})
        MERGE (v)-[:BELONGS_TO]->(o)
        `,
        { id, properties, organizationId },
      );
    }
  }

  private async syncItem(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing item ID in DELETE payload");
      }

      this.logger.log(`Deleting Item node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (i:Item {id: $id})
        DETACH DELETE i
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing item record or ID in ${type} payload`);
      }

      const id = record.id;
      const organizationId = record.organization_id;

      if (!organizationId) {
        throw new BadRequestException("Missing organization_id in item record");
      }

      const properties = {
        name: record.name || null,
        category: record.category || null,
        purchaseUnit: record.purchase_unit || null,
        currentCostPerG: record.current_cost_per_g ? parseFloat(record.current_cost_per_g) : null,
        createdAt: record.created_at || null,
        updatedAt: record.updated_at || null,
      };

      this.logger.log(`Upserting Item node and Organization relationship in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (i:Item {id: $id})
        SET i += $properties
        WITH i
        MERGE (o:Organization {id: $organizationId})
        MERGE (i)-[:BELONGS_TO]->(o)
        `,
        { id, properties, organizationId },
      );
    }
  }

  private async syncRecipeIngredient(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing recipe ingredient ID in DELETE payload");
      }

      this.logger.log(`Deleting RecipeIngredient node and USES_INGREDIENT edge in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (ri:RecipeIngredient {id: $id})
        DETACH DELETE ri
        WITH $id AS targetId
        MATCH (:Recipe)-[rel:USES_INGREDIENT {id: $targetId}]->()
        DELETE rel
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing recipe ingredient record or ID in ${type} payload`);
      }

      const id = record.id;
      const recipeId = record.recipe_id;
      const itemId = record.item_id || null;
      const masterItemId = record.master_item_id || record.master_ingredient_id || null;

      if (!recipeId) {
        throw new BadRequestException("Missing recipe_id in recipe ingredient record");
      }

      const properties = {
        recipeId,
        itemId,
        masterItemId,
        amount: record.amount ? parseFloat(record.amount) : 0,
        unit: record.unit || null,
        prepNotes: record.prep_notes || null,
        component: record.component || null,
        rawName: record.raw_name || null,
        createdAt: record.created_at || null,
      };

      this.logger.log(`Upserting RecipeIngredient node and USES_INGREDIENT edges in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (ri:RecipeIngredient {id: $id})
        SET ri += $properties
        WITH ri
        MATCH (r:Recipe {id: $recipeId})
        
        // Link to Item if set
        FOREACH (x IN CASE WHEN $itemId IS NOT NULL THEN [1] ELSE [] END |
          MERGE (item:Item {id: $itemId})
          MERGE (r)-[rel:USES_INGREDIENT {id: $id}]->(item)
          SET rel.amount = $amount, rel.unit = $unit, rel.prepNotes = $prepNotes
        )
        
        // Link to MasterItem if set
        FOREACH (x IN CASE WHEN $masterItemId IS NOT NULL THEN [1] ELSE [] END |
          MERGE (m:MasterItem {id: $masterItemId})
          MERGE (r)-[rel:USES_INGREDIENT {id: $id}]->(m)
          SET rel.amount = $amount, rel.unit = $unit, rel.prepNotes = $prepNotes
        )
        `,
        {
          id,
          recipeId,
          itemId,
          masterItemId,
          amount: properties.amount,
          unit: properties.unit,
          prepNotes: properties.prepNotes,
          properties,
        },
      );
    }
  }

  private async syncInventoryOnHand(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing inventory record ID in DELETE payload");
      }

      this.logger.log(`Deleting InventoryOnHand node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (ioh:InventoryOnHand {id: $id})
        DETACH DELETE ioh
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing inventory record or ID in ${type} payload`);
      }

      const id = record.id;
      const organizationId = record.organization_id;
      const itemId = record.item_id;

      if (!organizationId || !itemId) {
        throw new BadRequestException("Missing organization_id or item_id in inventory record");
      }

      const properties = {
        quantityG: record.quantity_g ? parseFloat(record.quantity_g) : 0,
        lotNumber: record.lot_number || null,
        lotExpiry: record.lot_expiry || null,
        location: record.location || null,
        updatedAt: record.updated_at || null,
      };

      this.logger.log(`Upserting InventoryOnHand node and relationships in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (ioh:InventoryOnHand {id: $id})
        SET ioh += $properties
        WITH ioh
        MERGE (o:Organization {id: $organizationId})
        MERGE (ioh)-[:BELONGS_TO]->(o)
        WITH ioh
        MERGE (i:Item {id: $itemId})
        MERGE (ioh)-[:OF_ITEM]->(i)
        `,
        { id, properties, organizationId, itemId },
      );
    }
  }

  private async syncPurchaseOrder(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing purchase order ID in DELETE payload");
      }

      this.logger.log(`Deleting PurchaseOrder node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (po:PurchaseOrder {id: $id})
        DETACH DELETE po
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing purchase order record or ID in ${type} payload`);
      }

      const id = record.id;
      const organizationId = record.organization_id;
      const vendorId = record.vendor_id;

      if (!organizationId || !vendorId) {
        throw new BadRequestException("Missing organization_id or vendor_id in purchase order record");
      }

      const properties = {
        status: record.status || null,
        orderDate: record.order_date || null,
        createdAt: record.created_at || null,
      };

      this.logger.log(`Upserting PurchaseOrder node and relationships in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (po:PurchaseOrder {id: $id})
        SET po += $properties
        WITH po
        MERGE (o:Organization {id: $organizationId})
        MERGE (po)-[:BELONGS_TO]->(o)
        WITH po
        MERGE (v:Vendor {id: $vendorId})
        MERGE (po)-[:PLACED_WITH]->(v)
        `,
        { id, properties, organizationId, vendorId },
      );
    }
  }

  private async syncPurchaseOrderItem(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing purchase order item ID in DELETE payload");
      }

      this.logger.log(`Deleting PurchaseOrderItem node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (poi:PurchaseOrderItem {id: $id})
        DETACH DELETE poi
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing purchase order item record or ID in ${type} payload`);
      }

      const id = record.id;
      const poId = record.po_id;

      if (!poId) {
        throw new BadRequestException("Missing po_id in purchase order item record");
      }

      const properties = {
        rawName: record.raw_name || null,
        orderedQty: record.ordered_qty ? parseFloat(record.ordered_qty) : 0,
        pricePerUnit: record.price_per_unit ? parseFloat(record.price_per_unit) : 0,
        createdAt: record.created_at || null,
      };

      this.logger.log(`Upserting PurchaseOrderItem node and relationship in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (poi:PurchaseOrderItem {id: $id})
        SET poi += $properties
        WITH poi
        MERGE (po:PurchaseOrder {id: $poId})
        MERGE (poi)-[:PART_OF]->(po)
        `,
        { id, properties, poId },
      );
    }
  }

  private async syncVendorItemAlias(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing vendor item alias ID in DELETE payload");
      }

      this.logger.log(`Deleting VendorItemAlias node and SUPPLIED_BY edge in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (via:VendorItemAlias {id: $id})
        DETACH DELETE via
        WITH $id AS targetId
        MATCH ()-[rel:SUPPLIED_BY {id: $targetId}]->()
        DELETE rel
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing vendor item alias record or ID in ${type} payload`);
      }

      const id = record.id;
      const organizationId = record.organization_id;
      const vendorId = record.vendor_id;
      const itemId = record.item_id || null;
      const internalItemId = record.internal_item_id || null;

      if (!organizationId || !vendorId) {
        throw new BadRequestException("Missing organization_id or vendor_id in vendor item alias record");
      }

      const properties = {
        organizationId,
        vendorId,
        vendorItemName: record.vendor_item_name || null,
        itemId,
        internalItemId,
        createdAt: record.created_at || null,
      };

      this.logger.log(`Upserting VendorItemAlias node and SUPPLIED_BY relationships in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (via:VendorItemAlias {id: $id})
        SET via += $properties
        WITH via
        MERGE (v:Vendor {id: $vendorId})
        
        // Link internal Item if set
        WITH via, v
        FOREACH (x IN CASE WHEN $internalItemId IS NOT NULL THEN [1] ELSE [] END |
          MERGE (i:Item {id: $internalItemId})
          MERGE (i)-[rel:SUPPLIED_BY {id: $id}]->(v)
          SET rel.vendorItemName = $vendorItemName
        )
        
        // Link MasterItem if set
        WITH via, v
        FOREACH (x IN CASE WHEN $itemId IS NOT NULL THEN [1] ELSE [] END |
          MERGE (m:MasterItem {id: $itemId})
          MERGE (m)-[rel:SUPPLIED_BY {id: $id}]->(v)
          SET rel.vendorItemName = $vendorItemName
        )
        `,
        {
          id,
          vendorId,
          internalItemId,
          itemId,
          vendorItemName: properties.vendorItemName,
          properties,
        },
      );
    }
  }

  private async syncTicket(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing ticket ID in DELETE payload");
      }

      this.logger.log(`Deleting Ticket node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (t:Ticket {id: $id})
        DETACH DELETE t
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing ticket record or ID in ${type} payload`);
      }

      const id = record.id;
      const organizationId = record.organization_id;
      const employeeId = record.employee_id || null;

      if (!organizationId) {
        throw new BadRequestException("Missing organization_id in ticket record");
      }

      const properties = {
        tableNumber: record.table_number || null,
        section: record.section || null,
        status: record.status || "OPEN",
        createdAt: record.created_at || null,
      };

      this.logger.log(`Upserting Ticket node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (t:Ticket {id: $id})
        SET t += $properties
        WITH t
        MERGE (o:Organization {id: $organizationId})
        MERGE (t)-[:BELONGS_TO]->(o)
        WITH t
        FOREACH (x IN CASE WHEN $employeeId IS NOT NULL THEN [1] ELSE [] END |
          MERGE (u:User {id: $employeeId})
          MERGE (u)-[:SOLD]->(t)
        )
        `,
        { id, properties, organizationId, employeeId },
      );
    }
  }

  private async syncOrder(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing order ID in DELETE payload");
      }

      this.logger.log(`Deleting Order node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (ord:Order {id: $id})
        DETACH DELETE ord
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing order record or ID in ${type} payload`);
      }

      const id = record.id;
      const ticketId = record.ticket_id;

      if (!ticketId) {
        throw new BadRequestException("Missing ticket_id in order record");
      }

      const properties = {
        status: record.status || null,
        createdAt: record.created_at || null,
      };

      this.logger.log(`Upserting Order node and relationship in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (ord:Order {id: $id})
        SET ord += $properties
        WITH ord
        MERGE (t:Ticket {id: $ticketId})
        MERGE (ord)-[:PART_OF]->(t)
        `,
        { id, properties, ticketId },
      );
    }
  }

  private async syncOrderItem(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing order item ID in DELETE payload");
      }

      this.logger.log(`Deleting OrderItem node and INCLUDES relationship in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (oi:OrderItem {id: $id})
        DETACH DELETE oi
        WITH $id AS targetId
        MATCH (:Ticket)-[rel:INCLUDES {id: $targetId}]->()
        DELETE rel
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing order item record or ID in ${type} payload`);
      }

      const id = record.id;
      const orderId = record.order_id;
      const recipeId = record.recipe_id || null;

      if (!orderId) {
        throw new BadRequestException("Missing order_id in order item record");
      }

      const properties = {
        orderId,
        recipeId,
        quantity: record.quantity ? parseFloat(record.quantity) : 1,
        unitPrice: record.unit_price ? parseFloat(record.unit_price) : 0,
        createdAt: record.created_at || null,
      };

      this.logger.log(`Upserting OrderItem node and INCLUDES relationships in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (oi:OrderItem {id: $id})
        SET oi += $properties
        WITH oi
        MERGE (ord:Order {id: $orderId})
        MERGE (oi)-[:PART_OF]->(ord)
        WITH oi, ord
        MATCH (t:Ticket {id: ord.ticketId})
        FOREACH (x IN CASE WHEN $recipeId IS NOT NULL THEN [1] ELSE [] END |
          MERGE (r:Recipe {id: $recipeId})
          MERGE (oi)-[:OF_RECIPE]->(r)
          MERGE (t)-[rel:INCLUDES {id: $id}]->(r)
          SET rel.quantity = $quantity
        )
        `,
        {
          id,
          orderId,
          recipeId,
          quantity: properties.quantity,
          properties,
        },
      );
    }
  }

  private async syncShift(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing shift ID in DELETE payload");
      }

      this.logger.log(`Deleting Shift node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (s:Shift {id: $id})
        DETACH DELETE s
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing shift record or ID in ${type} payload`);
      }

      const id = record.id;
      const organizationId = record.organization_id;
      const userId = record.user_id;

      if (!organizationId || !userId) {
        throw new BadRequestException("Missing organization_id or user_id in shift record");
      }

      const properties = {
        startTime: record.start_time || null,
        endTime: record.end_time || null,
        role: record.role || null,
        createdAt: record.created_at || null,
      };

      this.logger.log(`Upserting Shift node and relationships in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (s:Shift {id: $id})
        SET s += $properties
        WITH s
        MERGE (o:Organization {id: $organizationId})
        MERGE (s)-[:BELONGS_TO]->(o)
        WITH s
        MERGE (u:User {id: $userId})
        MERGE (u)-[:WORKED]->(s)
        `,
        { id, properties, organizationId, userId },
      );
    }
  }

  private async syncTimeClock(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing time clock ID in DELETE payload");
      }

      this.logger.log(`Deleting TimeClock node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (tc:TimeClock {id: $id})
        DETACH DELETE tc
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing time clock record or ID in ${type} payload`);
      }

      const id = record.id;
      const organizationId = record.organization_id;
      const userId = record.user_id;

      if (!organizationId || !userId) {
        throw new BadRequestException("Missing organization_id or user_id in time clock record");
      }

      const properties = {
        clockIn: record.clock_in || null,
        clockOut: record.clock_out || null,
        createdAt: record.created_at || null,
      };

      this.logger.log(`Upserting TimeClock node and relationships in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (tc:TimeClock {id: $id})
        SET tc += $properties
        WITH tc
        MERGE (o:Organization {id: $organizationId})
        MERGE (tc)-[:BELONGS_TO]->(o)
        WITH tc
        MERGE (u:User {id: $userId})
        MERGE (u)-[:CLOCKED]->(tc)
        `,
        { id, properties, organizationId, userId },
      );
    }
  }

  private async syncInvoice(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing invoice ID in DELETE payload");
      }

      this.logger.log(`Deleting Invoice node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (inv:Invoice {id: $id})
        DETACH DELETE inv
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing invoice record or ID in ${type} payload`);
      }

      const id = record.id;
      const organizationId = record.organization_id;
      const vendorId = record.vendor_id;
      const poId = record.po_id || null;

      if (!organizationId || !vendorId) {
        throw new BadRequestException("Missing organization_id or vendor_id in invoice record");
      }

      const properties = {
        invoiceNumber: record.invoice_number || null,
        totalAmount: record.total_amount ? parseFloat(record.total_amount) : 0,
        invoiceDate: record.invoice_date || null,
        createdAt: record.created_at || null,
      };

      this.logger.log(`Upserting Invoice node and relationships in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (inv:Invoice {id: $id})
        SET inv += $properties
        WITH inv
        MERGE (o:Organization {id: $organizationId})
        MERGE (inv)-[:BELONGS_TO]->(o)
        WITH inv
        MERGE (v:Vendor {id: $vendorId})
        MERGE (inv)-[:FROM_VENDOR]->(v)
        WITH inv
        FOREACH (x IN CASE WHEN $poId IS NOT NULL THEN [1] ELSE [] END |
          MERGE (po:PurchaseOrder {id: $poId})
          MERGE (inv)-[:RECONCILES]->(po)
        )
        `,
        { id, properties, organizationId, vendorId, poId },
      );
    }
  }

  private async syncInvoiceItem(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing invoice item ID in DELETE payload");
      }

      this.logger.log(`Deleting InvoiceItem node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (ii:InvoiceItem {id: $id})
        DETACH DELETE ii
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing invoice item record or ID in ${type} payload`);
      }

      const id = record.id;
      const invoiceId = record.invoice_id;
      const itemId = record.item_id || null;

      if (!invoiceId) {
        throw new BadRequestException("Missing invoice_id in invoice item record");
      }

      const properties = {
        rawName: record.raw_name || null,
        quantity: record.quantity ? parseFloat(record.quantity) : 0,
        unitPrice: record.unit_price ? parseFloat(record.unit_price) : 0,
        createdAt: record.created_at || null,
      };

      this.logger.log(`Upserting InvoiceItem node and relationships in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (ii:InvoiceItem {id: $id})
        SET ii += $properties
        WITH ii
        MERGE (inv:Invoice {id: $invoiceId})
        MERGE (ii)-[:PART_OF]->(inv)
        WITH ii
        FOREACH (x IN CASE WHEN $itemId IS NOT NULL THEN [1] ELSE [] END |
          MERGE (item:Item {id: $itemId})
          MERGE (ii)-[:OF_ITEM]->(item)
        )
        `,
        { id, properties, invoiceId, itemId },
      );
    }
  }

  private async syncWastageLog(payload: SupabaseWebhookPayload): Promise<void> {
    const { type, record, old_record } = payload;

    if (type === "DELETE") {
      const id = old_record?.id;
      if (!id) {
        throw new BadRequestException("Missing wastage log ID in DELETE payload");
      }

      this.logger.log(`Deleting WastageLog node in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MATCH (wl:WastageLog {id: $id})
        DETACH DELETE wl
        `,
        { id },
      );
    } else {
      if (!record || !record.id) {
        throw new BadRequestException(`Missing wastage log record or ID in ${type} payload`);
      }

      const id = record.id;
      const organizationId = record.organization_id;
      const itemId = record.item_id || null;
      const recipeId = record.recipe_id || null;
      const recordedBy = record.recorded_by || null;

      if (!organizationId) {
        throw new BadRequestException("Missing organization_id in wastage log record");
      }

      const properties = {
        quantity: record.quantity ? parseFloat(record.quantity) : 0,
        reason: record.reason || null,
        createdAt: record.created_at || null,
      };

      this.logger.log(`Upserting WastageLog node and relationships in Neo4j: ${id}`);
      await this.neo4jService.runQuery(
        `
        MERGE (wl:WastageLog {id: $id})
        SET wl += $properties
        WITH wl
        MERGE (o:Organization {id: $organizationId})
        MERGE (wl)-[:BELONGS_TO]->(o)
        
        // Link to Item if set
        WITH wl
        FOREACH (x IN CASE WHEN $itemId IS NOT NULL THEN [1] ELSE [] END |
          MERGE (i:Item {id: $itemId})
          MERGE (wl)-[:WASTED_ITEM]->(i)
        )
        
        // Link to Recipe if set
        WITH wl
        FOREACH (x IN CASE WHEN $recipeId IS NOT NULL THEN [1] ELSE [] END |
          MERGE (r:Recipe {id: $recipeId})
          MERGE (wl)-[:WASTED_RECIPE]->(r)
        )
        
        // Link to User who reported it if set
        WITH wl
        FOREACH (x IN CASE WHEN $recordedBy IS NOT NULL THEN [1] ELSE [] END |
          MERGE (u:User {id: $recordedBy})
          MERGE (u)-[:REPORTED]->(wl)
        )
        `,
        {
          id,
          properties,
          organizationId,
          itemId,
          recipeId,
          recordedBy,
        },
      );
    }
  }
}
