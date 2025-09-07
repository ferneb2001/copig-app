procedure cpro005
*listado de referencias para padrones
set talk off
set printer off
set device to screen
@04,01 clear to 23,78
@04,28 say 'LISTADO DE PADRONES     '
close all
WCONT=0
DO WHILE WCONT < 2
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
   ???chr(27)+chr(87)+CHR(1)
*    ???chr(27)+chr(50)
*    ???chr(27)+chr(80)
    ?
    ? ' Consejo Profesional de Ingenieros y Ge줹ogos'
    ? '               de  Mendoza'
    ? ' Dto. ley 3485/63- Ley 5908/92- Ley 6936/2001'
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ? '    P A D R O N    E L E C T O R A L  '
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ?
    ? '      ** R e f e r e n c i a s **   '
    ???CHR(27)+CHR(87)+CHR(0)
    ?
    ?
    ?
    ?
    ?
    ?
    ? '      +   No tiene 4 a쨚s en el ejercicio de la profesi줻 en la Provincia'
    ?
    ?
*    ? '      x   No tiene 30 a쨚s de edad cumplidos'
*    ?
*    ?
    ? '      o   No es Argentino'
    ?
    ?
    ? '      =   No tiene 2 a쨚s de residencia continuada en Mendoza'
    ?
    ?
    ? '      *   Tiene sanci줻 incisos d) y/o e), Art. 34 Decreto ley 3485/63'
    ?
    ?
    ?
    ? '                   CONFORME AL ART. 20 DEL DECRETO LEY 3485/63'
    ? '                   컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴�'
    ?
    ?
    ? '      @   Incumplimiento Art. 2� del Reglamento Electoral '
    ?
    ?
    EJECT
   set printer off
   set device to screen
   set safety on
@04,01 clear to 23,78
return


