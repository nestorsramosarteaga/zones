// Funciones y datos puros reutilizables en cliente, servidor y tests

// ---------------------------
// Configuración de zonas
// ---------------------------

export const PACE_ZONES = [
  {
    number: 1,
    name: "Recovery",
    minPercent: 0,
    maxPercent: 77.5,
    description: "Recuperación",
  },
  {
    number: 2,
    name: "Aerobic",
    minPercent: 77.5,
    maxPercent: 87.7,
    description: "Aeróbico",
  },
  {
    number: 3,
    name: "Tempo",
    minPercent: 87.8,
    maxPercent: 94.3,
    description: "Tempo",
  },
  {
    number: 4,
    name: "Umbral",
    minPercent: 94.4,
    maxPercent: 100,
    description: "Umbral",
  },
  {
    number: 5,
    name: "Vo2 Max",
    minPercent: 100.1,
    maxPercent: 103.4,
    description: "Vo2 Máximo",
  },
  {
    number: 6,
    name: "Aerobic Capacity",
    minPercent: 103.5,
    maxPercent: 111.5,
    description: "Capacidad Aeróbica",
  },
  {
    number: 7,
    name: "Sprint",
    minPercent: 112.5,
    maxPercent: null,
    description: "Sprint",
  },
];

export const HR_ZONES = [
  {
    number: 1,
    name: "Recovery",
    minPercent: 0,
    maxPercent: 79,
    description: "Recuperación",
  },
  {
    number: 2,
    name: "Aerobic",
    minPercent: 80,
    maxPercent: 90,
    description: "Aeróbico",
  },
  {
    number: 3,
    name: "Tempo",
    minPercent: 91,
    maxPercent: 98,
    description: "Tempo",
  },
  {
    number: 4,
    name: "Umbral",
    minPercent: 99,
    maxPercent: 100,
    description: "Umbral",
  },
  {
    number: 5,
    name: "Vo2 Max",
    minPercent: 101,
    maxPercent: 103.4,
    description: "Vo2 Máximo",
  },
  {
    number: 6,
    name: "Aerobic Capacity",
    minPercent: 103.5,
    maxPercent: 111.5,
    description: "Capacidad Aeróbica",
  },
  {
    number: 7,
    name: "Sprint",
    minPercent: 111.6,
    maxPercent: null,
    description: "Sprint",
  },
];

// ---------------------------
// Utilidades de formato
// ---------------------------

export function paceToSeconds(paceString) {
  const parts = paceString.split(":");
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);

  if (
    parts.length !== 2 ||
    Number.isNaN(minutes) ||
    Number.isNaN(seconds) ||
    seconds < 0 ||
    seconds >= 60
  ) {
    throw new Error("Formato de Pace inválido. Use mm:ss");
  }

  return minutes * 60 + seconds;
}

