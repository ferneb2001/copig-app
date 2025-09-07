procedure at001
**Menu Principal del Sistema de A.T.I.M.
*    opciones iniciales para seleccionar menu
CLEAR
SET EXCLUSIVE OFF
seT DELETED ON
*SET CENTURY ON
close all
SET DEVICE TO SCREEN
SET TALK OFF
SET REPROCESS TO AUTOMATIC
set date dmy
WFCONT=2449345
   fup=CHR(24)
   fdw=CHR(25)
    DEFINE MENU pant_012 
    DEFINE PAD selecion      OF pant_012 PROMPT "\<Selecci¢n" AT 04,28
    do pie2
    USE
   SET DATE FRENCH
   @02,70 SAY DATE()
   on selection pad selecion OF pant_012 activate popup sele1
   define popup sele1       from 6,28 title 'Selecci¢n'
   define bar 1 of sele1    prompt '\<Administraci¢n'
*   define bar 2 of sele1    prompt '\<Notificaciones'
*   define bar 3 of sele1    prompt '\<Expedientes   '
*   define bar 4 of sele1    prompt '\<Mesa de Entradas Notas'
*   define bar 5 of sele1    prompt '\<Comisiones     '
*   define bar 6 of sele1    prompt '\<Peritos Judiciales'
   on selection popup sele1 do atiaa with popup(), bar()


   ACTIVATE MENU pant_012
   clear
*endif
return
procedure pie2
@01,01 clear to 23,78
@05,01 clear to 05,78
@20,03 CLEAR TO 20,78
@01,00 TO 24,79 DOUBLE
@03,01 to 03,78
@02,01 say 'ASOCIACION DE TECNICOS INDUSTRIALES DE MENDOZA'
@02,50 Say ' INICIAL      ' COLOR SCHEME 5

@23,03 say "Seleccione una opci¢n y oprima <ENTER>, o <ESC> para salir" &&color n/w
return

