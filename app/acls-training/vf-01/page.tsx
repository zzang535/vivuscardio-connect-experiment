"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ProgressLog } from "./components/ProgressLog";
import { VitalsMonitor } from "./components/VitalsMonitor";
import { PROGRESS_STEPS, SCENE_LABEL, mmss } from "./scenario";
import type { LogTone, Scene, TimelineItem } from "./scenario";

type QueuedVoice = { cue: VoiceCue; text: string };

type RunState = {
  enteredRoom: boolean;
  responseChecked: boolean;
  pulseChecked: boolean;
  codeCalled: boolean;
  cprActive: boolean;
  teamArrived: boolean;
  padsAttached: boolean;
  oxygenReady: boolean;
  rhythmShown: boolean;
  rhythmCorrect: boolean;
  charged: boolean;
  cleared: boolean;
  shocked: boolean;
  finished: boolean;
};

const INITIAL: RunState = {
  enteredRoom: false,
  responseChecked: false,
  pulseChecked: false,
  codeCalled: false,
  cprActive: false,
  teamArrived: false,
  padsAttached: false,
  oxygenReady: false,
  rhythmShown: false,
  rhythmCorrect: false,
  charged: false,
  cleared: false,
  shocked: false,
  finished: false,
};

const VOICE_BASE = "/acls-training/audio/vf-01";
const VOICE_VERSION = "3";
// 실제 현장에서 들리는 목소리(diegetic)만 음성으로 재생한다.
// 코치성 리마인더는 음성 없이 텍스트 토스트(remind)로만 표시 → VOICE_CUES에 넣지 않는다.
const VOICE_CUES = [
  "scenario-timeout",
  "team-arrived", "patient-motionless", "no-response", "no-pulse", "call-code", "start-cpr",
  "resume-cpr", "pads-ready", "oxygen-ready", "rhythm-check", "vf-shockable",
  "charging", "charge-complete", "all-clear",
] as const;
type VoiceCue = (typeof VOICE_CUES)[number];

// urgent: 음성 재생 중에도 잠기지 않는 시간 민감 동작(제세동 시퀀스 등).
type ActionButton = { label: string; detail: string; onClick: () => void; primary: boolean; urgent?: boolean };

// 시나리오 종료 시 디브리핑 전에 현재 화면 위로 띄우는 결과 모달.
type Ending = { status: "success" | "fail"; title: string; message: string };

