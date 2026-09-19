'use client';
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
}: {
  open: boolean;
  onClose: () => void;
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
          <DialogTitle>Membrana · Cristal</DialogTitle>
          <button
            className="icon-button"
            aria-label="Cerrar prueba de interfaz"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <DialogDescription className="cristal-preview-note">
          Prueba los botones. Tu partida no cambia.
        </DialogDescription>
        <Tabs defaultValue="adaptation" onValueChange={() => setNotice('')}>
          <TabsList
            className="cristal-preview-tabs"
            aria-label="Pantalla de prueba"
          >
            <TabsTrigger value="adaptation">Mejoras</TabsTrigger>
            <TabsTrigger value="evolution">Evolución</TabsTrigger>
            <TabsTrigger value="pause">Pausa</TabsTrigger>
          </TabsList>
          <TabsContent value="adaptation" className="cristal-demo-adaptation">
            <p className="cristal-wordmark">VORO</p>
            <h2>La vida encuentra otra forma.</h2>
            <p className="cristal-subtitle">Elige una adaptación</p>
            <AdaptationChoices
              offer={offer}
              mutations={[]}
              onChoose={(id) =>
                setNotice(UPGRADES.find((u) => u.id === id)!.name)
              }
            />
            {notice && (
              <output
                key={notice}
                className="cristal-demo-toast membrane-control"
              >
                Adaptación integrada · {notice}
              </output>
            )}
          </TabsContent>
          <TabsContent value="evolution" className="cristal-demo-evolution">
            <p className="cristal-wordmark">VORO</p>
            <div className="cristal-demo-organism" aria-hidden="true">
              <span />
            </div>
            <h2>La marea te abre el camino</h2>
            <p className="cristal-stage-route">
              ORILLA <span aria-hidden="true">→</span> MAR
            </p>
          </TabsContent>
          <TabsContent value="pause" className="cristal-demo-pause">
            <p className="cristal-wordmark">VORO</p>
            <h2>Respira.</h2>
            <button
              className="primary-button membrane-control"
              onClick={onClose}
            >
              Continuar
            </button>
            <button
              className="primary-button membrane-control"
              onClick={onClose}
            >
              Configuración
            </button>
            <output className="cristal-demo-toast membrane-control">
              Adaptación integrada
            </output>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
