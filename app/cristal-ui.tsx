'use client';
import { t as tr } from './language.mjs';

import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UPGRADES } from './mutations.mjs';

export { AdaptationChoices } from './adaptation-constellation';
import { AdaptationChoices } from './adaptation-constellation';

export function CristalPreview({
  open,
  onClose,
  onProtagonist,
}: {
  open: boolean;
  onClose: () => void;
  onProtagonist?: (canvas: HTMLCanvasElement | null) => void;
}) {
  const offer = ['speed', 'digest', 'shield'];
  const [notice, setNotice] = useState('');
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent
        className="cristal-dialog cristal-preview"
        showCloseButton={false}
      >
        <div className="cristal-preview-top">
          <DialogTitle>{tr("Membrana · Cristal")}</DialogTitle>
          <button
            className="icon-button"
            aria-label={tr("Cerrar prueba de interfaz")}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <DialogDescription className="cristal-preview-note">{tr(" Prueba los botones. Tu partida no cambia. ")}</DialogDescription>
        <Tabs defaultValue="adaptation" onValueChange={() => setNotice('')}>
          <TabsList
            className="cristal-preview-tabs"
            aria-label={tr("Pantalla de prueba")}
          >
            <TabsTrigger value="adaptation">{tr("Mejoras")}</TabsTrigger>
            <TabsTrigger value="evolution">{tr("Evolución")}</TabsTrigger>
            <TabsTrigger value="pause">{tr("Pausa")}</TabsTrigger>
          </TabsList>
          <TabsContent value="adaptation" className="cristal-demo-adaptation">
            <p className="cristal-wordmark">{tr("VORO")}</p>
            <h2>{tr("La vida encuentra otra forma.")}</h2>
            <p className="cristal-subtitle">{tr("Elige una adaptación")}</p>
            <AdaptationChoices
              onProtagonist={onProtagonist}
              offer={offer}
              mutations={[]}
              onChoose={(id) =>
                setNotice(UPGRADES.find((u) => u.id === id)!.name)
              }
            />
            {tr(notice && (
              <output
                key={notice}
                className="cristal-demo-toast membrane-control"
              >{tr(" Adaptación integrada · ")}{tr(notice)}
              </output>
            ))}
          </TabsContent>
          <TabsContent value="evolution" className="cristal-demo-evolution">
            <p className="cristal-wordmark">{tr("VORO")}</p>
            <div className="cristal-demo-organism" aria-hidden="true">
              <span />
            </div>
            <h2>{tr("La marea te abre el camino")}</h2>
            <p className="cristal-stage-route">{tr(" ORILLA ")}<span aria-hidden="true">{tr("→")}</span>{tr(" MAR ")}</p>
          </TabsContent>
          <TabsContent value="pause" className="cristal-demo-pause">
            <p className="cristal-wordmark">{tr("VORO")}</p>
            <h2>{tr("Respira.")}</h2>
            <button
              className="primary-button membrane-control"
              onClick={onClose}
            >{tr(" Continuar ")}</button>
            <button
              className="primary-button membrane-control"
              onClick={onClose}
            >{tr(" Configuración ")}</button>
            <output className="cristal-demo-toast membrane-control">{tr(" Adaptación integrada ")}</output>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
