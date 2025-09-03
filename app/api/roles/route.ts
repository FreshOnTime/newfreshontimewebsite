import { NextRequest } from "next/server";
import { roleService } from "@/lib/services/roleService";
import { sendSuccess, sendInternalError, sendCreated, sendBadRequest } from "@/lib/utils/apiResponses";

// GET - Get all roles
export async function GET() {
  try {
    const roles = await roleService.getAllRoles();
    return sendSuccess("Roles retrieved successfully", roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return sendInternalError("Failed to fetch roles");
  }
}

// POST - Create a new role
export async function POST(req: NextRequest) {
  try {
    const roleData = await req.json();
    
    // Basic validation
    if (!roleData.name) {
      return sendBadRequest("Role name is required");
    }

    const role = await roleService.createRole(roleData);
    return sendCreated("Role created successfully", role);
  } catch (error) {
    console.error("Error creating role:", error);
    if (error instanceof Error && error.message.includes("already exists")) {
      return sendBadRequest(error.message);
    }
    return sendInternalError("Failed to create role");
  }
}
