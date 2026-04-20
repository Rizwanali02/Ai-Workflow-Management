import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
const secretKey = "secret"; 
const key = new TextEncoder().encode(process.env.JWT_SECRET || secretKey);
export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(key);
}
export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}
export async function login(user: any) {
  const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); 
  const session = await encrypt({ user, expires });
  const cookieStore = await cookies();
  cookieStore.set("token", session, { expires, httpOnly: true });
}
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set("token", "", { expires: new Date(0) });
}
export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("token")?.value;
  if (!sessionToken) return null;
  try {
    const payload = await decrypt(sessionToken);
    if (payload.user && typeof payload.user.id === 'object' && payload.user.id !== null) {
    }
    return payload;
  } catch (error) {
    return null;
  }
}
export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("token")?.value;
  if (!session) return;
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: "token",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}
