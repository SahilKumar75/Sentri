import { API_BASE_URL, extractErrorMessage, getNetworkMessage } from './http-client';

export async function uploadTimetableScreenshot(payload) {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: payload.uri,
      name: payload.name,
      type: payload.mimeType,
    });
    formData.append('sourceHint', payload.sourceHint);
    if (payload.sourceNotes) {
      formData.append('sourceNotes', payload.sourceNotes);
    }

    const response = await fetch(`${API_BASE_URL}/timetable-batches/uploads`, {
      method: 'POST',
      body: formData,
    });

    const rawText = await response.text();
    const data = rawText ? JSON.parse(rawText) : {};

    if (!response.ok) {
      return {
        ok: false,
        message: extractErrorMessage(data, 'Timetable upload failed.'),
      };
    }

    return {
      ok: true,
      batchId: data.id,
      sourceImageName: data.sourceImageName,
      status: data.status,
      createdAt: data.createdAt,
    };
  } catch (error) {
    return {
      ok: false,
      message: getNetworkMessage(error),
    };
  }
}

export async function getTimetableBatchStatus(batchId) {
  try {
    const response = await fetch(`${API_BASE_URL}/timetable-batches/${batchId}`);
    const rawText = await response.text();
    const data = rawText ? JSON.parse(rawText) : {};

    if (!response.ok) {
      return {
        ok: false,
        message: extractErrorMessage(data, 'Could not load the latest parser status.'),
      };
    }

    return {
      ok: true,
      batchId: data.id,
      sourceImageName: data.sourceImageName,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      extractionConfidence: data.extractionConfidence ?? undefined,
      entryCount: Array.isArray(data.entries) ? data.entries.length : 0,
    };
  } catch (error) {
    return {
      ok: false,
      message: getNetworkMessage(error),
    };
  }
}

export async function listTimetableUploadHistory(limit = 4) {
  try {
    const response = await fetch(`${API_BASE_URL}/timetable-batches`);
    const rawText = await response.text();
    const data = rawText ? JSON.parse(rawText) : [];

    if (!response.ok) {
      return {
        ok: false,
        message: extractErrorMessage(data, 'Could not load recent timetable uploads.'),
      };
    }

    const uploads = Array.isArray(data)
      ? data.slice(0, limit).map((item) => ({
          batchId: item.id,
          imageName: item.sourceImageName ?? undefined,
          status: item.status,
          createdAt: item.createdAt ?? undefined,
          updatedAt: item.updatedAt ?? undefined,
          entryCount: item.entryCount ?? 0,
        }))
      : [];

    return { ok: true, uploads };
  } catch (error) {
    return {
      ok: false,
      message: getNetworkMessage(error),
    };
  }
}
