import * as XLSX from "xlsx";
import {
  paceToSeconds,
  calculatePaceZones,
  calculateHRZones,
  renderResultsTable,
  buildPaceExcelData,
  buildHRExcelData,
} from "../lib/trainingZones.js";

// ---------------------------
// Generación de Excel
// ---------------------------

function downloadExcel(paceZones, hrZones, thresholdPace, thresholdHR, maxHR) {
  if (typeof XLSX === "undefined" || !XLSX.utils) {
    alert(
      "No se pudo cargar la librería XLSX.\n" +
        "Revisa que el script del CDN se haya cargado correctamente.",
    );
    return;
  }

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
      try {
        downloadExcel(
          paceZones,
          hrZones,
          thresholdPaceInput,
          thresholdHR,
          maxHR,
        );
      } catch (error) {
        console.error("[TrainingCalculator] Error al generar Excel:", error);
        alert(
          "Ocurrió un error al generar el archivo Excel.\n" +
            (error?.message || "Revisa la consola del navegador para más detalles."),
        );
      }
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

