import { API_BASE_URL, extractErrorMessage, getNetworkMessage } from './http-client';

export type TimetableUploadResult =
  | {
      ok: true;
      batchId: number;
      sourceImageName?: string;
      status: string;
      createdAt?: string;
    }
  | {
      ok: false;
      message: string;
    };

export async function uploadTimetableScreenshot(payload: {
  uri: string;
  name: string;
  mimeType: string;
  sourceHint: string;
  sourceNotes?: string;
}): Promise<TimetableUploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: payload.uri,
      name: payload.name,
      type: payload.mimeType,
    } as unknown as Blob);
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
