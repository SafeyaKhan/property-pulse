"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import markMessageAsRead from "@/app/actions/markMessageAsRead";
import deleteMessage from "@/app/actions/deleteMessage";
import { useGlobalContext } from "@/context/GlobalContext";

const MessageCard = ({ message }) => {
  const [isRead, setIsRead] = useState(!!message.read);
  const [isDeleted, setIsDeleted] = useState(false);

  const { setUnreadCount } = useGlobalContext();
  const [isReplying, setIsReplying] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleReadClick = async () => {
    const read = await markMessageAsRead(message._id);
    setIsRead(read);
    setUnreadCount((prevCount) => (read ? prevCount - 1 : prevCount + 1));
    toast.success(`Marked as ${read ? "read" : "new"}`);
  };

  const handleDeleteClick = async () => {
    await deleteMessage(message._id);
    setIsDeleted(true);
    setUnreadCount((prevCount) => (isRead ? prevCount : prevCount - 1));
    toast.success("Message Deleted");
  };

  if (isDeleted) {
    return <p>Deleted message</p>;
  }

  return (
    <div className="relative bg-white p-4 rounded-md shadow-md border border-gray-200">
      {!isRead && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md">
          New
        </div>
      )}

      <h2 className="text-xl mb-4">
        <span className="font-bold">Property Inquiry:</span>{" "}
        {message.property?.name || "Property (Deleted)"}
      </h2>

      <p className="text-gray-700">{message.body}</p>

      <ul className="mt-4">
        <li>
          <strong>Reply Email:</strong>{" "}
          <a href={`mailto:${message.email}`} className="text-blue-500">
            {message.email}
          </a>
        </li>
        <li>
          <strong>Reply Phone:</strong>{" "}
          <a href={`tel:${message.phone}`} className="text-blue-500">
            {message.phone}
          </a>
        </li>
        <li>
          <strong>Received:</strong>{" "}
          {new Date(message.createdAt).toLocaleString()}
        </li>
      </ul>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleReadClick}
          className={`mr-2 ${isRead ? "bg-gray-300" : "bg-blue-500 text-white"} py-1 px-3 rounded-md`}
        >
          {isRead ? "Mark As New" : "Mark As Read"}
        </button>

        <button
          onClick={handleDeleteClick}
          className="mr-2 bg-red-500 text-white py-1 px-3 rounded-md"
        >
          Delete
        </button>

        <button
          onClick={() => setIsReplying((s) => !s)}
          className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md inline-block"
        >
          {isReplying ? "Cancel" : "Reply"}
        </button>
      </div>
      {isReplying && (
        <div className="mt-3">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            rows={4}
            className="w-full border rounded-md p-2"
            placeholder={`Write a reply to ${message.name || message.sender?.username || message.email}`}
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={async () => {
                if (!replyBody.trim()) {
                  toast.error("Enter a reply message");
                  return;
                }
                setSending(true);
                try {
                  const recipientId =
                    message.sender?._id || message.sender?.id || message.sender;
                  const propertyId =
                    message.property?._id ||
                    message.property?.id ||
                    message.property;
                  const res = await fetch("/api/messages/reply", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      recipientId,
                      propertyId,
                      body: replyBody,
                    }),
                  });
                  const json = await res.json();
                  if (!res.ok)
                    throw new Error(json?.error || "Failed to send reply");
                  toast.success("Reply sent");
                  setIsReplying(false);
                  setReplyBody("");
                } catch (err) {
                  console.error(err);
                  toast.error(err?.message || "Failed to send reply");
                } finally {
                  setSending(false);
                }
              }}
              disabled={sending}
              className="bg-blue-600 text-white py-1 px-3 rounded-md"
            >
              {sending ? "Sending..." : "Send Reply"}
            </button>
            <button
              onClick={() => {
                setIsReplying(false);
                setReplyBody("");
              }}
              className="bg-gray-300 py-1 px-3 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageCard;
