procedure prueiml
* programa para prueba de impresion codigos letra distintos
*  para impresora laser xerox
set console off
set printer on
set device to printer
?
?chr(027)+chr(069)
? 'Inicial     CONSEJO PROFESIONAL DE'
??chr(027)+chr(040)+chr(049)+chr(048)+chr(085)
? 'PC-8     INGENIEROS  Y GEOLOGOS     ‚¡¢£¤¥§¦       '
?'12345678901234567890123456789012345678901234567890123456789012345678901234567890'
?
??CHR(27)+CHR(038)+CHR(108)+'6'+CHR(068)
? '     CONSEJO PROFESIONAL DE                6lpp'
? '     INGENIEROS  Y GEOLOGOS     ‚¡¢£¤¥¦§'
? '     CONSEJO PROFESIONAL DE'
? '     INGENIEROS  Y GEOLOGOS     ‚¡¢£¤¥¦§'
? '     CONSEJO PROFESIONAL DE'
? '     INGENIEROS  Y GEOLOGOS     ‚¡¢£¤¥¦§'
?
??CHR(27)+CHR(038)+CHR(108)+'8'+CHR(068)
? '     CONSEJO PROFESIONAL DE                8lpp'
? '     INGENIEROS  Y GEOLOGOS     ‚¡¢£¤¥¦§'
? '     CONSEJO PROFESIONAL DE'
? '     INGENIEROS  Y GEOLOGOS     ‚¡¢£¤¥¦§'
? '     CONSEJO PROFESIONAL DE'
? '     INGENIEROS  Y GEOLOGOS     ‚¡¢£¤¥¦§'
? '     CONSEJO PROFESIONAL DE'
? '     INGENIEROS  Y GEOLOGOS     ‚¡¢£¤¥¦§'
??CHR(27)+CHR(038)+CHR(108)+'6'+CHR(068)
??CHR(27)+CHR(040)+chr(115)+'10'+CHR(072)
? '     letras normales 10 cpi     ‚¡¢£¤¥¦§    '
??chr(27)+chr(40)+chr(115)+chr(051)+chr(066)
*??CHR(27)+CHR(040)+CHR(050)+CHR(083)
?'     letras negrita             ‚¡¢£¤¥¦§                 '
??CHR(27)+CHR(040)+CHR(115)+CHR(048)+CHR(066)
? '     letras normales 10 cpi     ‚¡¢£¤¥¦§   Windows 3.0    '
??CHR(27)+CHR(040)+CHR(115)+'17'+CHR(072)
? '     letras normales 17 cpi     ‚¡¢£¤¥¦§   Windows 3.0    '
??CHR(27)+CHR(040)+CHR(115)+'15'+CHR(072)
? '     letras normales 15 cpi     ‚¡¢£¤¥¦§   Windows 3.0    '
??chr(27)+chr(40)+chr(115)+chr(051)+chr(066)
??CHR(27)+CHR(040)+CHR(115)+'12'+CHR(072)
? '     letras ext-negr 12 cpi     ‚¡¢£¤¥¦§   Windows 3.0    '
??CHR(27)+CHR(040)+CHR(115)+CHR(048)+CHR(066)
??CHR(27)+CHR(040)+chr(115)+'10'+CHR(072)
? '     letras normales 10 cpi     ‚¡¢£¤¥¦§    '

EJECT
set device to screen
set console on
set printer off