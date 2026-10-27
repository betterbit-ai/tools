/** Browser-only SVG sanitising and Canvas rendering. */

export class SvgRenderError extends Error {}

export interface RasterizeResult {
  blob: Blob;
  removedExternalResources: boolean;
}

export async function rasterizeSvg(
  markup: string,
  size: { width: number; height: number },
  background: 'transparent' | 'white',
): Promise<RasterizeResult> {
  const sanitised = sanitiseSvg(markup);
  const svgBlob = new Blob([sanitised.markup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    if (!context) throw new SvgRenderError('Canvas rendering is unavailable.');
    if (background === 'white') {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, size.width, size.height);
    }
    context.drawImage(image, 0, 0, size.width, size.height);
    const blob = await pngBlob(canvas);
    canvas.width = 1;
    canvas.height = 1;
    return { blob, removedExternalResources: sanitised.removedExternalResources };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Remove executable elements and URL-bearing external resources before rendering. */
function sanitiseSvg(markup: string): { markup: string; removedExternalResources: boolean } {
  const documentElement = new DOMParser().parseFromString(markup, 'image/svg+xml');
  if (
    documentElement.querySelector('parsererror') ||
    documentElement.documentElement.localName.toLowerCase() !== 'svg'
  ) {
    throw new SvgRenderError('The SVG markup could not be parsed.');
  }

  // Keep this raw check as well as the attribute walk below: DOMParser normalises
  // xlink attributes differently across engines, but the UI must still explain
  // why an externally linked asset is absent from the locally rendered PNG.
  let removedExternalResources = /(?:href|xlink:href)\s*=\s*["']?\s*(?:https?:|\/\/|file:|blob:)/iu.test(markup);
  for (const element of documentElement.querySelectorAll(
    'script, foreignObject, iframe, object, embed, audio, video',
  )) {
    element.remove();
  }
  for (const element of documentElement.querySelectorAll<SVGElement>('*')) {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      if ((name === 'href' || name === 'xlink:href') && !isLocalReference(value)) {
        element.removeAttribute(attribute.name);
        removedExternalResources = true;
      }
      if (name === 'style') {
        const safeStyle = removeExternalUrls(value);
        if (safeStyle !== value) {
          element.setAttribute(attribute.name, safeStyle);
          removedExternalResources = true;
        }
      }
    }
  }
  for (const style of documentElement.querySelectorAll('style')) {
    const safeText = removeExternalUrls(style.textContent ?? '').replace(/@import[^;]+;/giu, '');
    if (safeText !== style.textContent) {
      style.textContent = safeText;
      removedExternalResources = true;
    }
  }
  return { markup: new XMLSerializer().serializeToString(documentElement), removedExternalResources };
}

function isLocalReference(value: string): boolean {
  return value.startsWith('#') || /^data:image\//iu.test(value);
}

function removeExternalUrls(value: string): string {
  return value.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/giu, (whole, _quote, url: string) =>
    isLocalReference(url.trim()) ? whole : 'none',
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new SvgRenderError('The browser could not render this SVG.'));
    image.src = url;
  });
}

function pngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new SvgRenderError('PNG encoding failed.'))), 'image/png');
  });
}
