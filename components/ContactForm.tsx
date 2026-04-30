"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "../lib/firebase";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;

    setStatus("submitting");
    setErrorMsg(null);

    try {
      const db = getDb();
      if (!db || !isFirebaseConfigured()) {
        // Dev-friendly fallback: log to console and pretend success.
        // Configure NEXT_PUBLIC_FIREBASE_* env vars to persist real data.
        console.info("[Aegis] Firebase not configured — logging locally:", {
          name,
          email,
          message,
        });
      } else {
        await addDoc(collection(db, "leads"), {
          name,
          email,
          message,
          createdAt: serverTimestamp(),
          source: "aegis-website",
        });
      }
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-6 sm:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Reserve your case.
        </h3>
        <span className="text-[10px] uppercase tracking-[0.28em] text-muted">
          Early access
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">
        Drop your details — we&apos;ll send shipping windows and a 15% founder
        code.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-white/35 focus:outline-none focus:border-accent/60 focus:bg-black/55 transition-colors"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-white/35 focus:outline-none focus:border-accent/60 focus:bg-black/55 transition-colors"
        />
      </div>
      <textarea
        placeholder="Phone model, optional notes..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="mt-3 w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-white/35 focus:outline-none focus:border-accent/60 focus:bg-black/55 transition-colors resize-none"
      />

      <div className="mt-5 flex items-center justify-between gap-4">
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.span
              key="success"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-accent"
            >
              You&apos;re on the list.
            </motion.span>
          ) : status === "error" ? (
            <motion.span
              key="error"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-accent-warm"
            >
              {errorMsg ?? "Couldn't submit. Try again?"}
            </motion.span>
          ) : (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted"
            >
              We never share your data.
            </motion.span>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: status === "submitting" ? 1 : 1.04 }}
          whileTap={{ scale: 0.98 }}
          disabled={status === "submitting"}
          type="submit"
          className="h-11 px-6 rounded-full bg-white text-black text-sm font-medium tracking-tight disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_8px_30px_rgba(110,231,255,0.2)] hover:shadow-[0_8px_36px_rgba(110,231,255,0.35)] transition-shadow"
        >
          {status === "submitting" ? "Reserving…" : "Reserve"}
        </motion.button>
      </div>
    </form>
  );
}
