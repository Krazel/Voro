# Impactos diferenciados — candidata 0.6.8 (1), sin subir

Se reutiliza SfxPlayer y el bus de efectos0.055. Daño real: golpe orgánico triangular320→130Hz,300ms. Consumo de escudo: seno agudo1340→1860→360Hz,380ms, algo más suave. El escudo retorna antes de la rama de daño, por lo que nunca dispara ambos efectos para un golpe absorbido. Invulnerabilidad, colisiones inofensivas y proyectiles ya comestibles no emiten impacto.

Una sola voz de impacto, mínimo420ms entre inicios, ataque suave y cola hasta cero. Silencio, pausa, ajustes, adaptaciones y pérdida de foco cierran el bus; los impactos activos se apagan con12ms de salida. Un contexto interrumpido descarta la voz para no reproducir golpes antiguos al volver. Sin nuevos assets de runtime, cargas, filtros o cola de eventos. La música y los cinco sonidos de comer no cambian.

WAV de evidencia renderizados con el mismo código en OfflineAudioContext a48kHz, ganancia real del juego: damage.wav y shield.wav. music-damage-shield.wav: música del microscopio a ganancia0.42, daño a2s, escudo a4s y daño a6s. levels.json: picos0.0370/0.0263, RMS0.00410/0.00392, extremos cero, cero voces al terminar; mezcla pico0.1074 sin saturación. No son grabaciones de altavoces físicos.

19 pruebas focalizadas de SFX/recuperación/eventos; suite global238/238 junto con restauración del final, tipos y build/assets correctos. Pendiente escucha en iPhone/iPad físico. Se conserva +1 resto orbital por zona (radio10.2–13.8, sin segundo aumento) y desaparición inversa de c5a2c86. TestFlight instalado sigue0.6.7(1), sin estos cambios.
