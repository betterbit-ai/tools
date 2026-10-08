/**
 * Minimal typings for the pre-bundled WebAssembly build of libheif.
 * The package ships emscripten-generated `.d.ts` files for the low-level C
 * bindings only — the `HeifDecoder` / `HeifImage` wrapper we actually use is
 * defined in its JS glue and untyped, so it is declared here.
 *
 * Loaded with a dynamic `import()` from src/tools/heic-to-jpg/convert.ts, which
 * keeps the ~2 MB module out of the page's initial JavaScript.
 */
declare module 'libheif-js/libheif-wasm/libheif-bundle.mjs' {
  interface HeifImage {
    get_width(): number;
    get_height(): number;
    is_primary(): boolean;
    has_alpha_channel(): boolean;
    /** Fills `target.data` with interleaved RGBA; calls back with null on failure. */
    display(target: ImageData, done: (result: ImageData | null) => void): void;
    free(): void;
  }

  interface HeifDecoder {
    /** Top-level images in the file; empty when the bytes are not decodable HEIF. */
    decode(bytes: Uint8Array): HeifImage[];
  }

  export interface Libheif {
    HeifDecoder: new () => HeifDecoder;
    heif_get_version(): string;
  }

  /** Instantiates the module. Resolves synchronously because the wasm is inlined. */
  const factory: (options?: Record<string, unknown>) => Libheif | Promise<Libheif>;
  export default factory;
}
