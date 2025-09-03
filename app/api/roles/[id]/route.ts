import { NextRequest } from "next/server";
import { roleService } from "@/lib/services/roleService";
import { sendSuccess, sendInternalError, sendNotFound, sendBadRequest } from "@/lib/utils/apiResponses";

// GET - Get a single role
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const role = await roleService.getRoleById(id);
    
    if (!role) {
      return sendNotFound("Role not found");
    }
    
    return sendSuccess("Role retrieved successfully", role);
  } catch (error) {
    console.error("Error fetching role:", error);
    return sendInternalError("Failed to fetch role");
  }
}

// PUT - Update a role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const updateData = await request.json();
    
    const role = await roleService.updateRole(id, updateData);
    
    if (!role) {
      return sendNotFound("Role not found");
    }
    
    return sendSuccess("Role updated successfully", role);
  } catch (error) {
    console.error("Error updating role:", error);
    if (error instanceof Error && error.message.includes("already exists")) {
      return sendBadRequest(error.message);
    }
    return sendInternalError("Failed to update role");
  }
}

// DELETE - Delete a role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    await roleService.deleteRole(id);
    
    return sendSuccess("Role deleted successfully");
  } catch (error) {
    console.error("Error deleting role:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      return sendNotFound("Role not found");
    }
    return sendInternalError("Failed to delete role");
  }
}
