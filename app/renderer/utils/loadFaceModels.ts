// Loads face-api.js models via IPC file reads + fetch monkeypatching.
// Avoids unreliable custom protocol fetch in Electron's renderer sandbox.

const MODEL_FILES = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_tiny_model-weights_manifest.json',
  'face_landmark_68_tiny_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
]

// filename → Blob (in-memory)
const MODEL_BLOBS = new Map<string, Blob>()

async function prefetchModels() {
  if (MODEL_BLOBS.size > 0) return
  for (const filename of MODEL_FILES) {
    const bytes: Uint8Array | null = await window.api.readModelFile(filename)
    if (!bytes) throw new Error(`Face model file not found: ${filename}`)
    const isJson = filename.endsWith('.json')
    MODEL_BLOBS.set(filename, new Blob([bytes], { type: isJson ? 'application/json' : 'application/octet-stream' }))
  }
}

const BASE_URL = 'app://face-models'
let fetchPatched = false

function patchFetch() {
  if (fetchPatched) return
  fetchPatched = true
  const original = globalThis.fetch.bind(globalThis)
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input
      : input instanceof URL ? input.href
      : (input as Request).url
    // Intercept all app://face-models/* requests and serve from in-memory blobs
    if (url.startsWith(BASE_URL)) {
      const filename = url.slice(BASE_URL.length).replace(/^\//, '')
      const blob = MODEL_BLOBS.get(filename)
      if (blob) return new Response(blob, { status: 200 })
      return new Response('Not found', { status: 404 })
    }
    return original(input, init)
  }
}

export async function loadFaceModels(faceapi: typeof import('face-api.js')) {
  await prefetchModels()
  patchFetch()
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(BASE_URL),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(BASE_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(BASE_URL),
  ])
}
