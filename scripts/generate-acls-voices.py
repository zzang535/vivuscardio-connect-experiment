#!/usr/bin/env python3
"""Generate the fixed Korean VF-01 scenario lines with MeloTTS.

Setup (kept outside the web app runtime):
  python3 -m venv /tmp/vivus-melotts
  /tmp/vivus-melotts/bin/pip install "setuptools<81" \
    "git+https://github.com/myshell-ai/MeloTTS.git"
  /tmp/vivus-melotts/bin/python scripts/generate-acls-voices.py
"""

from pathlib import Path

from melo.api import TTS


OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public" / "acls-training" / "audio" / "vf-01"

LINES = {
    "scenario-timeout": "시나리오 제한 시간이 종료되었습니다. 수행 결과를 확인합니다.",
    # Spell out the bed number so Korean G2P reads it as "삼 번", not "세 번".
    "alarm-reminder": "삼 번 병상 알람입니다. 즉시 환자를 확인해 주세요.",
    "check-reminder": "환자 반응과 호흡, 맥박을 확인해야 합니다.",
    "response-reminder": "맥박이 없습니다. 코드 블루 호출과 흉부압박이 필요합니다.",
    "cpr-reminder": "쇼크 후 즉시 흉부압박을 재개하세요.",
    "team-arrived": "코드팀 도착했습니다. 역할을 지시해 주세요.",
    "patient-motionless": "환자가 침상에 누워 있고 움직임이 없습니다.",
    "no-response": "환자분, 괜찮으세요? 반응 없습니다.",
    "no-pulse": "정상 호흡 없고 맥박 촉지되지 않습니다.",
    "call-code": "코드 블루 호출합니다. 제세동기 가져오세요.",
    "start-cpr": "흉부압박 시작합니다.",
    "resume-cpr": "압박 재개했습니다.",
    "pads-ready": "패드 부착 완료. 리듬 확인 가능합니다.",
    "oxygen-ready": "산소와 앰부백 준비됐습니다.",
    "rhythm-check": "압박 중단. 리듬 확인합니다.",
    "check-again": "리듬을 다시 확인하세요.",
    "vf-shockable": "브이에프입니다. 쇼커블 리듬입니다.",
    "charging": "이백 줄 충전합니다. 압박 계속하세요.",
    "charge-complete": "이백 줄 충전 완료.",
    "all-clear": "모두 물러나세요. 산소 떨어졌습니다. 모두 물러났습니다.",
}


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    model = TTS(language="KR", device="auto")
    speaker_id = model.hps.data.spk2id["KR"]

    for slug, text in LINES.items():
        output_path = OUTPUT_DIR / f"{slug}.wav"
        print(f"Generating {output_path.name}: {text}")
        model.tts_to_file(text, speaker_id, str(output_path), speed=1.08)

    print(f"Generated {len(LINES)} lines in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
