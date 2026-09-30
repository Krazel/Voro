# Inicio de música al continuar · 0.13.3 (1)

El usuario informa de que 0.13.2 parece haber eliminado el petardeo, pero al cerrar por completo y continuar una partida se oye primero una canción incorrecta que después desaparece.

Causa encontrada: el desbloqueo global de audio en pointerdown/keydown inicializa la música cuando started todavía es false. El click posterior del botón establece started y selecciona el entorno guardado. Con AVAudioPlayer, la canción del menú empieza inmediatamente y permanece durante los cuatro segundos de transición.

El botón de comenzar/continuar se identifica explícitamente. Su evento inicial deja la inicialización a la acción start, que ya selecciona el entorno antes de iniciar audio. Se conservan AVAudioPlayer, su sesión, canciones, transiciones normales, efectos y música de los demás gestos del menú. Quiet Stacks no se modifica.

Regresión: toque y teclado sobre Continuar no emiten comandos musicales hasta la acción start; la primera canción es la del entorno guardado. Los demás gestos del menú mantienen su música. 17 pruebas de audio y tipos correctos. Candidata 0.13.3(1), pendiente de CI y TestFlight interno. Confirmación acústica física de esta corrección pendiente.
