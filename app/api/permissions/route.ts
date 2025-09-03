import { NextRequest } from "next/server";
import { permissionService } from "@/lib/services/permissionService";
import { sendSuccess, sendInternalError, sendCreated, sendBadRequest } from "@/lib/utils/apiResponses";

// GET - Get all permissions
export async function GET() {
  try {
    const permissions = await permissionService.getAllPermissions();
    return sendSuccess("Permissions retrieved successfully", permissions);
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return sendInternalError("Failed to fetch permissions");
  }
}

// POST - Create a new permission
export async function POST(req: NextRequest) {
  try {
    const permissionData = await req.json();
    
    // Basic validation
    if (!permissionData.resource || !permissionData.operation || !permissionData.description) {
      return sendBadRequest("Resource, operation, and description are required");
    }

    const permission = await permissionService.createPermission(permissionData);
    return sendCreated("Permission created successfully", permission);
  } catch (error) {
    console.error("Error creating permission:", error);
    if (error instanceof Error && error.message.includes("already exists")) {
      return sendBadRequest(error.message);
    }
    return sendInternalError("Failed to create permission");
  }
}
