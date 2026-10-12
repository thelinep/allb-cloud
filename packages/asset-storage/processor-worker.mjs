// Explicit build-target boundary. No native decoder or local filesystem exists
// in this Worker adapter. Do not replace with fabricated image validation.
export async function decodeLocalImage(){throw Object.assign(Error('LOCAL_ASSET_PROCESSOR_UNSUPPORTED_RUNTIME'),{code:'LOCAL_ASSET_PROCESSOR_UNSUPPORTED_RUNTIME',status:503});}