export default function VfScenarioPage() {
  const [scene, setScene] = useState<Scene>("ready");
  const [run, setRun] = useState<RunState>(INITIAL);
  const [seconds, setSeconds] = useState(0);
  const [caption, setCaption] = useState("야간 근무 중입니다. 환자 모니터 알람에 대응하세요.");
  const [speaking, setSpeaking] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [reminder, setReminder] = useState<string | null>(null);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [muted, setMuted] = useState(false);
  const [flash, setFlash] = useState(false);
  const [promptLevel, setPromptLevel] = useState(0);
  const [sceneStartedAt, setSceneStartedAt] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);
  const voicesRef = useRef<Map<VoiceCue, HTMLAudioElement>>(new Map());
  const activeVoiceRef = useRef<HTMLAudioElement | null>(null);
  const voiceQueueRef = useRef<QueuedVoice[]>([]);
  const alarmTimerRef = useRef<number | null>(null);
  const metronomeRef = useRef<number | null>(null);
  const reminderTimerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const [shockAt, setShockAt] = useState<number | null>(null);

  const elapsed = useCallback(() => Math.max(0, Math.round((Date.now() - startedAtRef.current) / 1000)), []);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current || audioRef.current.state === "closed") audioRef.current = new AudioContext();
    if (audioRef.current.state === "suspended") void audioRef.current.resume();
    return audioRef.current;
  }, []);

  const tone = useCallback((frequency: number, duration = 0.12, type: OscillatorType = "sine", gain = 0.05) => {
    if (muted) return;
    const context = ensureAudio();
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    volume.gain.setValueAtTime(gain, context.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(volume).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }, [ensureAudio, muted]);

  const drainVoiceQueue = useCallback(function playNextVoice() {
    if (activeVoiceRef.current) return;
    const next = voiceQueueRef.current.shift();
    if (!next) {
      setSpeaking(false);
      return;
    }
    const voice = voicesRef.current.get(next.cue);
    if (!voice) {
      playNextVoice();
      return;
    }
    setCaption(next.text);
    setSpeaking(true);
    voice.currentTime = 0;
    activeVoiceRef.current = voice;
    voice.onended = () => {
      activeVoiceRef.current = null;
      playNextVoice();
    };
    void voice.play().catch(() => {
      activeVoiceRef.current = null;
      playNextVoice();
    });
  }, []);

  const speak = useCallback((cue: VoiceCue, text: string) => {
    if (muted) {
      setCaption(text);
      return;
    }
    voiceQueueRef.current.push({ cue, text });
    drainVoiceQueue();
  }, [drainVoiceQueue, muted]);

  // 코치성 리마인더 — 음성 없이 상단 토스트로만 표시하고, 잠시 후 자동으로 사라진다.
  const remind = useCallback((text: string) => {
    setReminder(text);
    if (reminderTimerRef.current) window.clearTimeout(reminderTimerRef.current);
    reminderTimerRef.current = window.setTimeout(() => setReminder(null), 5500);
  }, []);

  useEffect(() => {
    const voices = new Map<VoiceCue, HTMLAudioElement>();
    VOICE_CUES.forEach((cue) => {
      const audio = new Audio(`${VOICE_BASE}/${cue}.wav?v=${VOICE_VERSION}`);
      audio.preload = "auto";
      voices.set(cue, audio);
    });
    voicesRef.current = voices;
    return () => {
      voices.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      voicesRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!muted) return;
    activeVoiceRef.current?.pause();
    activeVoiceRef.current = null;
    voiceQueueRef.current = [];
    setSpeaking(false);
  }, [muted]);

  const log = useCallback((text: string, toneValue: LogTone = "normal") => {
    const at = startedAtRef.current ? elapsed() : 0;
    setTimeline((current) => [...current, { at, text, tone: toneValue }]);
  }, [elapsed]);

  const stopAlarm = useCallback(() => {
    if (alarmTimerRef.current) window.clearInterval(alarmTimerRef.current);
    alarmTimerRef.current = null;
  }, []);

  const stopMetronome = useCallback(() => {
    if (metronomeRef.current) window.clearInterval(metronomeRef.current);
    metronomeRef.current = null;
  }, []);

  const startAlarm = useCallback(() => {
    stopAlarm();
    tone(880, 0.16, "square", 0.035);
    window.setTimeout(() => tone(880, 0.16, "square", 0.035), 240);
    alarmTimerRef.current = window.setInterval(() => {
      tone(880, 0.16, "square", 0.035);
      window.setTimeout(() => tone(880, 0.16, "square", 0.035), 240);
    }, 1900);
  }, [stopAlarm, tone]);

  const startMetronome = useCallback(() => {
    stopMetronome();
    tone(1200, 0.035, "square", 0.025);
    metronomeRef.current = window.setInterval(() => tone(1200, 0.035, "square", 0.025), 545);
  }, [stopMetronome, tone]);

  useEffect(() => {
    if (scene === "ready" || scene === "debrief" || ending) return;
    const timer = window.setInterval(() => setSeconds(elapsed()), 250);
    return () => window.clearInterval(timer);
  }, [elapsed, scene, ending]);

  useEffect(() => () => {
    stopAlarm();
    stopMetronome();
    if (reminderTimerRef.current) window.clearTimeout(reminderTimerRef.current);
    activeVoiceRef.current?.pause();
    voiceQueueRef.current = [];
    const context = audioRef.current;
    audioRef.current = null;
    if (context && context.state !== "closed") void context.close().catch(() => {});
  }, [stopAlarm, stopMetronome]);

  // 씬이 바뀌면(=진행되면) 남아 있던 코치 리마인더를 즉시 치운다.
  useEffect(() => {
    setReminder(null);
  }, [scene]);

  useEffect(() => {
    if (scene === "ready" || scene === "debrief" || ending) return;
    if (seconds >= 90) {
      stopAlarm();
      stopMetronome();
      log("시나리오 제한시간 90초 도달", "warn");
      speak("scenario-timeout", "시나리오 제한 시간이 종료되었습니다. 수행 결과를 확인합니다.");
      setEnding({ status: "fail", title: "제한 시간이 종료되었습니다", message: "90초 안에 첫 제세동 후 CPR 재개까지 완료하지 못했습니다." });
      return;
    }

    const sceneElapsed = seconds - sceneStartedAt;
    if (scene === "ward" && sceneElapsed >= 3) {
      setScene("alarm");
      setSceneStartedAt(seconds);
      setCaption("병동에서 고우선순위 모니터 알람이 울립니다. 발생 위치를 확인하세요.");
      log("병동 내 고우선순위 모니터 알람 발생", "warn");
      startAlarm();
      return;
    }
    if (scene === "alarm" && sceneElapsed >= 5 && promptLevel < 1) {
      setPromptLevel(1);
      remind("3번 병상 알람입니다. 즉시 환자를 확인해 주세요.");
      log("알람 대응 지연 · 재확인 요청", "warn");
    }
    if (scene === "check" && sceneElapsed >= 8 && promptLevel < 2) {
      setPromptLevel(2);
      remind("환자 반응과 호흡, 맥박을 확인해야 합니다.");
      log("환자 상태 확인 지연", "warn");
    }
    if (scene === "response" && sceneElapsed >= 8 && promptLevel < 3) {
      setPromptLevel(3);
      remind("맥박이 없습니다. 코드 블루 호출과 흉부압박이 필요합니다.");
      log("초기 대응 지연", "warn");
    }
    if (scene === "shock" && run.shocked && !run.cprActive && shockAt !== null) {
      const sinceShock = seconds - shockAt;
      if (sinceShock >= 5 && promptLevel < 5) {
        setPromptLevel(5);
        remind("쇼크 후 즉시 흉부압박을 재개하세요.");
        log("Shock 후 CPR 재개 5초 초과", "warn");
      }
      if (sinceShock >= 10) {
        setRun((current) => ({ ...current, cprActive: true, finished: true }));
        startMetronome();
        log("NPC가 CPR 재개 · 중대한 지연", "warn");
        setEnding({ status: "fail", title: "CPR 재개가 지연되었습니다", message: "쇼크 후 흉부압박 재개가 늦어 팀원이 대신 시작했습니다. 쇼크 직후 즉시 압박 재개가 핵심입니다." });
      }
    }
  }, [ending, log, promptLevel, remind, run.cprActive, run.shocked, scene, sceneStartedAt, seconds, shockAt, speak, startAlarm, startMetronome, stopAlarm, stopMetronome]);

  useEffect(() => {
    if (!run.codeCalled || run.teamArrived) return;
    const timer = window.setTimeout(() => {
      setRun((current) => ({ ...current, teamArrived: true }));
      setScene("team");
      setSceneStartedAt(elapsed());
      speak("team-arrived", "코드팀 도착했습니다. 역할을 지시해 주세요.");
      log("코드팀과 제세동기 도착", "good");
      tone(420, 0.08, "triangle", 0.03);
    }, 7000);
    return () => window.clearTimeout(timer);
  }, [elapsed, log, run.codeCalled, run.teamArrived, speak, tone]);

  // 스피커·볼륨 확인용 음성 나레이션 테스트 (음소거 여부와 무관하게 항상 재생).
  const playTest = useCallback((onEnd?: () => void) => {
    const audio = new Audio(`${VOICE_BASE}/audio-test.wav?v=${VOICE_VERSION}`);
    audio.onended = () => onEnd?.();
    void audio.play().catch(() => onEnd?.());
  }, []);

  const begin = () => {
    ensureAudio();
    startedAtRef.current = Date.now();
    setSeconds(0);
    setSceneStartedAt(0);
    setScene("ward");
    setRun(INITIAL);
    setTimeline([{ at: 0, text: "야간 병동 관찰 시작", tone: "normal" }]);
    setPromptLevel(0);
    setCaption("야간 병동은 조용합니다. 환자와 모니터 상태를 살펴보세요.");
  };

  const selectBed = (bedNumber: number) => {
    if (scene !== "alarm") return;
    if (bedNumber !== 3) {
      remind(`${bedNumber}번 병상은 안정 상태입니다. 알람이 발생한 병상을 다시 찾으세요.`);
      log(`${bedNumber}번 병상 오선택 · 정상 상태`, "warn");
      tone(210, 0.1, "triangle", 0.025);
      return;
    }
    log("3번 병상 식별", "good");
    enterRoom();
  };

  const enterRoom = () => {
    stopAlarm();
    setRun((current) => ({ ...current, enteredRoom: true }));
    setScene("check");
    setSceneStartedAt(seconds);
    log("병실 진입", seconds <= 5 ? "good" : "warn");
    speak("patient-motionless", "환자가 침상에 누워 있고 움직임이 없습니다.");
  };

  const checkResponse = () => {
    setRun((current) => ({ ...current, responseChecked: true }));
    log("반응 확인 · 무반응", "good");
    speak("no-response", "환자분, 괜찮으세요? 반응 없습니다.");
  };

  const checkPulse = () => {
    setRun((current) => ({ ...current, pulseChecked: true }));
    log("호흡·맥박 확인 · 정상 호흡 없음, 맥박 없음", "good");
    speak("no-pulse", "정상 호흡 없고 맥박 촉지되지 않습니다.");
    window.setTimeout(() => {
      setScene("response");
      setSceneStartedAt(elapsed());
    }, 900);
  };

  const callCode = () => {
    setRun((current) => ({ ...current, codeCalled: true }));
    log("코드 블루 호출", seconds <= 20 ? "good" : "warn");
    speak("call-code", "코드 블루 호출합니다. 제세동기 가져오세요.");
    tone(660, 0.18, "sine", 0.04);
    window.setTimeout(() => tone(520, 0.22, "sine", 0.04), 260);
  };

  const startCpr = () => {
    setRun((current) => ({ ...current, cprActive: true }));
    startMetronome();
    log(run.shocked ? "Shock 직후 CPR 재개" : "흉부압박 시작", run.shocked && shockAt !== null && seconds - shockAt <= 5 ? "good" : "normal");
    speak(run.shocked ? "resume-cpr" : "start-cpr", run.shocked ? "압박 재개했습니다." : "흉부압박 시작합니다.");
    if (run.shocked) {
      setRun((current) => ({ ...current, cprActive: true, finished: true }));
      window.setTimeout(() => {
        stopMetronome();
        setEnding({ status: "success", title: "성공적으로 완료했습니다", message: "첫 제세동 직후 즉시 CPR을 재개했습니다. 핵심 소생 시퀀스를 모두 수행했습니다." });
      }, 1800);
    }
  };

  const attachPads = () => {
    setRun((current) => ({ ...current, padsAttached: true }));
    tone(360, 0.07, "square", 0.025);
    log("CPR 유지하며 제세동 패드 부착", run.cprActive ? "good" : "warn");
    speak("pads-ready", "패드 부착 완료. 리듬 확인 가능합니다.");
  };

  const prepareOxygen = () => {
    setRun((current) => ({ ...current, oxygenReady: true }));
    log("산소와 앰부백 준비", "good");
    speak("oxygen-ready", "산소와 앰부백 준비됐습니다.");
  };

  const checkRhythm = () => {
    stopMetronome();
    setRun((current) => ({ ...current, cprActive: false, rhythmShown: true }));
    setScene("rhythm");
    setSceneStartedAt(seconds);
    log("압박 중단 · 리듬 확인 시작", "normal");
    speak("rhythm-check", "압박 중단. 리듬 확인합니다.");
  };

  const classifyRhythm = (shockable: boolean) => {
    if (!shockable) {
      log("VF를 Non-shockable로 잘못 분류", "warn");
      remind("리듬을 다시 확인하세요. 파형이 불규칙하게 요동치면 VF입니다.");
      return;
    }
    setRun((current) => ({ ...current, rhythmCorrect: true }));
    log("VF · Shockable rhythm 판독", "good");
    speak("vf-shockable", "VF입니다. 쇼커블 리듬입니다.");
  };

  const charge = () => {
    setRun((current) => ({ ...current, charged: false, cprActive: true }));
    startMetronome();
    log("200 J 충전 지시 · 충전 중 CPR 재개", "good");
    speak("charging", "200줄 충전합니다. 압박 계속하세요.");
    const context = ensureAudio();
    if (!muted) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(260, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(980, context.currentTime + 2.2);
      gain.gain.setValueAtTime(0.025, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 2.2);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 2.2);
    }
    window.setTimeout(() => {
      setRun((current) => ({ ...current, charged: true }));
      tone(1320, 0.18, "square", 0.05);
      speak("charge-complete", "200줄 충전 완료.");
      log("제세동기 충전 완료", "good");
      setScene("shock");
      setSceneStartedAt(elapsed());
    }, 2300);
  };

  const clearTeam = () => {
    stopMetronome();
    setRun((current) => ({ ...current, cprActive: false, cleared: true }));
    log("모두 물러남 및 산소 분리 확인", "good");
    speak("all-clear", "모두 물러나세요. 산소 분리했습니다. 모두 물러났습니다.");
  };

  const shock = () => {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 180);
    tone(90, 0.25, "square", 0.11);
    setShockAt(seconds);
    setRun((current) => ({ ...current, shocked: true }));
    log("첫 제세동 시행", "good");
    setCaption("Shock 전달. 다음 행동을 지시하세요.");
  };

  const reset = () => {
    stopAlarm();
    stopMetronome();
    activeVoiceRef.current?.pause();
    activeVoiceRef.current = null;
    voiceQueueRef.current = [];
    setSpeaking(false);
    if (reminderTimerRef.current) window.clearTimeout(reminderTimerRef.current);
    setReminder(null);
    setScene("ready");
    setRun(INITIAL);
    setSeconds(0);
    setTimeline([]);
    setCaption("야간 근무 중입니다. 환자 모니터 알람에 대응하세요.");
    setPromptLevel(0);
    setSceneStartedAt(0);
    setShockAt(null);
    setEnding(null);
  };

  const finishToDebrief = () => {
    setEnding(null);
    setScene("debrief");
  };

  const actions = ((): ActionButton[] => {
    if (scene === "ward" || scene === "alarm") return [];
    if (scene === "check") return [
      ...(!run.responseChecked ? [{ label: "반응 확인", detail: "어깨를 두드리고 부름", onClick: checkResponse, primary: true }] : []),
      ...(run.responseChecked && !run.pulseChecked ? [{ label: "호흡·맥박 확인", detail: "10초 이내 동시 확인", onClick: checkPulse, primary: true }] : []),
    ];
    if (scene === "response" || scene === "team") return [
      ...(!run.codeCalled ? [{ label: "코드 블루 호출", detail: "제세동기와 소생팀 요청", onClick: callCode, primary: true }] : []),
      ...(!run.cprActive ? [{ label: "CPR 시작", detail: "고품질 흉부압박", onClick: startCpr, primary: true }] : []),
      ...(run.teamArrived && !run.padsAttached ? [{ label: "패드 부착 지시", detail: "CPR을 유지하며 연결", onClick: attachPads, primary: true }] : []),
      ...(run.teamArrived && !run.oxygenReady ? [{ label: "산소·앰부 준비", detail: "기도 담당자에게 지시", onClick: prepareOxygen, primary: false }] : []),
      ...(run.padsAttached && run.cprActive ? [{ label: "리듬 확인", detail: "압박 중단 최소화", onClick: checkRhythm, primary: true }] : []),
    ];
    if (scene === "rhythm") return [
      ...(!run.rhythmCorrect ? [{ label: "Shockable", detail: "VF / pulseless VT", onClick: () => classifyRhythm(true), primary: true }, { label: "Non-shockable", detail: "PEA / Asystole", onClick: () => classifyRhythm(false), primary: false }] : []),
      ...(run.rhythmCorrect ? [{ label: "200 J 충전", detail: "충전 중 CPR 재개", onClick: charge, primary: true }] : []),
    ];
    if (scene === "shock") return [
      ...(!run.cleared ? [{ label: "모두 물러남 확인", detail: "접촉 및 산소 분리", onClick: clearTeam, primary: true }] : []),
      ...(run.cleared && !run.shocked ? [{ label: "SHOCK", detail: "200 J biphasic", onClick: shock, primary: true }] : []),
      ...(run.shocked && !run.cprActive ? [{ label: "CPR 즉시 재개", detail: "맥박 확인 없이 압박", onClick: startCpr, primary: true }] : []),
    ];
    return [];
  })();

  if (scene === "ready") return <ReadyScreen onStart={begin} onTest={playTest} />;
  if (scene === "debrief") return <Debrief timeline={timeline} seconds={seconds} onRestart={reset} />;

  return (
    <main className="relative h-screen min-h-[720px] overflow-hidden bg-[#101820] text-white">
      <div className="absolute inset-0">
          {scene === "ward" || scene === "alarm" ? (
            <>
              <Image src="/acls-training/ward-overview-night-v1.png" alt="네 개 병상이 있는 야간 일반 병동" fill priority sizes="calc(100vw - 320px)" className={`object-cover transition duration-700 ${scene === "alarm" ? "brightness-[.7]" : "brightness-[.58]"}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101820]/90 via-transparent to-black/30" />
              {[1, 2, 3, 4].map((bed) => {
                const positions = ["left-[3.5%]", "left-[27%]", "left-[50.5%]", "left-[74%]"];
                const isAlarmBed = scene === "alarm" && bed === 3;
                return <button key={bed} type="button" disabled={scene === "ward" || speaking} onClick={() => selectBed(bed)} aria-label={`${bed}번 병상 확인`} className={`absolute top-[29%] h-[39%] w-[21%] rounded-md border transition ${positions[bed - 1]} ${speaking ? "opacity-60" : ""} ${scene === "ward" ? "cursor-default border-transparent" : isAlarmBed ? "border-red-300/60 bg-red-500/[0.04] hover:bg-red-500/[0.1]" : "border-white/[0.08] bg-white/[0.01] hover:border-white/30 hover:bg-white/[0.04]"}`}>
                  <span className={`absolute bottom-3 left-1/2 -translate-x-1/2 rounded border px-3 py-1.5 text-xs font-bold shadow-md ${isAlarmBed ? "border-red-300/60 bg-red-950/90 text-red-100" : "border-white/20 bg-[#101820]/90 text-slate-200"}`}>{bed}번 병상</span>
                  {isAlarmBed && <span className="absolute left-1/2 top-[7%] h-3 w-3 -translate-x-1/2 rounded-full bg-red-400" />}
                </button>;
              })}
              <div className={`absolute left-5 top-24 rounded border px-4 py-3 ${scene === "alarm" ? "border-red-300/40 bg-red-950/85" : "border-white/15 bg-[#101820]/85"}`}><p className={`text-[10px] font-bold ${scene === "alarm" ? "text-red-200" : "text-slate-400"}`}>{scene === "alarm" ? "최우선 알람" : "야간 병동 · 22:14"}</p><p className="mt-1 text-sm font-semibold">{scene === "alarm" ? "알람 발생 병상을 확인하세요" : "병동 상태 관찰 중"}</p></div>
            </>
          ) : (
            <>
              <Image src="/acls-training/hospital-room-patient-night-v1.png" alt="무반응 환자가 누워 있는 야간 병실" fill priority sizes="100vw" className="object-cover transition duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101820]/95 via-transparent to-black/35" />
              {/* 이미지와 동일한 16:9 좌표계 박스. object-cover(높이 기준 커버)와 정렬되어 오버레이 %가 이미지 픽셀 위치에 대응한다. */}
              <div className="pointer-events-none absolute left-1/2 top-0 aspect-[16/9] h-full -translate-x-1/2">
                {run.teamArrived && <><Person className="left-[30.7%] top-[41%]" color="#0f766e" active={run.cprActive} label="CPR" /><Person className="left-[49%] top-[30%]" color="#1d4ed8" active={run.padsAttached} label="AED" /><Person className="left-[19.7%] top-[46%]" color="#7c3aed" active={run.oxygenReady} label="AIR" /></>}
                {run.padsAttached && <><span className="absolute left-[43.1%] top-[40.5%] h-5 w-7 -translate-x-1/2 -translate-y-1/2 rotate-12 rounded bg-white/95 shadow-lg ring-2 ring-cyan-500" /><span className="absolute left-[45.5%] top-[42.5%] h-5 w-7 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded bg-white/95 shadow-lg ring-2 ring-cyan-500" /></>}
                {run.cprActive && <div className="absolute left-[44.9%] top-[41%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-4 border-cyan-300/70" />}
              </div>
              <VitalsMonitor cpr={run.cprActive} shifted={showLog} />
            </>
          )}
      </div>

      {flash && <div className="absolute inset-0 z-40 bg-white/90" />}

      {/* ===== 코치 리마인더 토스트 (음성 없음 · 상단 중앙 · 자동 사라짐) ===== */}
      {reminder && (
        <div className="reminder-toast pointer-events-none absolute left-1/2 top-20 z-40 flex max-w-[560px] items-start gap-3 rounded border-l-4 border-amber-400 bg-[#2a2417]/95 px-5 py-3.5 shadow-lg">
          <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full border border-amber-300 text-xs font-bold text-amber-300">i</span>
          <div>
            <p className="text-[11px] font-bold text-amber-300">학습 안내</p>
            <p className="mt-0.5 text-sm leading-6 text-amber-50">{reminder}</p>
          </div>
        </div>
      )}

      {/* ===== Top HUD ===== */}
      <div className={`absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent py-3 pl-4 transition-[padding] duration-300 ${showLog ? "pr-[356px]" : "pr-4"}`}>
        <div className="flex items-center gap-3">
          <Link href="/acls-training" className="grid h-9 w-9 place-items-center rounded border border-white/20 bg-black/40 text-slate-200 hover:bg-white/10" aria-label="시나리오 목록으로">←</Link>
          <div><p className="text-[10px] font-semibold text-[#8dc4d3]">VF-01 · {SCENE_LABEL[scene]}</p><h1 className="text-sm font-semibold">{scene === "ward" || scene === "alarm" ? "야간 일반 병동" : "야간 일반 병동 · 3번 병상"}</h1></div>
        </div>
        <div className="hidden items-center gap-1.5 border-b border-white/20 bg-black/30 px-3 py-1.5 lg:flex">
          {PROGRESS_STEPS.map((item, index) => { const ci = PROGRESS_STEPS.indexOf(scene); return <div key={item} className="flex items-center gap-1.5">{index > 0 && <span className={`h-px w-3 ${index <= ci ? "bg-emerald-400/60" : "bg-white/15"}`} />}<span className={`grid h-5 w-5 place-items-center rounded-full text-[9px] font-bold ${item === scene ? "bg-[#6eaabd] text-[#101820]" : index < ci ? "bg-emerald-400/80 text-[#101820]" : "bg-white/10 text-slate-500"}`}>{index < ci ? "✓" : index + 1}</span>{item === scene && <span className="pr-1 text-xs font-semibold text-white">{SCENE_LABEL[item]}</span>}</div>; })}
        </div>
        <div className="flex items-center gap-2">
          <div className="border border-white/15 bg-black/50 px-3 py-1.5"><span className="font-mono text-lg tabular-nums">{mmss(seconds)}</span><span className="ml-1 text-[10px] text-slate-400">/ 01:30</span></div>
          <button onClick={() => setMuted((value) => !value)} className="h-9 border border-white/20 bg-black/40 px-3 text-xs font-semibold text-slate-200 hover:bg-white/10" aria-label="음소거 토글">{muted ? "음성 켜기" : "음소거"}</button>
          <button onClick={() => setShowLog((value) => !value)} className={`h-9 border px-3 text-xs font-semibold hover:bg-white/10 ${showLog ? "border-[#8dc4d3] bg-[#176b87]/60" : "border-white/20 bg-black/40"}`} aria-label="훈련 기록 열기/닫기">훈련 기록</button>
        </div>
      </div>

      {/* ===== Bottom game panel ===== */}
      <div className={`absolute inset-x-0 bottom-0 z-30 py-3 pl-3 transition-[padding] duration-300 md:py-5 md:pl-5 ${showLog ? "pr-3 md:pr-[356px]" : "pr-3 md:pr-5"}`}>
        <div className="mx-auto flex w-full max-w-[1500px] items-stretch gap-3 md:gap-4">
          <div className="relative flex-1 border-l-4 border-[#6eaabd] bg-[#111a22]/96 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.45)] md:p-6">
            <span className="text-[11px] font-bold text-[#8dc4d3]">현장 음성</span>
            <p className="mt-2 text-xl leading-relaxed text-white md:text-2xl md:leading-[1.5]">{caption}</p>
          </div>
          {scene === "ward" || scene === "alarm" ? (
            <div className="hidden w-[300px] shrink-0 flex-col items-center justify-center border border-white/20 bg-[#111a22]/96 p-5 text-center shadow-lg md:flex">
              <p className="text-xs font-bold text-[#8dc4d3]">화면 확인</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-200">{scene === "ward" ? "화면 속 병동을 관찰하세요" : "화면에서 알람이 울린 병상을 직접 선택하세요"}</p>
            </div>
          ) : actions.length > 0 ? (
            <div className="w-[300px] shrink-0 border border-white/20 bg-[#111a22]/96 p-3 shadow-lg">
              <p className="px-2 pb-2 pt-1 text-[11px] font-bold text-slate-400">다음 행동을 선택하세요</p>
              <div className="grid divide-y divide-white/10 border-y border-white/10">{actions.map((action) => { const locked = speaking && !action.urgent; return <button key={action.label} disabled={locked} onClick={action.onClick} className={`flex w-full items-center justify-between gap-2 px-3 py-3 text-left transition-colors ${locked ? "cursor-not-allowed opacity-40" : "hover:bg-white/[0.06]"} ${action.primary ? "border-l-2 border-[#6eaabd] bg-[#176b87]/20" : ""}`}><span><span className="block text-[15px] font-bold">{action.label}</span><span className="mt-0.5 block text-[11px] text-slate-400">{action.detail}</span></span><span className="text-sm text-slate-400">→</span></button>; })}</div>
              {speaking && <p className="px-2 pb-1 pt-2 text-[11px] font-semibold text-[#8dc4d3]">현장 음성 재생 중</p>}
            </div>
          ) : null}
        </div>
      </div>

      {/* ===== Progress board (진행 상황판) · non-blocking drawer ===== */}
      {showLog && <ProgressLog scene={scene} timeline={timeline} onClose={() => setShowLog(false)} />}

      {/* ===== 결과 모달 · 현재 화면 위에 띄우고, 확인하면 디브리핑으로 ===== */}
      {ending && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="ending-pop w-[min(460px,92%)] border border-[#46515c] bg-[#17212b] p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
            <div className={`mx-auto grid h-12 w-12 place-items-center rounded-full border-2 text-xl font-black ${ending.status === "success" ? "border-emerald-400/50 text-emerald-300" : "border-amber-400/50 text-amber-300"}`}>{ending.status === "success" ? "✓" : "!"}</div>
            <p className={`mt-5 text-xs font-bold ${ending.status === "success" ? "text-emerald-300" : "text-amber-300"}`}>{ending.status === "success" ? "훈련 완료" : "훈련 미완료"}</p>
            <h2 className="mt-2 text-2xl font-bold">{ending.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{ending.message}</p>
            <button onClick={finishToDebrief} className="mt-7 w-full rounded bg-[#176b87] px-5 py-3.5 font-bold text-white transition hover:bg-[#145c74]">수행 결과 확인</button>
          </div>
        </div>
      )}

      <style jsx global>{`.vf-grid{background-image:linear-gradient(rgba(45,212,191,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(45,212,191,.16) 1px,transparent 1px);background-size:10px 10px}@keyframes reminderIn{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}}.reminder-toast{animation:reminderIn .25s ease-out both}@keyframes endingPop{from{opacity:0;transform:scale(.92) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}.ending-pop{animation:endingPop .28s cubic-bezier(.2,.8,.2,1) both}`}</style>
    </main>
  );
}

function ReadyScreen({ onStart, onTest }: { onStart: () => void; onTest: (onEnd?: () => void) => void }) {
  const [playing, setPlaying] = useState(false);
  const test = () => { if (playing) return; setPlaying(true); onTest(() => setPlaying(false)); };
  return <main className="relative min-h-screen overflow-hidden bg-[#101820] text-white"><Image src="/acls-training/ward-overview-night-v1.png" alt="야간 일반 병동" fill priority className="object-cover opacity-30" /><div className="absolute inset-0 bg-gradient-to-r from-[#101820] via-[#101820]/95 to-[#101820]/55" /><div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-8"><div className="max-w-2xl border-l-4 border-[#6eaabd] pl-8"><Link href="/acls-training" className="text-sm text-slate-400 hover:text-white">← 시나리오 목록</Link><p className="mt-12 text-sm font-semibold text-[#8dc4d3]">시나리오 VF-01 · 예상 소요 2분</p><h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">야간 일반 병동<br />VF 심정지</h1><p className="mt-6 max-w-xl text-base leading-8 text-slate-300">당신은 야간 근무 중인 병동 간호사입니다. 모니터 알람부터 환자를 확인하고, 코드팀을 이끌어 첫 제세동 후 CPR을 재개하세요.</p><dl className="mt-8 grid grid-cols-3 border-y border-white/20 text-xs"><Brief label="역할" value="최초 반응자" /><Brief label="훈련 범위" value="첫 제세동 후 CPR" /><Brief label="제한 시간" value="90초" /></dl><div className="mt-10 flex gap-3"><button onClick={onStart} className="rounded bg-[#176b87] px-7 py-3.5 font-bold text-white transition hover:bg-[#145c74]">훈련 시작</button><button onClick={test} disabled={playing} className={`rounded border px-5 py-3.5 text-sm transition ${playing ? "border-[#6eaabd] bg-[#176b87]/20 text-[#a9d4df]" : "border-white/25 text-slate-300 hover:bg-white/5"}`}>{playing ? "음성 재생 중…" : "음향 테스트"}</button></div><p className="mt-4 text-xs text-slate-400">훈련에는 현장 음성이 포함됩니다. 모든 음성은 자막으로도 제공됩니다.</p></div></div></main>;
}

function Debrief({ timeline, seconds, onRestart }: { timeline: TimelineItem[]; seconds: number; onRestart: () => void }) {
  const warnings = timeline.filter((item) => item.tone === "warn").length;
  return <main className="min-h-screen bg-[#f3f5f7] px-6 py-12 text-[#17212b]"><div className="mx-auto max-w-4xl"><p className="text-sm font-semibold text-[#176b87]">훈련 완료</p><div className="mt-2 flex items-end justify-between border-b border-[#cfd5dc] pb-6"><div><h1 className="text-3xl font-bold">수행 결과</h1><p className="mt-2 text-sm text-[#66717d]">각 행동이 언제 수행되었는지 확인하고 대응 흐름을 복습하세요.</p></div><div className="text-right"><p className="text-xs text-[#77828d]">총 소요 시간</p><p className="mt-1 font-mono text-3xl">{mmss(seconds)}</p></div></div><div className="mt-8 grid gap-6 md:grid-cols-[1fr_240px]"><div className="border border-[#d4dae0] bg-white p-5"><h2 className="font-bold">수행 타임라인</h2><div className="mt-4 divide-y divide-[#e2e6ea]">{timeline.map((item, index) => <div key={`${item.at}-${index}`} className="grid grid-cols-[56px_12px_1fr] gap-3 py-3"><span className="font-mono text-xs text-[#77828d]">{mmss(item.at)}</span><span className={`mt-1 h-2 w-2 rounded-full ${item.tone === "good" ? "bg-emerald-500" : item.tone === "warn" ? "bg-amber-500" : "bg-[#4f8191]"}`} /><span className="text-sm text-[#46515c]">{item.text}</span></div>)}</div></div><div><dl className="divide-y divide-[#d4dae0] border-y border-[#d4dae0]"><div className="flex items-center justify-between py-4"><dt className="text-sm text-[#66717d]">완료 행동</dt><dd className="text-2xl font-bold text-emerald-700">{timeline.filter((item) => item.tone === "good").length}</dd></div><div className="flex items-center justify-between py-4"><dt className="text-sm text-[#66717d]">지연·재확인</dt><dd className="text-2xl font-bold text-amber-700">{warnings}</dd></div></dl><button onClick={onRestart} className="mt-6 w-full rounded bg-[#176b87] px-5 py-3.5 font-bold text-white hover:bg-[#145c74]">같은 시나리오 다시 훈련</button><Link href="/acls-training" className="mt-4 block text-center text-sm text-[#66717d] hover:text-[#17212b]">시나리오 목록으로</Link></div></div></div></main>;
}

function Person({ className, color, active, label }: { className: string; color: string; active: boolean; label: string }) { return <div className={`absolute ${className} h-[35%] w-[11%] drop-shadow-2xl ${active ? "animate-[pulse_1s_ease-in-out_infinite]" : ""}`}><div className="absolute left-[31%] top-0 h-[24%] w-[38%] rounded-full bg-[#bd8768]" /><div className="absolute left-[17%] top-[19%] h-[48%] w-[66%] rounded-[30%_30%_18%_18%]" style={{ background: color }} /><div className="absolute left-[23%] top-[62%] h-[35%] w-[20%] rounded-b-lg bg-slate-700" /><div className="absolute right-[23%] top-[62%] h-[35%] w-[20%] rounded-b-lg bg-slate-700" /><span className="absolute left-1/2 top-[34%] -translate-x-1/2 text-[8px] font-black text-white">{label}</span></div>; }
function Brief({ label, value }: { label: string; value: string }) { return <div className="border-r border-white/20 px-4 py-4 first:pl-0 last:border-r-0"><dt className="text-slate-400">{label}</dt><dd className="mt-1 font-semibold text-slate-100">{value}</dd></div>; }
