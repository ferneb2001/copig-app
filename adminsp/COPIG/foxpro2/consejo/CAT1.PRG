procedure cat1
*listado de referancias para padrones
set talk off
set printer off
set device to screen
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PADRONES     '
close all
WCONT=0
DO WHILE WCONT < 5
    do imprime
    WCONT = WCONT+1
enddo    
@04,01 clear to 23,78
close all
return

procedure imprime
@23,01 clear to 23,78
   set console off
   set printer on
   set device to printer
   set printer to 'LPT1'
   ???chr(27)+chr(67)+chr(72)
*   ???chr(27)+chr(87)+CHR(1)
*    ???chr(27)+chr(50)
*    ???chr(27)+chr(80)
    ?
    ? ' COLEGIO COMPA¥IA DE MARIA '
    ? ' CATEQUESIS FAMILIAR  1995 '
    ? ' ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ '
    ?
    ? '	ORACION:     Se¤or Jes£s:'
    ? '                          T£ instru¡ste a los  ministros de tu  Iglesia para '
    ? '              que no buscaran ser servidos sino  servir a sus  hermanos, con-'
    ? '              c‚deles actuar con  eficacia, servir  con humildad y perseverar'
    ? '              en la oraci¢n.-'
    ? '                          Confirma siempre en la  caridad a  esta Iglesia pe-'
    ? '              regrina en la tierra, al Papa  JUAN  PABLO II, a nuestros obis-'
    ? '              pos C ndido y Jos‚ Mar¡a, al  Orden Episcopal, al Clero y a to-'
    ? '              do el Pueblo redimido por T¡.-'
    ? '                          T£ que vives y reinas por los siglos de los siglos.'
    ? '                                                             Am‚n.'
    ?
    ?
    ?
    ? ' COLEGIO COMPA¥IA DE MARIA '
    ? ' CATEQUESIS FAMILIAR  1995 '
    ? ' ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ '
    ?
    ? '	ORACION:     Se¤or Jes£s:'
    ? '                          T£ instru¡ste a los  ministros de tu  Iglesia para '
    ? '              que no buscaran ser servidos sino  servir a sus  hermanos, con-'
    ? '              c‚deles actuar con  eficacia, servir  con humildad y perseverar'
    ? '              en la oraci¢n.-'
    ? '                          Confirma siempre en la  caridad a  esta Iglesia pe-'
    ? '              regrina en la tierra, al Papa  JUAN  PABLO II, a nuestros obis-'
    ? '              pos C ndido y Jos‚ Mar¡a, al  Orden Episcopal, al Clero y a to-'
    ? '              do el Pueblo redimido por T¡.-'
    ? '                          T£ que vives y reinas por los siglos de los siglos.'
    ? '                                                             Am‚n.'
    ?
    ?
    ?
    ? ' COLEGIO COMPA¥IA DE MARIA '
    ? ' CATEQUESIS FAMILIAR  1995 '
    ? ' ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ '
    ?
    ? '	ORACION:     Se¤or Jes£s:'
    ? '                          T£ instru¡ste a los  ministros de tu  Iglesia para '
    ? '              que no buscaran ser servidos sino  servir a sus  hermanos, con-'
    ? '              c‚deles actuar con  eficacia, servir  con humildad y perseverar'
    ? '              en la oraci¢n.-'
    ? '                          Confirma siempre en la  caridad a  esta Iglesia pe-'
    ? '              regrina en la tierra, al Papa  JUAN  PABLO II, a nuestros obis-'
    ? '              pos C ndido y Jos‚ Mar¡a, al  Orden Episcopal, al Clero y a to-'
    ? '              do el Pueblo redimido por T¡.-'
    ? '                          T£ que vives y reinas por los siglos de los siglos.'
    ? '                                                             Am‚n.'
    ?
    ?
    ?
    ? ' COLEGIO COMPA¥IA DE MARIA '
    ? ' CATEQUESIS FAMILIAR  1995 '
    ? ' ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ '
    ?
    ? '	ORACION:     Se¤or Jes£s:'
    ? '                          T£ instru¡ste a los  ministros de tu  Iglesia para '
    ? '              que no buscaran ser servidos sino  servir a sus  hermanos, con-'
    ? '              c‚deles actuar con  eficacia, servir  con humildad y perseverar'
    ? '              en la oraci¢n.-'
    ? '                          Confirma siempre en la  caridad a  esta Iglesia pe-'
    ? '              regrina en la tierra, al Papa  JUAN  PABLO II, a nuestros obis-'
    ? '              pos C ndido y Jos‚ Mar¡a, al  Orden Episcopal, al Clero y a to-'
    ? '              do el Pueblo redimido por T¡.-'
    ? '                          T£ que vives y reinas por los siglos de los siglos.'
    ? '                                                             Am‚n.'
    EJECT
   set printer off
   set device to screen
   set safety on
@04,01 clear to 23,78
return