export function secondsToPace(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ---------------------------
// Cálculo de zonas
// ---------------------------

export function calculatePaceZones(thresholdPaceSeconds) {
  return PACE_ZONES.map((zone) => {
    const paceAtMaxPercent =
      zone.maxPercent === null
        ? null
        : thresholdPaceSeconds / (zone.maxPercent / 100);

    const paceAtMinPercent =
      zone.minPercent === 0
        ? null
        : thresholdPaceSeconds / (zone.minPercent / 100);

    const minPace =
      paceAtMaxPercent === null ? null : secondsToPace(paceAtMaxPercent);
    const maxPace =
      zone.minPercent === 0 || paceAtMinPercent === null
        ? "∞"
        : secondsToPace(paceAtMinPercent);

    return {
      ...zone,
      minPace,
      maxPace,
      percentage: `${zone.minPercent}% - ${
        zone.maxPercent === null ? "∞" : `${zone.maxPercent}%`
      }`,
    };
  });
}

export function calculateHRZones(thresholdHR, maxHR) {
  return HR_ZONES.map((zone) => {
    const rawMinBPM = (zone.minPercent / 100) * thresholdHR;
    const rawMaxBPM =
      zone.maxPercent === null ? maxHR : (zone.maxPercent / 100) * thresholdHR;

    const minBPM = Math.round(rawMinBPM);
    const maxBPM = Math.min(Math.round(rawMaxBPM), maxHR);

    return {
      ...zone,
      minBPM,
      maxBPM,
      percentage: `${zone.minPercent}% - ${
        zone.maxPercent === null ? "Max HR" : `${zone.maxPercent}%`
      }`,
    };
  });
}

// ---------------------------
// Renderizado HTML (puro)
// ---------------------------

export function buildPaceRow(zone) {
  let paceRange;

  if (zone.maxPercent === null) {
    // Z7 Sprint
    paceRange = `< ${zone.minPace}`;
  } else if (zone.minPercent === 0) {
    // Z1 Recovery - sin límite superior
    paceRange = `${zone.minPace} y más lento`;
  } else {
    // Otras zonas: de más lento a más rápido
    paceRange = `${zone.maxPace} - ${zone.minPace}`;
  }

  return `
    <tr>
      <td>Z${zone.number}</td>
      <td>${zone.description}</td>
      <td>${zone.percentage}</td>
      <td>${paceRange}</td>
    </tr>
  `;
}

export function buildHRRow(zone) {
  const hrRange = `${zone.minBPM} - ${zone.maxBPM}`;
  return `
    <tr>
      <td>Z${zone.number}</td>
      <td>${zone.description}</td>
      <td>${zone.percentage}</td>
      <td>${hrRange}</td>
    </tr>
  `;
}

export function renderResultsTable(paceZones, hrZones) {
  const paceRowsHtml = paceZones.map(buildPaceRow).join("");
  const hrRowsHtml = hrZones.map(buildHRRow).join("");

  return `
    <h2>Reporte de Zonas de Entrenamiento</h2>

    <h3>Zonas por Pace</h3>
    <table class="zones-table">
      <thead>
        <tr>
          <th>Zona</th>
          <th>Nombre</th>
          <th>Rango (%)</th>
          <th>Pace (min/km)</th>
        </tr>
      </thead>
      <tbody>
        ${paceRowsHtml}
      </tbody>
    </table>

    <h3>Zonas por Frecuencia Cardíaca</h3>
    <table class="zones-table">
      <thead>
        <tr>
          <th>Zona</th>
          <th>Nombre</th>
          <th>Rango (%)</th>
          <th>HR (bpm)</th>
        </tr>
      </thead>
      <tbody>
        ${hrRowsHtml}
      </tbody>
    </table>
  `;
}

// ---------------------------
// Generación de datos para Excel
// ---------------------------

export function buildPaceExcelData(thresholdPace, paceZones) {
  const data = [
    ["Zonas de Entrenamiento por Pace"],
    ["Threshold Pace (min/km)", thresholdPace],
    [],
    ["Zona", "Nombre", "Rango (%)", "Rango Pace (min/km)"],
  ];

  paceZones.forEach((zone) => {
    let paceRange;

    if (zone.maxPercent === null) {
      paceRange = `< ${zone.minPace}`;
    } else if (zone.minPercent === 0) {
      paceRange = `${zone.minPace} y más lento`;
    } else {
      paceRange = `${zone.maxPace} - ${zone.minPace}`;
    }

    data.push([
      `Z${zone.number}`,
      zone.description,
      zone.percentage,
      paceRange,
      "",
    ]);
  });

  return data;
}

export function buildHRExcelData(thresholdHR, maxHR, hrZones) {
  const data = [
    ["Zonas de Entrenamiento por Frecuencia Cardíaca"],
    ["Threshold HR (bpm)", thresholdHR],
    ["Max HR (bpm)", maxHR],
    [],
    ["Zona", "Nombre", "Rango (%)", "HR Min (bpm)", "HR Max (bpm)"],
  ];

  hrZones.forEach((zone) => {
    data.push([
      `Z${zone.number}`,
      zone.description,
      zone.percentage,
      zone.minBPM,
      zone.maxBPM,
    ]);
  });

  return data;
}

