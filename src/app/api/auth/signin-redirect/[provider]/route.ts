import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const publicUrl = process.env.NEXTAUTH_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const internalUrl = `http://localhost:${process.env.PORT || 3000}`;
  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") || "/dashboard";

  // Get CSRF token server-side (use internal URL to avoid SSL issues)
  const csrfRes = await fetch(`${internalUrl}/api/auth/csrf`, {
    headers: { cookie: (await cookies()).toString() },
  });
  const { csrfToken } = await csrfRes.json();

  // Forward the set-cookie from the csrf response
  const setCookie = csrfRes.headers.get("set-cookie");

  // Build the form HTML that auto-submits (use public URL for browser)
  const html = `
    <!DOCTYPE html>
    <html>
      <body>
        <form id="f" method="POST" action="${publicUrl}/api/auth/signin/${provider}">
          <input type="hidden" name="csrfToken" value="${csrfToken}" />
          <input type="hidden" name="callbackUrl" value="${callbackUrl}" />
        </form>
        <script>document.getElementById('f').submit();</script>
      </body>
    </html>
  `;

  const response = new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });

  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
