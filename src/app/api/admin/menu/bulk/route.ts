import { NextRequest, NextResponse } from "next/server";
import { auth, firestore } from "../../../../../lib/firebaseAdmin";
import { menuItemSchema } from "../../../../../lib/firestoreModels";
import { handleAPIError, apiErrors } from "../../../../../lib/utils/apiErrors";
import { z } from "zod";
import {
  AuthUser,
  BulkOperationResult,
  VerifiedItem,
} from "../../../../../lib/types/firebase";

export const dynamic = "force-dynamic";

// Bulk operation schema
const bulkOperationSchema = z.object({
  operation: z.enum(["update", "delete"]),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        data: z.object({}).optional(), // For updates only
      }),
    )
    .min(1)
    .max(1000),
});

async function isAdmin(userId: string) {
  const userSnap = await firestore.collection("users").doc(userId).get();
  const userData = userSnap.data();
  return userSnap.exists && userData ? userData.role === "admin" : false;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw apiErrors.unauthorized();
    }

    const idToken = authHeader.split(" ")[1];
    if (!idToken) {
      throw apiErrors.unauthorized("Invalid authentication token");
    }
    const decoded = (await auth.verifyIdToken(idToken)) as AuthUser;
    const userId = decoded.uid;

    if (!(await isAdmin(userId))) {
      throw apiErrors.forbidden("Only admins can perform bulk operations");
    }

    const data = await req.json();
    const { operation, items } = bulkOperationSchema.parse(data);

    // Validate update data if operation is update
    if (operation === "update") {
      const invalidItems = items.filter((item) => !item.data);
      if (invalidItems.length > 0) {
        throw apiErrors.badRequest(
          "Data field is required for update operations",
          { invalidItems: invalidItems.map((item) => item.id) },
        );
      }
    }

    const results: BulkOperationResult = {
      success: [],
      failed: [],
    };

    // Process items in batches of 500 (Firestore limit)
    for (let i = 0; i < items.length; i += 500) {
      const batch = firestore.batch();
      const batchItems = items.slice(i, i + 500);

      // First, verify all documents exist and validate update data
      const verificationPromises = batchItems.map(async (item) => {
        try {
          const docRef = firestore.collection("menuItems").doc(item.id);
          const docSnap = await docRef.get();

          if (!docSnap.exists) {
            throw apiErrors.notFound(`Menu item ${item.id} not found`);
          }

          if (operation === "update" && item.data) {
            // Validate update data
            const validatedData = menuItemSchema.partial().parse(item.data);
            return {
              docRef,
              docSnap,
              validatedData,
              id: item.id,
            };
          }

          return {
            docRef,
            docSnap,
            id: item.id,
          };
        } catch {
          results.failed.push({
            id: item.id,
            error: "Unknown error",
          });
          return null;
        }
      });

      const verifiedItems = (await Promise.all(verificationPromises)).filter(
        Boolean,
      ) as VerifiedItem[];

      // Apply batch operations for verified items
      for (const item of verifiedItems) {
        if (!item) continue;

        try {
          if (operation === "delete") {
            batch.delete(item.docRef);
          } else if (operation === "update" && "validatedData" in item) {
            batch.update(item.docRef, {
              ...item.validatedData,
              updatedAt: new Date(),
              updatedBy: userId,
            });
          }
          if ("validatedData" in item) {
            results.success.push({
              id: item.id,
              data: item.validatedData,
            });
          } else {
            results.success.push({
              id: item.id,
            });
          }
        } catch {
          results.failed.push({
            id: item.id,
            error: "Unknown error",
          });
        }
      }

      // Commit the batch if there are any operations
      if (verifiedItems.length > 0) {
        try {
          await batch.commit();
        } catch {
          // Move all items in this batch to failed
          verifiedItems.forEach((item: VerifiedItem) => {
            if (!item) return;
            results.success = results.success.filter((s) => s.id !== item.id);
            results.failed.push({
              id: item.id,
              error: "Batch commit failed",
            });
          });
        }
      }
    }

    // If all operations failed, return an error
    if (results.success.length === 0 && results.failed.length > 0) {
      throw apiErrors.badRequest("All operations failed", {
        failed: results.failed,
      });
    }

    return NextResponse.json({
      message: `Bulk ${operation} completed`,
      results: {
        successCount: results.success.length,
        failureCount: results.failed.length,
        successful: results.success,
        failed: results.failed,
      },
    });
  } catch (err: unknown) {
    return handleAPIError(err);
  }
}