import { prisma } from "@/lib/db";
import { calculateHaversineDistanceKm, Coordinates, validateCoordinates } from "@/lib/location";

export type InventoryFreshnessStatus = "AVAILABLE" | "UNAVAILABLE" | "STALE" | "UNKNOWN";

export interface MedicineSearchResult {
  inventoryId: string;
  medicineId: string;
  medicineNameFa: string;
  medicineNameEn?: string;
  genericName?: string;
  requiresRecipe: boolean;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyCity: string;
  pharmacyPhone: string;
  pharmacyIsVerified: boolean;
  priceToman: number;
  stock: number;
  freshnessStatus: InventoryFreshnessStatus;
  lastInventoryUpdate: string;
  distanceKm?: number;
}

export interface PrescriptionMatchItem {
  medicineName: string; // Persian name, English name or generic
}

export interface PharmacyPrescriptionMatch {
  pharmacyId: string;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyPhone: string;
  distanceKm?: number;
  matchedItemsCount: number;
  missingItemsCount: number;
  staleItemsCount: number;
  isFullMatch: boolean;
  matchedDetails: {
    medicineName: string;
    medicineId?: string;
    priceToman?: number;
    stock?: number;
    freshnessStatus: InventoryFreshnessStatus;
  }[];
}

const FRESHNESS_THRESHOLD_DAYS = 7;

export function calculateFreshnessStatus(
  updatedAt: Date,
  stock: number,
  isAvailable: boolean
): InventoryFreshnessStatus {
  if (!isAvailable || stock <= 0) {
    return "UNAVAILABLE";
  }

  const now = new Date();
  const diffDays = (now.getTime() - new Date(updatedAt).getTime()) / (1000 * 3600 * 24);

  if (diffDays > FRESHNESS_THRESHOLD_DAYS) {
    return "STALE";
  }

  return "AVAILABLE";
}

/**
 * Normalizes Persian query text for search matching.
 */
export function normalizePersianText(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[ك]/g, "ک")
    .replace(/[ي]/g, "ی")
    .replace(/[آأإ]/g, "ا");
}

export async function searchMedicinesService(options: {
  query?: string;
  userCoords?: Coordinates;
  city?: string;
  onlyInStock?: boolean;
  sortBy?: "distance" | "price" | "name";
  page?: number;
  limit?: number;
}): Promise<{ items: MedicineSearchResult[]; total: number }> {
  const queryText = normalizePersianText(options.query || "");
  const page = options.page || 1;
  const limit = options.limit || 20;

  let userCoordsValid = false;
  if (options.userCoords && validateCoordinates(options.userCoords.latitude, options.userCoords.longitude)) {
    userCoordsValid = true;
  }

  // Enforce ONLY approved/verified pharmacies in public discovery
  // Use mode: 'insensitive' for case-insensitive PostgreSQL matching
  const inventories = await prisma.pharmacyInventory.findMany({
    where: {
      pharmacy: {
        isVerified: true,
        ...(options.city ? { city: { equals: options.city } } : {}),
      },
      medicine: queryText
        ? {
            OR: [
              { nameFa: { contains: queryText } },
              { nameEn: { contains: queryText, mode: "insensitive" } },
              { genericName: { contains: queryText, mode: "insensitive" } },
            ],
          }
        : undefined,
    },
    include: {
      medicine: true,
      pharmacy: true,
    },
  });

  let results: MedicineSearchResult[] = inventories
    .filter((inv) => inv.medicine !== null && inv.pharmacy.isVerified)
    .map((inv) => {
      const distance = userCoordsValid
        ? calculateHaversineDistanceKm(options.userCoords!, {
            latitude: inv.pharmacy.latitude,
            longitude: inv.pharmacy.longitude,
          })
        : undefined;

      const freshness = calculateFreshnessStatus(inv.updatedAt, inv.stock, inv.isAvailable);

      return {
        inventoryId: inv.id,
        medicineId: inv.medicine!.id,
        medicineNameFa: inv.medicine!.nameFa,
        medicineNameEn: inv.medicine!.nameEn || undefined,
        genericName: inv.medicine!.genericName || undefined,
        requiresRecipe: inv.medicine!.requiresRecipe,
        pharmacyId: inv.pharmacy.id,
        pharmacyName: inv.pharmacy.name,
        pharmacyAddress: inv.pharmacy.address,
        pharmacyCity: inv.pharmacy.city,
        pharmacyPhone: inv.pharmacy.phone,
        pharmacyIsVerified: inv.pharmacy.isVerified,
        priceToman: inv.priceToman,
        stock: inv.stock,
        freshnessStatus: freshness,
        lastInventoryUpdate: inv.updatedAt.toISOString(),
        distanceKm: distance,
      };
    });

  if (options.onlyInStock) {
    results = results.filter((r) => r.freshnessStatus === "AVAILABLE");
  }

  // Sorting logic
  if (options.sortBy === "distance" && userCoordsValid) {
    results.sort((a, b) => (a.distanceKm || Infinity) - (b.distanceKm || Infinity));
  } else if (options.sortBy === "price") {
    results.sort((a, b) => a.priceToman - b.priceToman);
  } else {
    results.sort((a, b) => a.medicineNameFa.localeCompare(b.medicineNameFa, "fa"));
  }

  const total = results.length;
  const paginated = results.slice((page - 1) * limit, page * limit);

  return { items: paginated, total };
}

