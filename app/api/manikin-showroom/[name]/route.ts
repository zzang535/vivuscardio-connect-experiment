import { NextRequest, NextResponse } from "next/server";

import { redis } from "@/lib/server/redis";
import type { ShowroomRecord, StoredObjectData } from "@/lib/manikin-showroom/types";

const KEY_PREFIX = "manikin_showroom";

const toKey = (name: string) => `${KEY_PREFIX}:${encodeURIComponent(name.toLowerCase())}`;

const normalizeName = (value: string | undefined): string => {
  try {
    return decodeURIComponent(value ?? "").trim();
  } catch {
    return (value ?? "").trim();
  }
};

const createEmptyRecord = (name: string): ShowroomRecord => {
  const timestamp = new Date().toISOString();
  return {
    name,
    manikinShowroomObjects: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const isValidStoredObjects = (value: unknown): value is StoredObjectData[] => {
  if (!Array.isArray(value)) return false;
  return value.every((item) =>
    typeof item === "object" &&
    item !== null &&
    typeof (item as StoredObjectData).id === "string" &&
    Array.isArray((item as StoredObjectData).position) &&
    Array.isArray((item as StoredObjectData).rotation) &&
    Array.isArray((item as StoredObjectData).scale)
  );
};

type RouteContext = { params: Promise<{ name: string }> };

export const GET = async (_req: NextRequest, context: RouteContext) => {
  const { name: rawName } = await context.params;
  const name = normalizeName(rawName);

  if (!name) {
    return NextResponse.json({ error: "name parameter is required" }, { status: 400 });
  }

  try {
    const key = toKey(name);
    let record = await redis.get<ShowroomRecord>(key);

    if (!record) {
      record = createEmptyRecord(name);
      await redis.set(key, record);
    }

    return NextResponse.json(record, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch showroom record", error);
    return NextResponse.json({ error: "Failed to fetch showroom record" }, { status: 500 });
  }
};

export const PUT = async (req: NextRequest, context: RouteContext) => {
  const { name: rawName } = await context.params;
  const name = normalizeName(rawName);

  if (!name) {
    return NextResponse.json({ error: "name parameter is required" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    console.error("Invalid JSON payload", error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const objects = (payload as { manikinShowroomObjects?: unknown })?.manikinShowroomObjects;

  if (objects !== null && !isValidStoredObjects(objects)) {
    return NextResponse.json({ error: "manikinShowroomObjects must be an array of saved objects or null" }, { status: 400 });
  }

  try {
    const key = toKey(name);
    const previous = await redis.get<ShowroomRecord>(key);
    const timestamp = new Date().toISOString();

    const record: ShowroomRecord = {
      name,
      manikinShowroomObjects: (objects as StoredObjectData[] | null) ?? null,
      createdAt: previous?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    await redis.set(key, record);

    return NextResponse.json(record, { status: 200 });
  } catch (error) {
    console.error("Failed to update showroom record", error);
    return NextResponse.json({ error: "Failed to update showroom record" }, { status: 500 });
  }
};
