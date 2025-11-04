/**
 * 훈련 결과 데이터를 기반으로 각 메트릭의 점수와 상세 퍼센티지를 계산
 */

interface CompressionResult {
  timestamp: number;
  position: { x: number; y: number };
  maxDepth: number;
  rate: { interval: number; status?: string } | null;
  duration: number;
  positionCorrect: boolean;
  depthCorrect: boolean;
  rateCorrect: boolean;
  success: boolean;
}

interface VentilationResult {
  timestamp: number;
  volume: number;
  duration: number;
  volumeCorrect: boolean;
  success: boolean;
}

export interface MetricResult {
  score: number;
  [key: string]: number | string;
}

export interface TrainingMetrics {
  compressionDepth: MetricResult;
  compressionRelease: MetricResult;
  compressionRate: MetricResult;
  handPosition: MetricResult;
  compressionCount: MetricResult;
  compressionFraction: MetricResult;
  ventilationVolume: MetricResult;
  ventilationCount: MetricResult;
}

export function calculateMetrics(compressionResults: CompressionResult[], ventilationResults: VentilationResult[]): TrainingMetrics {
  const metrics = {
    compressionDepth: calculateCompressionDepth(compressionResults),
    compressionRelease: calculateCompressionRelease(compressionResults),
    compressionRate: calculateCompressionRate(compressionResults),
    handPosition: calculateHandPosition(compressionResults),
    compressionCount: calculateCompressionCount(compressionResults),
    compressionFraction: calculateCompressionFraction(compressionResults),
    ventilationVolume: calculateVentilationVolume(ventilationResults),
    ventilationCount: calculateVentilationCount(ventilationResults),
  };

  return metrics;
}

// 1. Compression Depth
function calculateCompressionDepth(compressions: CompressionResult[]): MetricResult {
  if (compressions.length === 0) {
    return { score: 0, tooDeep: 0, good: 0, tooShallow: 0 };
  }

  let tooDeep = 0;
  let good = 0;
  let tooShallow = 0;

  compressions.forEach(c => {
    if (c.maxDepth < 33) {
      tooShallow++;
    } else if (c.maxDepth > 67) {
      tooDeep++;
    } else {
      good++;
    }
  });

  const total = compressions.length;
  const score = Math.round((good / total) * 100);

  return {
    score,
    tooDeep: Math.round((tooDeep / total) * 100),
    good: Math.round((good / total) * 100),
    tooShallow: Math.round((tooShallow / total) * 100),
  };
}

// 2. Compression Release (압박 해제 - 현재는 depth 기반으로 추정)
function calculateCompressionRelease(compressions: CompressionResult[]): MetricResult {
  if (compressions.length === 0) {
    return { score: 0, good: 0, incomplete: 0 };
  }

  // 완전 해제는 깊이가 적정 범위 내에 있고 duration이 적절한 경우로 추정
  let good = 0;
  let incomplete = 0;

  compressions.forEach(c => {
    // 압박 시간이 0.3초 이상이고 깊이가 적정 범위면 good
    if (c.duration && c.duration >= 0.3 && c.maxDepth >= 33 && c.maxDepth <= 67) {
      good++;
    } else {
      incomplete++;
    }
  });

  const total = compressions.length;
  const score = Math.round((good / total) * 100);

  return {
    score,
    good: Math.round((good / total) * 100),
    incomplete: Math.round((incomplete / total) * 100),
  };
}

// 3. Compression Rate
function calculateCompressionRate(compressions: CompressionResult[]): MetricResult {
  if (compressions.length === 0) {
    return { score: 0, tooSlow: 0, good: 0, tooFast: 0 };
  }

  let tooSlow = 0;
  let good = 0;
  let tooFast = 0;

  compressions.forEach(c => {
    if (!c.rate || !c.rate.interval) {
      // 첫 번째 압박은 rate가 없으므로 good으로 처리
      good++;
      return;
    }

    if (c.rate.interval < 0.4) {
      tooFast++;
    } else if (c.rate.interval > 0.8) {
      tooSlow++;
    } else {
      good++;
    }
  });

  const total = compressions.length;
  const score = Math.round((good / total) * 100);

  return {
    score,
    tooSlow: Math.round((tooSlow / total) * 100),
    good: Math.round((good / total) * 100),
    tooFast: Math.round((tooFast / total) * 100),
  };
}

