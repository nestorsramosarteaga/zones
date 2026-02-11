// ---------------------------
// Configuración de zonas
// ---------------------------

const PACE_ZONES = [
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

const HR_ZONES = [
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

function paceToSeconds(paceString) {
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

function secondsToPace(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// ---------------------------
// Cálculo de zonas
// ---------------------------

function calculatePaceZones(thresholdPaceSeconds) {
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

function calculateHRZones(thresholdHR, maxHR) {
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
// Renderizado HTML
// ---------------------------

function buildPaceRow(zone) {
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

function buildHRRow(zone) {
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

function renderResultsTable(paceZones, hrZones) {
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
// Generación de Excel
// ---------------------------

function buildPaceExcelData(thresholdPace, paceZones) {
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

function buildHRExcelData(thresholdHR, maxHR, hrZones) {
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

function downloadExcel(paceZones, hrZones, thresholdPace, thresholdHR, maxHR) {
  const workbook = XLSX.utils.book_new();

  const paceSheet = XLSX.utils.aoa_to_sheet(
    buildPaceExcelData(thresholdPace, paceZones),
  );
  paceSheet["!cols"] = [{ wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, paceSheet, "Zonas Pace");

  const hrSheet = XLSX.utils.aoa_to_sheet(
    buildHRExcelData(thresholdHR, maxHR, hrZones),
  );
  hrSheet["!cols"] = [
    { wch: 10 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(workbook, hrSheet, "Zonas HR");

  const fileName = `zonas_entrenamiento_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// ---------------------------
// Manejo del formulario (UI)
// ---------------------------

function validateInputs(thresholdPaceInput, thresholdHR, maxHR) {
  if (!thresholdPaceInput) {
    throw new Error("Por favor ingrese el Threshold Pace");
  }

  if (Number.isNaN(thresholdHR) || thresholdHR <= 0) {
    throw new Error("Por favor ingrese un Threshold HR válido");
  }

  if (Number.isNaN(maxHR) || maxHR <= 0) {
    throw new Error("Por favor ingrese un Max HR válido");
  }

  if (thresholdHR > maxHR) {
    throw new Error("El Threshold HR no puede ser mayor que Max HR");
  }
}

function handleFormSubmit(event, elements) {
  event.preventDefault();

  const { resultContainer, downloadBtn } = elements;

  try {
    const thresholdPaceInput = document
      .getElementById("thresholdPace")
      .value.trim();
    const thresholdHR = parseFloat(
      document.getElementById("thresholdHR").value,
    );
    const maxHR = parseFloat(document.getElementById("maxHR").value);

    validateInputs(thresholdPaceInput, thresholdHR, maxHR);

    const thresholdPaceSeconds = paceToSeconds(thresholdPaceInput);

    const paceZones = calculatePaceZones(thresholdPaceSeconds);
    const hrZones = calculateHRZones(thresholdHR, maxHR);

    resultContainer.innerHTML = renderResultsTable(paceZones, hrZones);

    downloadBtn.style.display = "block";
    downloadBtn.onclick = () => {
      downloadExcel(paceZones, hrZones, thresholdPaceInput, thresholdHR, maxHR);
    };
  } catch (error) {
    resultContainer.innerHTML = `<div class="error">${error.message}</div>`;
    downloadBtn.style.display = "none";
  }
}

function initTrainingCalculator() {
  const form = document.getElementById("trainingForm");
  const resultContainer = document.getElementById("result");
  const downloadBtn = document.getElementById("downloadBtn");

  if (!form || !resultContainer || !downloadBtn) {
    console.warn(
      "[TrainingCalculator] Elementos del DOM no encontrados. Revisa el HTML.",
    );
    return;
  }

  form.addEventListener("submit", (event) =>
    handleFormSubmit(event, { resultContainer, downloadBtn }),
  );
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initTrainingCalculator);
