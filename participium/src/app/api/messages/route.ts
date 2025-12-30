import { NextRequest, NextResponse } from "next/server";
import { getReportMessages } from "@/app/lib/controllers/message.controller";
import { prisma } from "@/prisma/db";

export async function GET(req: NextRequest) {
  try {
    const reportId = req.nextUrl.searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        { error: "Missing reportId parameter" },
        { status: 400 }
      );
    }

    let reportIdBigInt: bigint;
    try {
      reportIdBigInt = BigInt(reportId);
    } catch {
      return NextResponse.json(
        { error: "Invalid reportId format" },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: reportIdBigInt },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const result = await getReportMessages(reportIdBigInt);

    if (Array.isArray(result)) {
      const serialized = result.map((msg: any) => ({
        ...msg,
        id: msg.id?.toString?.() || msg.id,
        reportId: msg.reportId?.toString?.() || msg.reportId,
        authorId: msg.authorId?.toString?.() || msg.authorId,
      }));
      return NextResponse.json(serialized, { status: 200 });
    }

    return NextResponse.json([], { status: 200 });
  } catch (error) {
    console.error("[GET /api/messages] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
