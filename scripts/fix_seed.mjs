import fs from 'fs';
import crypto from 'crypto';

const seedPath = '/home/conar/code/sous.tools/supabase/seed.sql';
let seedSql = fs.readFileSync(seedPath, 'utf8');

// Function to recursively add UUIDs
function addUUIDs(block) {
    if (!block.id) {
        block.id = crypto.randomUUID();
    }
    
    if (block.type === 'CategoryHeaderBlock') {
        block.className = block.className ? block.className + ' text-ice' : 'text-ice';
    } else if (block.type === 'MenuListBlock' || block.type === 'PosItemBlock') {
        block.className = block.className ? block.className + ' st-menu-glow-text' : 'st-menu-glow-text';
    }

    if (block.blocks && Array.isArray(block.blocks)) {
        block.blocks.forEach(addUUIDs);
    }
    if (block.cells && Array.isArray(block.cells)) {
        block.cells.forEach(addUUIDs);
    }
    if (block.slides && Array.isArray(block.slides)) {
        // Not a block list, but maybe layout slides?
        block.slides.forEach(slide => {
            if (slide.type === 'COLUMN_LAYOUT' && slide.columns) {
                slide.columns.forEach(col => {
                    if (col.blocks) {
                        col.blocks.forEach(addUUIDs);
                    }
                });
            } else if (slide.blocks) {
                 slide.blocks.forEach(addUUIDs);
            }
        });
    }
}

