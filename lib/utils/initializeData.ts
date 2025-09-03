import { brandService } from "../services/brandService";
import { productCategoryService } from "../services/productCategoryService";
import { permissionService } from "../services/permissionService";
import { roleService } from "../services/roleService";

export async function initializeDefaultData() {
  try {
    console.log("Initializing default data...");

    // Initialize permissions first
    await permissionService.syncPermissions();
    console.log("✓ Permissions synchronized");

    // Create default brands
    const defaultBrands = [
      { code: "FP", name: "FreshPick", description: "FreshPick house brand" },
      { code: "DEL", name: "Del Monte", description: "Premium fruit brand" },
      { code: "KOG", name: "Kotmale", description: "Local dairy products" },
      { code: "ANK", name: "Anchor", description: "Dairy and food products" },
    ];

    for (const brandData of defaultBrands) {
      try {
        await brandService.createBrand(brandData);
        console.log(`✓ Created brand: ${brandData.name}`);
      } catch (error) {
        if (error instanceof Error && error.message.includes("already exists")) {
          console.log(`- Brand ${brandData.name} already exists`);
        } else {
          console.error(`✗ Error creating brand ${brandData.name}:`, error);
        }
      }
    }

    // Create default categories
    const defaultCategories = [
      { code: "FRU", description: "Fresh Fruits" },
      { code: "VEG", description: "Fresh Vegetables" },
      { code: "DAI", description: "Dairy Products" },
      { code: "MEA", description: "Meat & Poultry" },
      { code: "GRA", description: "Grains & Cereals" },
      { code: "BEV", description: "Beverages" },
      { code: "SNK", description: "Snacks" },
      { code: "BAK", description: "Bakery Items" },
    ];

    for (const categoryData of defaultCategories) {
      try {
        await productCategoryService.createCategory(categoryData);
        console.log(`✓ Created category: ${categoryData.description}`);
      } catch (error) {
        if (error instanceof Error && error.message.includes("already exists")) {
          console.log(`- Category ${categoryData.description} already exists`);
        } else {
          console.error(`✗ Error creating category ${categoryData.description}:`, error);
        }
      }
    }

    // Create default roles
    const defaultRoles = [
      {
        name: "admin",
        description: "Full system access",
        permissions: [] // Will be populated with all permissions
      },
      {
        name: "inventory_manager",
        description: "Manage products, brands, categories",
        permissions: [] // Will be populated with relevant permissions
      },
      {
        name: "content_creator",
        description: "Create and edit product content",
        permissions: [] // Will be populated with content permissions
      },
      {
        name: "customer",
        description: "Basic customer access",
        permissions: [] // Limited permissions
      }
    ];

    // Get all permissions for role assignment
    const allPermissions = await permissionService.getAllPermissions();
    const productPermissions = allPermissions.filter(p => 
      p.resource === 'products' || p.resource === 'brands' || p.resource === 'categories'
    );
    const contentPermissions = allPermissions.filter(p => 
      p.resource === 'products' || p.resource === 'storage'
    );

    for (const roleData of defaultRoles) {
      try {
        let permissions: string[] = [];

        switch (roleData.name) {
          case 'admin':
            permissions = allPermissions.map(p => p._id.toString());
            break;
          case 'inventory_manager':
            permissions = productPermissions.map(p => p._id.toString());
            break;
          case 'content_creator':
            permissions = contentPermissions.filter(p => 
              p.operation === 'create' || p.operation === 'update' || p.operation === 'read'
            ).map(p => p._id.toString());
            break;
          case 'customer':
            permissions = allPermissions.filter(p => p.operation === 'read').map(p => p._id.toString());
            break;
        }

        await roleService.createRole({
          ...roleData,
          permissions: permissions
        });
        console.log(`✓ Created role: ${roleData.name}`);
      } catch (error) {
        if (error instanceof Error && error.message.includes("already exists")) {
          console.log(`- Role ${roleData.name} already exists`);
        } else {
          console.error(`✗ Error creating role ${roleData.name}:`, error);
        }
      }
    }

    console.log("✓ Default data initialization completed!");
    return true;

  } catch (error) {
    console.error("✗ Error initializing default data:", error);
    return false;
  }
}

export async function checkSystemHealth() {
  try {
    console.log("Checking system health...");

    // Check database connections
    const brands = await brandService.getAllBrands();
    const categories = await productCategoryService.getAllCategories();
    const permissions = await permissionService.getAllPermissions();
    const roles = await roleService.getAllRoles();

    console.log(`✓ Database connected`);
    console.log(`  - Brands: ${brands.length}`);
    console.log(`  - Categories: ${categories.length}`);
    console.log(`  - Permissions: ${permissions.length}`);
    console.log(`  - Roles: ${roles.length}`);

    return {
      status: 'healthy',
      counts: {
        brands: brands.length,
        categories: categories.length,
        permissions: permissions.length,
        roles: roles.length
      }
    };

  } catch (error) {
    console.error("✗ System health check failed:", error);
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
