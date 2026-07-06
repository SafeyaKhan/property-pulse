import { NextResponse } from "next/server";
import connectDB from "@/config/database";
import Message from "@/models/Message";
import { getSessionUser } from "@/utils/getSessionUser";
import { revalidatePath } from "next/cache";

export async function POST(req) {
  try {
    await connectDB();

    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const data = await req.json();
    const { recipientId, propertyId, body } = data;

    if (!recipientId || !propertyId || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (sessionUser.userId === recipientId) {
      return NextResponse.json(
        { error: "Cannot message yourself" },
        { status: 400 },
      );
    }

    const newMessage = new Message({
      sender: sessionUser.userId,
      recipient: recipientId,
      property: propertyId,
      name: sessionUser.user?.name || sessionUser.user?.username || "Owner",
      email: sessionUser.user?.email || "",
      phone: sessionUser.user?.phone || "",
      body,
    });

    await newMessage.save();

    try {
      revalidatePath("/messages");
    } catch (e) {
      // ignore revalidation failures
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reply API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