// Extract JSON for deck 1 and 2
const deck1Regex = /\('d0000000-0000-0000-0000-000000000011'.*?\$\$\s*(.*?)\$\$::jsonb/s;
const deck2Regex = /\('d0000000-0000-0000-0000-000000000012'.*?\$\$\s*(.*?)\$\$::jsonb/s;

let d1Match = seedSql.match(deck1Regex);
let d2Match = seedSql.match(deck2Regex);

let d1 = JSON.parse(d1Match[1]);
let d2 = JSON.parse(d2Match[1]);

// REBUILD Deck 1 (Mornings) to strict nesting specs
// Left: Breakfast, Pastries, Soup/Bread Callout
// Right: Salads, Customizing Callout, Frozen Dinners
d1.slides = [
  {
    "type": "COLUMN_LAYOUT",
    "columns": [
      {
        "blocks": [
          {
            "type": "ColumnBlock",
            "className": "h-full w-full p-10 flex flex-col",
            "blocks": [
              {
                "type": "RowBlock",
                "className": "flex-1 grid grid-cols-2 gap-10 h-full",
                "blocks": [
                  {
                    "type": "ColumnBlock",
                    "className": "flex flex-col h-full justify-between gap-4",
                    "blocks": [
                      {"type": "CategoryHeaderBlock", "title": "Breakfast", "subtitle": "Available all day", "panelStyle": "none"},
                      {"type": "MenuListBlock", "itemIds": ["f0000000-0000-0000-0000-000000000001","f0000000-0000-0000-0000-000000000002","f0000000-0000-0000-0000-000000000003","f0000000-0000-0000-0000-000000000004"], "panelStyle": "none"},
                      {"type": "CategoryHeaderBlock", "title": "Fresh Scratch Pastries", "subtitle": "Baked in-house daily", "panelStyle": "none"},
                      {"type": "MenuListBlock", "itemIds": ["f0000000-0000-0000-0000-000000000005","f0000000-0000-0000-0000-000000000006","f0000000-0000-0000-0000-000000000030","f0000000-0000-0000-0000-000000000031","f0000000-0000-0000-0000-000000000032"], "hideDescriptions": true, "panelStyle": "none"},
                      {
                        "type": "RowBlock",
                        "className": "gap-4",
                        "blocks": [
                          {
                            "type": "ColumnBlock",
                            "className": "flex-1",
                            "blocks": [
                              {"type": "CategoryHeaderBlock", "title": "Soup of the Week", "subtitle": "While supplies last", "panelStyle": "none"},
                              {"type": "MenuListBlock", "itemIds": ["f0000000-0000-0000-0000-000000000007"], "panelStyle": "none", "priceDisplay": {"Cup": "$4.00", "Bowl": "$6.00"}}
                            ]
                          },
                          {
                            "type": "CalloutBlock",
                            "iconName": "Baguette",
                            "message": "All bread made from scratch in-house daily",
                            "panelStyle": "glass",
                            "className": "w-1/3 pt-8 st-menu-glow-border"
                          }
                        ]
                      }
                    ]
                  },
                  {
                    "type": "ColumnBlock",
                    "className": "flex flex-col h-full justify-between gap-4",
                    "blocks": [
                      {"type": "CategoryHeaderBlock", "title": "Fresh Salads", "subtitle": "Dressings: house white wine vinaigrette, balsamic vinaigrette, house ranch, caesar, honey mustard", "panelStyle": "none"},
                      {"type": "MenuListBlock", "itemIds": ["f0000000-0000-0000-0000-000000000008","f0000000-0000-0000-0000-000000000009","f0000000-0000-0000-0000-000000000010","f0000000-0000-0000-0000-000000000011","f0000000-0000-0000-0000-000000000012"], "panelStyle": "none"},
                      {"type": "CalloutBlock", "iconName": "Sparkles", "message": "CUSTOMIZING SOMETHING? SIDES & OTHER EXTRAS AVAILABLE IN THE ADDONS MENU ON SCREEN 2.", "panelStyle": "glass", "className": "st-menu-glow-border"},
                      {"type": "CategoryHeaderBlock", "title": "Frozen Take Home Dinners", "subtitle": "Oven ready meals", "badge": "❄️ HEAT & SERVE", "animateBadge": true, "panelStyle": "none"},
                      {
                        "type": "GridBlock",
                        "columns": 2,
                        "rows": 1,
                        "panelStyle": "glass",
                        "cells": [
                          {
                            "type": "NestedItemBlock",
                            "basePosItemId": "f0000000-0000-0000-0000-000000000100",
                            "panelStyle": "none",
                            "upgradeItems": [
                              {"posItemId": "f0000000-0000-0000-0000-000000000101", "overrideDescription": "Sold by the dozen"},
                              {"posItemId": "f0000000-0000-0000-0000-000000000102", "overrideDescription": "SOLD OUT"},
                              {"posItemId": "f0000000-0000-0000-0000-000000000103"},
                              {"posItemId": "f0000000-0000-0000-0000-000000000104"},
                              {"posItemId": "f0000000-0000-0000-0000-000000000105"},
                              {"posItemId": "f0000000-0000-0000-0000-000000000106"}
                            ]
                          },
                          {
                            "type": "NestedItemBlock",
                            "basePosItemId": "f0000000-0000-0000-0000-000000000110",
                            "panelStyle": "none",
                            "upgradeItems": [
                              {"posItemId": "f0000000-0000-0000-0000-000000000107"},
                              {"posItemId": "f0000000-0000-0000-0000-000000000108", "overrideDescription": "Stuffed Cabbage"},
                              {"posItemId": "f0000000-0000-0000-0000-000000000109"}
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// REBUILD Deck 2 (Artisan) to strict nesting specs
// Left: Carousel (Tomato Bisque), Cafe Specialties, MenuList, NestedItem
// Right: ExplodedItemBlock, Carousel (Turkey Bacon Ranch)
d2.slides = [
  {
    "type": "COLUMN_LAYOUT",
    "columns": [
      {
        "blocks": [
          {
            "type": "ColumnBlock",
            "className": "h-full w-full p-10 flex flex-col",
            "blocks": [
              {
                "type": "RowBlock",
                "className": "flex-1 grid grid-cols-2 gap-10 h-full",
                "blocks": [
                  {
                    "type": "ColumnBlock",
                    "className": "flex flex-col gap-4 h-full",
                    "blocks": [
                      {
                        "type": "MediaCarouselBlock",
                        "slides": [{"imageUrl": "https://images.unsplash.com/photo-1547592166-23ac45744acd", "captionTitle": "Scratch Tomato Bisque", "captionSubtitle": "Featured Item", "captionPrice": "$8.00"}]
                      },
                      {"type": "CategoryHeaderBlock", "title": "Café Specialties", "panelStyle": "none"},
                      {"type": "MenuListBlock", "itemIds": ["f0000000-0000-0000-0000-000000000013","f0000000-0000-0000-0000-000000000014","f0000000-0000-0000-0000-000000000015","f0000000-0000-0000-0000-000000000016","f0000000-0000-0000-0000-000000000017","f0000000-0000-0000-0000-000000000018"], "panelStyle": "none"},
                      {
                        "type": "NestedItemBlock",
                        "basePosItemId": "f0000000-0000-0000-0000-000000000019",
                        "panelStyle": "none",
                        "upgradeItems": [
                          {"posItemId": "f0000000-0000-0000-0000-000000000020", "overrideDescription": "Adds Fried Egg Crown"},
                          {"posItemId": "f0000000-0000-0000-0000-000000000021", "overrideDescription": "Swaps Ham for Veggies"}
                        ]
                      }
                    ]
                  },
                  {
                    "type": "ColumnBlock",
                    "className": "flex flex-col gap-5 h-full",
                    "blocks": [
                      {
                        "type": "ExplodedItemBlock",
                        "title": "Build Your Own",
                        "basePrice": "$10.00",
                        "panelStyle": "glass",
                        "blocks": [
                          {
                            "type": "TimelineBlock",
                            "steps": [
                              {"id": crypto.randomUUID(), "text": "Step 1: Vessel", "subtitle": "All bread made from scratch daily in house"},
                              {"id": crypto.randomUUID(), "text": "Step 2: Protein", "subtitle": "Includes one protein from the Addons grid below. Prices vary based on selection."},
                              {"id": crypto.randomUUID(), "text": "Step 3: Free Toppings & Spreads", "subtitle": "Toppings: Lettuce, Fresh Tomato, Raw Onions, Pickles.\nSpreads: Choose one free spread from the Addons grid below."}
                            ]
                          },
                          {
                            "type": "GridBlock",
                            "columns": 2,
                            "rows": 2,
                            "cells": [
                              {"type": "ModifierGroupBlock", "modifierGroupId": "e0000000-0000-0000-0000-000000000010"},
                              {"type": "ModifierGroupBlock", "modifierGroupId": "e0000000-0000-0000-0000-000000000011"},
                              {"type": "ModifierGroupBlock", "modifierGroupId": "e0000000-0000-0000-0000-000000000012"},
                              {"type": "ModifierGroupBlock", "modifierGroupId": "e0000000-0000-0000-0000-000000000013"}
                            ]
                          }
                        ]
                      },
                      {
                        "type": "MediaCarouselBlock",
                        "slides": [{"imageUrl": "https://images.unsplash.com/photo-1619860860774-1e2e17343432?auto=format&fit=crop&w=1200&q=80", "captionTitle": "\"The Turkey Bacon Ranch\"", "captionSubtitle": "Popular BYO Combos"}]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

addUUIDs(d1);
addUUIDs(d2);

seedSql = seedSql.replace(deck1Regex, () => `('d0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000000', 'DTown Screen 1 - Mornings', 'dtown-mornings', $$ ${JSON.stringify(d1)} $$::jsonb`);
seedSql = seedSql.replace(deck2Regex, () => `('d0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000000', 'DTown Screen 2 - Artisan', 'dtown-artisan', $$ ${JSON.stringify(d2)} $$::jsonb`);

fs.writeFileSync(seedPath, seedSql);
console.log('Seed updated');
