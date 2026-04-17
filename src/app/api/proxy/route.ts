import { NextRequest, NextResponse } from "next/server";
import {
  buildProxyRequestInit,
  createErrorPayload,
  filterResponseHeaders,
  normalizeTargetUrl,
} from "@/lib/proxy";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json(
      createErrorPayload("invalid_request", "Missing url query parameter", 400),
      { status: 400 },
    );
  }

  try {
    const response = await fetch(normalizeTargetUrl(targetUrl), buildProxyRequestInit({ method: "GET" }));
    return createProxyResponse(response);
  } catch (error: unknown) {
    return createFailureResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      url: targetUrl,
      method,
      headers: customHeaders,
      body: requestBody,
    } = body as {
      url?: string;
      method?: string;
      headers?: HeadersInit;
      body?: string;
    };

    if (!targetUrl) {
      return NextResponse.json(createErrorPayload("invalid_request", "Missing url in body", 400), {
        status: 400,
      });
    }

    const response = await fetch(
      normalizeTargetUrl(targetUrl),
      buildProxyRequestInit({
        method,
        headers: customHeaders,
        body: requestBody,
      }),
    );

    return createProxyResponse(response);
  } catch (error: unknown) {
    return createFailureResponse(error);
  }
}

async function createProxyResponse(response: Response) {
  const payload = await response.text();
  const headers = filterResponseHeaders(response.headers);

  return new Response(payload, {
    status: response.status,
    headers: {
      "content-type": headers["content-type"] ?? "text/plain; charset=utf-8",
      ...headers,
    },
  });
}

function createFailureResponse(error: unknown) {
  if (error instanceof Error) {
    const isInputError =
      error.message === "A valid target URL is required" ||
      error.message === "Only http(s) URLs are supported" ||
      error.message === "Unsupported HTTP method";
    const status = isInputError ? 400 : 502;
    const errorCode = isInputError ? "invalid_request" : "proxy_request_failed";

    return NextResponse.json(createErrorPayload(errorCode, error.message, status), { status });
  }

  return NextResponse.json(
    createErrorPayload("internal_error", "Unexpected proxy failure", 500),
    { status: 500 },
  );
}
