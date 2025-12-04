import { useCallback, useEffect, useState } from 'react';

interface UseDocumentPiPOptions {
  width?: number;
  height?: number;
}

export function useDocumentPiP({ width = 300, height = 50 }: UseDocumentPiPOptions = {}) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  const copyStyles = (targetDoc: Document) => {
    Array.from(document.styleSheets).forEach((styleSheet) => {
      try {
        if (styleSheet.href) {
          const newLink = targetDoc.createElement('link');
          newLink.rel = 'stylesheet';
          newLink.href = styleSheet.href;
          targetDoc.head.appendChild(newLink);
        } else if (styleSheet.cssRules) {
          const newStyle = targetDoc.createElement('style');
          Array.from(styleSheet.cssRules).forEach((rule) => {
            newStyle.appendChild(targetDoc.createTextNode(rule.cssText));
          });
          targetDoc.head.appendChild(newStyle);
        }
      } catch (e) {
        console.warn('Não foi possível copiar o estilo:', e);
      }
    });
  };

  const setupWindow = (win: Window) => {
    copyStyles(win.document);

    if (document.documentElement.classList.contains('dark')) {
      win.document.documentElement.classList.add('dark');
    }

    win.document.body.className =
      'bg-background text-foreground flex items-center justify-center h-full m-0 overflow-hidden';

    const onBoundsClose = () => setPipWindow(null);
    win.addEventListener('pagehide', onBoundsClose);
    win.addEventListener('beforeunload', onBoundsClose);

    setPipWindow(win);
  };

  const openPiP = useCallback(async () => {
    if ('documentPictureInPicture' in window) {
      try {
        //@ts-expect-error experimental API
        const win = await window.documentPictureInPicture.requestWindow({
          width,
          height,
        });
        setupWindow(win);
        return;
      } catch (err) {
        console.warn('Falha ao abrir Document PiP, tentando fallback...', err);
      }
    }

    const left = window.screen.width - width - 50;
    const top = window.screen.height - height - 100;

    const win = window.open(
      '',
      'DevOpsTrackerPiP',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no`
    );

    if (win) {
      setupWindow(win);

      win.focus();
    } else {
      alert('Por favor, permita popups para usar o modo flutuante neste navegador.');
    }
  }, [width, height]);

  const closePiP = useCallback(() => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }
  }, [pipWindow]);

  useEffect(() => {
    return () => {
      if (pipWindow) pipWindow.close();
    };
  }, [pipWindow]);

  return { pipWindow, openPiP, closePiP };
}
