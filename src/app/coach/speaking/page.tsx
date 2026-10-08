"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Wand2 } from "lucide-react";
import { useT } from "@/i18n/useT";
import { useApp } from "@/lib/store";
import { runTask } from "@/lib/api";
import { analyzeSpeech } from "@/lib/speech-analysis";
import { getSpeechRecognition, type SpeechRecognitionLike } from "@/components/a11y/speech";
import { cn } from "@/lib/utils";
import { PageHeader, SectionTitle, Alert } from "@/components/ui/misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { BackLink } from "@/components/explore/common";

/** 4.5 Public speaking coach: record yourself, see your pace and filler words, get tips. */
export default function SpeakingPage() {
  const { t, speechLang } = useT();
  const awardXp = useApp((s) => s.awardXp);
  const [topicIdx, setTopicIdx] = useState("1");
  const [ownTopic, setOwnTopic] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<"mic" | "unsupported" | null>(null);
  const [done, setDone] = useState(false);
  const [tips, setTips] = useState<{ strength: string; tips: string[] } | null>(null);
  const [tipsBusy, setTipsBusy] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const recordingRef = useRef(false);
  const startedAt = useRef(0);
  const canTranscribe = !!getSpeechRecognition();
  const canRecord = typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSeconds(Math.round((Date.now() - startedAt.current) / 1000)), 500);
    return () => clearInterval(id);
  }, [recording]);

  useEffect(() => () => {
    recordingRef.current = false;
    recRef.current?.abort();
    mediaRef.current?.stream.getTracks().forEach((tr) => tr.stop());
  }, []);

  function startRecognition() {
    const SR = getSpeechRecognition();
    if (!SR) return;
    const rec = new SR();
    rec.lang = speechLang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let fin = "";
      let mid = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) fin += `${e.results[i][0].transcript} `;
        else mid += e.results[i][0].transcript;
      }
      if (fin) setFinalText((x) => x + fin);
      setInterim(mid);
    };
    // Browsers stop listening after a pause; start again while still recording.
    rec.onend = () => {
      if (recordingRef.current) startRecognition();
    };
    rec.onerror = () => {};
    recRef.current = rec;
    rec.start();
  }

  async function start() {
    setError(null);
    setDone(false);
    setTips(null);
    setFinalText("");
    setInterim("");
    setSeconds(0);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    if (!canRecord && !canTranscribe) return setError("unsupported");
    try {
      if (canRecord) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        chunks.current = [];
        mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
        mr.onstop = () => {
          setAudioUrl(URL.createObjectURL(new Blob(chunks.current, { type: mr.mimeType })));
          stream.getTracks().forEach((tr) => tr.stop());
        };
        mr.start();
        mediaRef.current = mr;
      }
      recordingRef.current = true;
      startedAt.current = Date.now();
      setRecording(true);
      startRecognition();
    } catch {
      setError("mic");
    }
  }

  function stop() {
    recordingRef.current = false;
    recRef.current?.stop();
    if (mediaRef.current?.state === "recording") mediaRef.current.stop();
    setSeconds(Math.round((Date.now() - startedAt.current) / 1000));
    setRecording(false);
    setDone(true);
    awardXp("practice_test");
  }

  const transcript = (finalText + interim).trim();
  const stats = analyzeSpeech(transcript, seconds);
  const topic = topicIdx === "own" ? ownTopic : t(`skills.topic${topicIdx}`);
  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  async function getTips() {
    setTipsBusy(true);
    try {
      const r = await runTask<{ strength: string; tips: string[] }>("speaking", { topic, transcript, seconds, wpm: stats.wpm, fillers: stats.fillerTotal });
      if (r.output) setTips(r.output);
    } finally {
      setTipsBusy(false);
    }
  }

  return (
    <div>
      <BackLink href="/coach/practice" label={t("skills.practiceTitle")} />
      <PageHeader title={t("skills.speaking")} subtitle={t("skills.speakIntro")} />
      <Card className="space-y-3">
        <Field label={t("skills.speakTopic")}>
          {(id) => (
            <Select id={id} value={topicIdx} onChange={(e) => setTopicIdx(e.target.value)} disabled={recording}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={String(n)}>
                  {t(`skills.topic${n}`)}
                </option>
              ))}
              <option value="own">{t("skills.speakTopicOwn")}</option>
            </Select>
          )}
        </Field>
        {topicIdx === "own" && <Field label={t("skills.speakTopicOwn")}>{(id) => <Input id={id} value={ownTopic} maxLength={150} onChange={(e) => setOwnTopic(e.target.value)} />}</Field>}
        <div className="flex flex-wrap items-center gap-3">
          {!recording ? (
            <Button size="lg" onClick={start} icon={<Mic aria-hidden="true" className="size-5" />}>
              {t("skills.speakRecord")}
            </Button>
          ) : (
            <Button size="lg" variant="danger" onClick={stop} icon={<Square aria-hidden="true" className="size-5" />}>
              {t("skills.speakStop")}
            </Button>
          )}
          {recording && (
            <span role="status" className="flex items-center gap-2 font-bold text-danger">
              <span aria-hidden="true" className="size-3 animate-pulse rounded-full bg-danger" />
              {t("skills.speakRecording", { t: mmss })}
            </span>
          )}
        </div>
        {error === "mic" && <Alert tone="danger">{t("skills.speakMicError")}</Alert>}
        {error === "unsupported" && <Alert tone="warning">{t("skills.speakUnsupported")}</Alert>}
        {(recording || done) && canTranscribe && (
          <div>
            <p className="mb-1 font-bold">{t("skills.speakTranscript")}</p>
            <p className={cn("min-h-16 rounded-xl bg-surface-2 p-3 text-sm", !transcript && "text-muted")}>{transcript || "…"}</p>
          </div>
        )}
        {done && !canTranscribe && <Alert>{t("skills.speakNoTranscript")}</Alert>}
        {audioUrl && (
          <div>
            <p className="mb-1 font-bold">{t("skills.speakPlayback")}</p>
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}
      </Card>

      {done && (
        <>
          <SectionTitle>{t("skills.speakPace")}</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <p className="text-sm font-bold text-muted">{t("skills.speakLength")}</p>
              <p className="text-2xl font-bold">{t("skills.speakSeconds", { n: seconds })}</p>
              {seconds < 30 && <p className="text-sm">{t("skills.speakTooShort")}</p>}
            </Card>
            {canTranscribe && (
              <>
                <Card>
                  <p className="text-sm font-bold text-muted">{t("skills.speakPace")}</p>
                  <p className="text-2xl font-bold">{t("skills.speakWpm", { n: stats.wpm })}</p>
                  {stats.pace !== "unknown" && <p className="text-sm">{t(stats.pace === "good" ? "skills.speakPaceGood" : stats.pace === "fast" ? "skills.speakPaceFast" : "skills.speakPaceSlow")}</p>}
                </Card>
                <Card>
                  <p className="text-sm font-bold text-muted">{t("skills.speakFillers")}</p>
                  <p className="text-2xl font-bold">{stats.fillerTotal}</p>
                  <p className="text-sm">
                    {stats.fillerTotal <= 2 ? t("skills.speakFillersGood") : `${t("skills.speakFillersN", { n: stats.fillerTotal, list: stats.fillers.map((f) => `${f.word} ×${f.count}`).join(", ") })} ${t("skills.speakFillersTip")}`}
                  </p>
                </Card>
              </>
            )}
          </div>
          {canTranscribe && transcript.length > 5 && (
            <Card className="mt-4">
              <Button variant="soft" disabled={tipsBusy} onClick={getTips} icon={<Wand2 aria-hidden="true" className="size-4" />}>
                {tipsBusy ? t("skills.speakAiTipsLoading") : t("skills.speakAiTips")}
              </Button>
              {tips && (
                <div className="mt-3" aria-live="polite">
                  <p className="font-bold text-success">⭐ {tips.strength}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {tips.tips.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}
          <SectionTitle>{t("skills.speakChecklist")}</SectionTitle>
          <ul className="space-y-2">
            {[1, 2, 3, 4].map((n) => (
              <li key={n}>
                <label className="flex items-start gap-3 rounded-2xl border-2 border-b-4 border-border bg-surface p-3">
                  <input type="checkbox" className="mt-1 size-5 accent-[var(--primary)]" />
                  <span>{t(`skills.speakCheck${n}`)}</span>
                </label>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