// 4. Hand Position
function calculateHandPosition(compressions: CompressionResult[]): MetricResult {
  if (compressions.length === 0) {
    return { score: 0, incorrectAbdomen: 0, good: 0, incorrectLR: 0 };
  }

  let incorrectAbdomen = 0;
  let good = 0;
  let incorrectLR = 0;

  compressions.forEach(c => {
    if (!c.position) {
      good++;
      return;
    }

    // 심장 위치는 x: 50, y: 40
    const heartX = 50;
    const heartY = 40;
    const dx = c.position.x - heartX;
    const dy = c.position.y - heartY;

    if (c.positionCorrect) {
      good++;
    } else {
      // y가 크면 복부 방향 (Abdomen), x가 많이 벗어나면 좌우 (LR)
      if (dy > 15) {
        incorrectAbdomen++;
      } else {
        incorrectLR++;
      }
    }
  });

  const total = compressions.length;
  const score = Math.round((good / total) * 100);

  return {
    score,
    incorrectAbdomen: Math.round((incorrectAbdomen / total) * 100),
    good: Math.round((good / total) * 100),
    incorrectLR: Math.round((incorrectLR / total) * 100),
  };
}

// 5. Compression Count
function calculateCompressionCount(compressions: CompressionResult[]): MetricResult {
  const count = compressions.length;
  const target = 30;

  let tooFew = 0;
  let good = 0;
  let tooMany = 0;

  if (count < target) {
    tooFew = 100;
    good = 0;
  } else if (count === target) {
    good = 100;
  } else {
    // 30회 이상이면 good 비율 감소
    good = Math.round((target / count) * 100);
    tooMany = 100 - good;
  }

  const score = good;

  return {
    score,
    tooFew,
    good,
    tooMany,
  };
}

// 6. Compression Fraction (전체 시간 대비 압박 시간 비율)
function calculateCompressionFraction(compressions: CompressionResult[]): MetricResult {
  if (compressions.length === 0) {
    return { score: 0, label: "No Metric Criteria" };
  }

  // 첫 압박부터 마지막 압박까지의 총 시간
  const firstTime = compressions[0]?.timestamp || 0;
  const lastTime = compressions[compressions.length - 1]?.timestamp || 0;
  const totalTime = (lastTime - firstTime) / 1000; // 초 단위

  // 각 압박의 duration 합계
  const totalCompressionTime = compressions.reduce((sum, c) => sum + (c.duration || 0), 0);

  if (totalTime === 0) {
    return { score: 0, label: "No Metric Criteria" };
  }

  const fraction = (totalCompressionTime / totalTime) * 100;
  const score = Math.round(fraction);

  return {
    score,
    label: "No Metric Criteria",
  };
}

// 7. Ventilation Volume
function calculateVentilationVolume(ventilations: VentilationResult[]): MetricResult {
  if (ventilations.length === 0) {
    return { score: 0, tooLittle: 0, good: 0, tooMuch: 0 };
  }

  let tooLittle = 0;
  let good = 0;
  let tooMuch = 0;

  ventilations.forEach(v => {
    if (v.volume < 33) {
      tooLittle++;
    } else if (v.volume > 67) {
      tooMuch++;
    } else {
      good++;
    }
  });

  const total = ventilations.length;
  const score = Math.round((good / total) * 100);

  return {
    score,
    tooLittle: Math.round((tooLittle / total) * 100),
    good: Math.round((good / total) * 100),
    tooMuch: Math.round((tooMuch / total) * 100),
  };
}

// 8. Ventilation Count
function calculateVentilationCount(ventilations: VentilationResult[]): MetricResult {
  const count = ventilations.length;
  const target = 2;

  let tooFew = 0;
  let good = 0;
  let tooMany = 0;

  if (count < target) {
    tooFew = 100;
    good = 0;
  } else if (count === target) {
    good = 100;
  } else {
    good = Math.round((target / count) * 100);
    tooMany = 100 - good;
  }

  const score = good;

  return {
    score,
    tooFew,
    good,
    tooMany,
  };
}