/**
 * Prescription-Oriented Inventory Matching Engine
 * Matches multiple requested medicine items against verified pharmacy inventories.
 */
export async function matchPrescriptionMedicinesService(
  requestedMedicines: PrescriptionMatchItem[],
  userCoords?: Coordinates
): Promise<PharmacyPrescriptionMatch[]> {
  if (!requestedMedicines || requestedMedicines.length === 0) {
    return [];
  }

  const userCoordsValid =
    userCoords && validateCoordinates(userCoords.latitude, userCoords.longitude);

  const verifiedPharmacies = await prisma.pharmacy.findMany({
    where: { isVerified: true },
    include: {
      inventory: {
        include: { medicine: true },
      },
    },
  });

  const matches: PharmacyPrescriptionMatch[] = [];

  for (const pharmacy of verifiedPharmacies) {
    let matchedCount = 0;
    let missingCount = 0;
    let staleCount = 0;

    const details = [];

    for (const reqItem of requestedMedicines) {
      const normalizedReqName = normalizePersianText(reqItem.medicineName);

      const foundInv = pharmacy.inventory.find((inv) => {
        if (!inv.medicine) return false;
        return (
          normalizePersianText(inv.medicine.nameFa).includes(normalizedReqName) ||
          (inv.medicine.nameEn &&
            normalizePersianText(inv.medicine.nameEn).includes(normalizedReqName)) ||
          (inv.medicine.genericName &&
            normalizePersianText(inv.medicine.genericName).includes(normalizedReqName))
        );
      });

      if (foundInv && foundInv.medicine) {
        const freshness = calculateFreshnessStatus(
          foundInv.updatedAt,
          foundInv.stock,
          foundInv.isAvailable
        );

        if (freshness === "AVAILABLE") {
          matchedCount++;
        } else if (freshness === "STALE") {
          staleCount++;
        } else {
          missingCount++;
        }

        details.push({
          medicineName: reqItem.medicineName,
          medicineId: foundInv.medicine.id,
          priceToman: foundInv.priceToman,
          stock: foundInv.stock,
          freshnessStatus: freshness,
        });
      } else {
        missingCount++;
        details.push({
          medicineName: reqItem.medicineName,
          freshnessStatus: "UNAVAILABLE" as InventoryFreshnessStatus,
        });
      }
    }

    const distance = userCoordsValid
      ? calculateHaversineDistanceKm(userCoords!, {
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
        })
      : undefined;

    matches.push({
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.name,
      pharmacyAddress: pharmacy.address,
      pharmacyPhone: pharmacy.phone,
      distanceKm: distance,
      matchedItemsCount: matchedCount,
      missingItemsCount: missingCount,
      staleItemsCount: staleCount,
      isFullMatch: matchedCount === requestedMedicines.length,
      matchedDetails: details,
    });
  }

  // Sort full matches first, then by highest matched count, then by distance
  matches.sort((a, b) => {
    if (a.isFullMatch !== b.isFullMatch) {
      return a.isFullMatch ? -1 : 1;
    }
    if (a.matchedItemsCount !== b.matchedItemsCount) {
      return b.matchedItemsCount - a.matchedItemsCount;
    }
    if (userCoordsValid) {
      return (a.distanceKm || Infinity) - (b.distanceKm || Infinity);
    }
    return a.pharmacyName.localeCompare(b.pharmacyName, "fa");
  });

  return matches;
}
