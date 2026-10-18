"use server";

import {
  searchMedicinesService,
  matchPrescriptionMedicinesService,
  MedicineSearchResult,
  PharmacyPrescriptionMatch,
  PrescriptionMatchItem,
} from "@/lib/search";
import { Coordinates } from "@/lib/location";

export interface SearchMedicinesActionInput {
  query?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  onlyInStock?: boolean;
  sortBy?: "distance" | "price" | "name";
  page?: number;
  limit?: number;
}

export async function searchMedicinesAction(
  input: SearchMedicinesActionInput
): Promise<{ success: boolean; items: MedicineSearchResult[]; total: number; error?: string }> {
  try {
    let userCoords: Coordinates | undefined = undefined;
    if (
      typeof input.latitude === "number" &&
      typeof input.longitude === "number" &&
      !isNaN(input.latitude) &&
      !isNaN(input.longitude)
    ) {
      userCoords = { latitude: input.latitude, longitude: input.longitude };
    }

    const result = await searchMedicinesService({
      query: input.query,
      userCoords,
      city: input.city,
      onlyInStock: input.onlyInStock,
      sortBy: input.sortBy,
      page: input.page,
      limit: input.limit,
    });

    return {
      success: true,
      items: result.items,
      total: result.total,
    };
  } catch (err: any) {
    console.error("searchMedicinesAction error:", err);
    return {
      success: false,
      items: [],
      total: 0,
      error: "خطا در برقراری ارتباط با سرور هنگام جستجو",
    };
  }
}

export async function matchPrescriptionItemsAction(input: {
  medicines: PrescriptionMatchItem[];
  latitude?: number;
  longitude?: number;
}): Promise<{ success: boolean; matches: PharmacyPrescriptionMatch[]; error?: string }> {
  try {
    if (!input.medicines || input.medicines.length === 0) {
      return { success: false, matches: [], error: "لیست داروهای درخواستی خالی است" };
    }

    let userCoords: Coordinates | undefined = undefined;
    if (
      typeof input.latitude === "number" &&
      typeof input.longitude === "number" &&
      !isNaN(input.latitude) &&
      !isNaN(input.longitude)
    ) {
      userCoords = { latitude: input.latitude, longitude: input.longitude };
    }

    const matches = await matchPrescriptionMedicinesService(input.medicines, userCoords);

    return {
      success: true,
      matches,
    };
  } catch (err: any) {
    console.error("matchPrescriptionItemsAction error:", err);
    return {
      success: false,
      matches: [],
      error: "خطا در انطباق انبار با لیست داروهای نسخه",
    };
  }
}
