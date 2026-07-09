import re

with open('visual-builder.tsx', 'r') as f:
    vb = f.read()

# 1. Remove handleRecipeUpdate
vb = re.sub(r'  const handleRecipeUpdate = \(.*?\}\;\n', '', vb, flags=re.DOTALL)

# 2. Fix 'any' types in remaining code
vb = vb.replace('(d: any)', '(d: { id: string; name: string; each_weight_g: number | null })')
vb = vb.replace('recipe: any,', 'recipe: Record<string, unknown>,')
vb = vb.replace('recipeIndex: number, field: string, value: any', 'recipeIndex: number, field: string, value: string | number | boolean')
vb = vb.replace('ingIndex: number,\n    field: string,\n    value: any,', 'ingIndex: number, field: string, value: string | number | boolean | null,')
vb = vb.replace('index: number, field: string, value: any', 'index: number, field: string, value: string | number | boolean | null')
vb = vb.replace('(newData.recipes as any)', '(newData.recipes as Record<string, unknown>[])')
vb = vb.replace('(newData as any)', '(newData as Record<string, unknown>)')
vb = vb.replace('(newData.items as any)', '(newData.items as Record<string, unknown>[])')
vb = vb.replace('targetRecipe.ingredients[ingIndex][field] = value;', 'if (targetRecipe.ingredients) (targetRecipe.ingredients as Record<string, unknown>[])[ingIndex][field] = value;')

# 3. Add handleCreateVendor since it's missing but passed to VendorSection
create_vendor_code = '''  const handleCreateVendor = async (name: string) => {
    try {
      const res = await fetch(
