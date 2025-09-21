import React, { useState, useRef, useCallback, createContext, useContext, useEffect } from 'react';

type Direction = 'horizontal' | 'vertical';

interface ResizablePanelData {
    ref: React.RefObject<HTMLDivElement>;
    minSize: number; // As a percentage
}

interface ResizablePanelGroupContextProps {
  id: string;
  direction: Direction;
  registerPanel: (id: string, data: ResizablePanelData) => void;
  registerHandle: (id: string) => void;
  startDragging: (id: string, event: React.MouseEvent | React.TouchEvent) => void;
}

const ResizablePanelGroupContext = createContext<ResizablePanelGroupContextProps | null>(null);

export const ResizablePanelGroup: React.FC<{ direction: Direction; children: React.ReactNode; className?: string }> = ({ direction, children, className }) => {
  const [id] = useState(() => `group-${crypto.randomUUID()}`);
  const draggingHandleId = useRef<string | null>(null);
  
  const panelData = useRef<Record<string, ResizablePanelData>>({});
  const panelIds = useRef<string[]>([]);
  const handleIds = useRef<string[]>([]);
  const isHorizontal = direction === 'horizontal';

  const registerPanel = useCallback((panelId: string, data: ResizablePanelData) => {
    panelData.current[panelId] = data;
    if (!panelIds.current.includes(panelId)) {
        panelIds.current.push(panelId);
    }
  }, []);

  const registerHandle = useCallback((handleId: string) => {
    if (!handleIds.current.includes(handleId)) {
        handleIds.current.push(handleId);
    }
  }, []);

  const onDragging = useCallback((event: MouseEvent | TouchEvent) => {
    if (!draggingHandleId.current) return;

    const handleIndex = handleIds.current.indexOf(draggingHandleId.current);
    if (handleIndex === -1) return;

    const prevPanelId = panelIds.current[handleIndex];
    const nextPanelId = panelIds.current[handleIndex + 1];

    const prevPanelInfo = panelData.current[prevPanelId];
    const nextPanelInfo = panelData.current[nextPanelId];

    if (!prevPanelInfo?.ref.current || !nextPanelInfo?.ref.current) return;
    
    const prevPanel = prevPanelInfo.ref.current;
    const nextPanel = nextPanelInfo.ref.current;
    const group = prevPanel.parentElement;
    if (!group) return;

    const groupRect = group.getBoundingClientRect();
    const groupSize = isHorizontal ? groupRect.width : groupRect.height;
    
    const minPrevSizePx = (prevPanelInfo.minSize / 100) * groupSize;
    const minNextSizePx = (nextPanelInfo.minSize / 100) * groupSize;
    
    const clientPos = 'touches' in event 
        ? (isHorizontal ? event.touches[0].clientX : event.touches[0].clientY) 
        : (isHorizontal ? event.clientX : event.clientY);

    const prevPanelRect = prevPanel.getBoundingClientRect();
    const startEdge = isHorizontal ? prevPanelRect.left : prevPanelRect.top;
    
    let newPrevSize = clientPos - startEdge;
    const combinedSize = (isHorizontal ? prevPanel.offsetWidth + nextPanel.offsetWidth : prevPanel.offsetHeight + nextPanel.offsetHeight);
    
    if (newPrevSize < minPrevSizePx) {
        newPrevSize = minPrevSizePx;
    } else if (combinedSize - newPrevSize < minNextSizePx) {
        newPrevSize = combinedSize - minNextSizePx;
    }
    
    const newNextSize = combinedSize - newPrevSize;

    const prevFlex = parseFloat(prevPanel.style.flexGrow || '1');
    const nextFlex = parseFloat(nextPanel.style.flexGrow || '1');
    const totalFlex = prevFlex + nextFlex;

    if (combinedSize > 0) {
      const newPrevFlex = (newPrevSize / combinedSize) * totalFlex;
      const newNextFlex = (newNextSize / combinedSize) * totalFlex;

      prevPanel.style.flexGrow = `${newPrevFlex}`;
      nextPanel.style.flexGrow = `${newNextFlex}`;
    }
  }, [isHorizontal]);

  const stopDragging = useCallback(() => {
    draggingHandleId.current = null;
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', onDragging);
    window.removeEventListener('touchmove', onDragging);
    window.removeEventListener('mouseup', stopDragging);
    window.removeEventListener('touchend', stopDragging);
  }, [onDragging]);

  const startDragging = useCallback((handleId: string, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    draggingHandleId.current = handleId;
    document.body.style.cursor = isHorizontal ? 'ew-resize' : 'ns-resize';
    window.addEventListener('mousemove', onDragging);
    window.addEventListener('touchmove', onDragging);
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchend', stopDragging);
  }, [isHorizontal, onDragging, stopDragging]);

  const contextValue = { id, direction, registerPanel, registerHandle, startDragging };
  
  return (
    <ResizablePanelGroupContext.Provider value={contextValue}>
      <div className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} w-full h-full ${className}`}>
        {children}
      </div>
    </ResizablePanelGroupContext.Provider>
  );
};

export const ResizablePanel: React.FC<{ children: React.ReactNode; defaultSize?: number; minSize?: number, className?: string }> = ({ children, defaultSize = 50, minSize = 10, className }) => {
  const context = useContext(ResizablePanelGroupContext);
  const ref = useRef<HTMLDivElement>(null);
  const [id] = useState(() => `panel-${crypto.randomUUID()}`);
  
  if (!context) throw new Error("ResizablePanel must be used within a ResizablePanelGroup");
  
  useEffect(() => {
    context.registerPanel(id, { ref, minSize });
  }, [id, context, minSize]);

  return <div ref={ref} className={`overflow-hidden ${className}`} style={{ flexGrow: defaultSize, flexBasis: 0, minWidth: 0, minHeight: 0 }}>{children}</div>;
};

export const ResizableHandle: React.FC = () => {
    const context = useContext(ResizablePanelGroupContext);
    const [id] = useState(() => `handle-${crypto.randomUUID()}`);
    const [isActive, setIsActive] = useState(false);
    
    if (!context) throw new Error("ResizableHandle must be used within a ResizablePanelGroup");
    
    useEffect(() => {
        context.registerHandle(id);
    }, [id, context]);

    const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
        context.startDragging(id, e);
        setIsActive(true);
    };
    
    const handleInteractionEnd = () => {
        setIsActive(false);
    };

    useEffect(() => {
        window.addEventListener('mouseup', handleInteractionEnd);
        window.addEventListener('touchend', handleInteractionEnd);
        return () => {
          window.removeEventListener('mouseup', handleInteractionEnd);
          window.removeEventListener('touchend', handleInteractionEnd);
        };
    }, []);

    const sizeClass = context.direction === 'horizontal' ? 'w-2 h-full' : 'h-2 w-full';
    const cursorClass = context.direction === 'horizontal' ? 'cursor-ew-resize' : 'cursor-ns-resize';

    return (
        <div 
            className={`resize-handle transition-colors ${sizeClass} ${cursorClass}`}
            data-state={isActive ? 'active' : 'inactive'}
            onMouseDown={handleInteractionStart}
            onTouchStart={handleInteractionStart}
        />
    );
};
