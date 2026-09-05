'use client';
import { useState } from 'react';
import { Shuffle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UPGRADES, levelOf } from './mutations.mjs';

export function AdaptationChoices({
  offer,
  mutations,
  onChoose,
}: {
  offer: string[];
  mutations: string[];
  onChoose: (id: string) => void;
}) {
  return (
    <div className="mutation-choices cristal-choices">
      {offer.map((id) => {
        const upgrade = UPGRADES.find((item) => item.id === id)!;
        return (
          <button
            className="membrane-control"
            key={id}
            onClick={() => onChoose(id)}
          >
            <span
              className="mutation-art"
              aria-hidden="true"
              style={{
                backgroundPosition: `${(upgrade.artIndex % 5) * 25}% ${Math.floor(upgrade.artIndex / 5) * 50}%`,
              }}
            />
            <span className="cristal-choice-copy">
              <strong>{upgrade.name}</strong>
              <small>{upgrade.detail}</small>
              <em
                aria-label={`${levelOf(mutations, id)} de ${upgrade.max} adquiridas`}
              >
                {levelOf(mutations, id)} / {upgrade.max}
              </em>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function CristalPreview({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [offer, setOffer] = useState(['reach', 'digest', 'tentacles']);
  const [notice, setNotice] = useState('');
  const [rerolled, setRerolled] = useState(false);
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
            <button
              className="adaptation-reroll membrane-control"
              disabled={rerolled}
              onClick={() => {
                setOffer(['yield', 'speed', 'dash']);
                setRerolled(true);
                setNotice('');
              }}
            >
              <Shuffle size={16} />
              {rerolled ? 'Cambio utilizado' : 'Otras opciones · 1 gratis'}
            </button>
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
