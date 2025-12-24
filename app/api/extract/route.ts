import { NextRequest, NextResponse } from "next/server";
import { extractLeaseData, calculateQualityScore } from "@/lib/mock-data";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldSimulateFailure(): boolean {
  return Math.random() < 0.05;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, filename } = body;

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: "Document ID is required" },
        { status: 400 }
      );
    }

    if (!filename) {
      return NextResponse.json(
        { success: false, error: "Filename is required" },
        { status: 400 }
      );
    }

    console.log(`Processing ${filename}...`);

    const processingDelay = 1000 + Math.random() * 1000;
    await delay(processingDelay);

    if (shouldSimulateFailure()) {
      console.log(`Processing ${filename}... Failed: Random extraction error`);
      return NextResponse.json(
        {
          success: false,
          error: "Extraction failed: Please upload again",
          documentId,
        },
        { status: 500 }
      );
    }

    const extractedData = extractLeaseData(filename);

    const qualityScore = calculateQualityScore(extractedData);

    console.log(
      `Processing ${filename}... Complete. Quality: ${qualityScore}%`
    );

    return NextResponse.json(
      {
        success: true,
        documentId,
        extractedData,
        qualityScore,
        processedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Extraction error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to extract data",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed. Use POST to extract data." },
    { status: 405 }
  );
}
