procedure cpro006
*listado de caratulas de padrones
set talk off
set printer off
set device to screen
@04,01 clear to 23,78
@04,28 say ' CARATULA DE PADRONES     '
close all
WCONTINUA='S'
WPADRON=SPACE(30)
DO WHILE WCONTINUA = 'S'
    @10,5 SAY ' DIGITE NOMBRE PADRON '
    @11,20 GET WPADRON
    READ
    do imprime
    @15,5 SAY 'CONTINUA ? S/N '
    @15,40 GET WCONTINUA
    read
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
*   ???chr(27)+chr(67)+chr(72)
*   ???chr(27)+chr(87)+CHR(1)
*    ???chr(27)+chr(50)
*    ???chr(27)+chr(80)
    ?
    ?
    ?
    ? '           Consejo   Profesional   de    Ingenieros, '
    ? '           y Ge줹ogos -                   -  Mendoza  '
    ? '           Dto Ley 3485/63- Ley 5908/92- Ley 6936/01'
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
    ?
    ? '          P A D R O N   P R O F E S I O N A L '
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
    ?
    ?
    ?
    ? WPADRON AT 15
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
*    ???CHR(27)+CHR(87)+CHR(0)
    ?
    ?
    ?
    ? '                   Acto Eleccionario del 27 de Setiembre de 2008.-'
    ? '                   컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴컴-'
    EJECT
   set printer off
   set device to screen
   set safety on
@04,01 clear to 23,78
return
