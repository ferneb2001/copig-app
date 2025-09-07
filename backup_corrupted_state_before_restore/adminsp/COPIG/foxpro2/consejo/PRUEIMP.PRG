procedure prueimp
* programa para prueba de impresion codigos letra distintos
set console off
set printer on
set device to printer
?
?
?
?CHR(027)+CHR(045)+'1'
*??CHR(027)+CHR(040)+CHR(115)+CHR(049)+CHR(080)
*??CHR(27)+CHR(040)+CHR(115)+'6'+CHR(072)
*??CHR(27)+CHR(040)+CHR(115)+'18'+CHR(086)
*??CHR(027)+CHR(040)+CHR(115)+CHR(051)+CHR(066) 
*??CHR(027)+CHR(040)+CHR(115)+CHR(052)+CHR(049)+CHR(048)+CHR(084) 
? '     INGENIEROS  Y GEOLOGOS subrrayado'
?CHR(27)+CHR(045)+'0'
*??CHR(27)+CHR(040)+CHR(115)+'12'+CHR(086)
??'     letras normales 10 cpi '
*?chr(27)+chr(40)+chr(115)+'2'+chr(081)
*??'     letras letter quality '
*?chr(27)+chr(40)+chr(115)+'1'+chr(081)
*??'     letra normal de nuevo '
?' prueba de acentos  ¢¢£‚ ¡'
?
*?CHR(27)+CHR(040)+CHR(115)+'5'+CHR(072)
*??CHR(27)+CHR(040)+CHR(115)+'45'+CHR(086)
*?'        C A R A T U L A D O  '
*?
*?CHR(27)+CHR(040)+CHR(115)+'10'+CHR(072)
*??CHR(27)+CHR(040)+CHR(115)+'12'+CHR(086)
*??'     LETRA NORMAL  '
EJECT
set device to screen
set console on
set printer off