procedure spaelem
CLEAR
SET EXCLUSIVE OFF
seT DELETED ON
SET CENTURY ON
close all
SET DEVICE TO SCREEN
SET TALK OFF
SET REPROCESS TO AUTOMATIC
set date dmy
WFCONT=2449345
   fup=CHR(24)
   fdw=CHR(25)
    DEFINE MENU pant_112 
    DEFINE PAD selecion      OF pant_112 PROMPT "\<Selecci¢n" AT 04,28
    do pie2
    USE
   SET DATE FRENCH
   @02,70 SAY DATE()
   on selection pad selecion of pant_112 activate popup sele2
   define popup sele2      from 6,28 title 'Listados Certificados'
   define bar 1 of sele2    prompt '\<Certif 1998/1999'
   define bar 2 of sele2   prompt 'C\<ertif 1996/1997'
   define bar 3 of sele2    prompt 'Ce\<rtif.1994/1995'
   define bar 4 of sele2    prompt 'Cer\<tif.2000/2008'
   define bar 5 of sele2    prompt 'Certif.2009 en adel. '
 *  define bar 5 of sele2    prompt '\<Comisiones     '
*   define bar 6 of sele2    prompt '\<Peritos Judiciales'
*   define bar 7 of sele2    prompt 'A\<dministracion II '
*   define bar 8 of sele2    prompt '\<Despachos         '
*   define bar 9 of sele2    prompt 'A\<sociados         '
   on selection popup sele2 do spaelex with popup(), bar()


   ACTIVATE MENU pant_112
   clear
*endif
return
procedure pie2
@01,01 clear to 23,78
@05,01 clear to 05,78
@20,03 CLEAR TO 20,78
@01,00 TO 24,79 DOUBLE
@03,01 to 03,78
@02,01 say 'CONSEJO PROF.DE INGENIEROS Y GEOLOGOS'
@02,50 Say ' INICIAL      ' COLOR SCHEME 5

@23,03 say "Seleccione una opci¢n y oprima <ENTER>, o <ESC> para salir" &&color n/w
return

