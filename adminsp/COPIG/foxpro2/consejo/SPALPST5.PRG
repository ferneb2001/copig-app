procedure spalpst5
*listado de profesionales por titulo (cantidades)
*   habilitados, por a¤o de matriculacion  1993 a 1997.          
@04,01 clear to 23,78
@04,8 say 'CONTEO DE PROFESIONALES  HABILITADOS POR TITULO y POR A¥O MATRIC'
set talk off
select 3
set exclusive on
set safety off
use spestad 
zap
set exclusive off
whabi=' '
wop=1
wnomtit=space(35)
whabi=' '
wcatego='  '
wtitulo=space(3)
wnuind=0
set date to dmy
wfecha=date()
select 5
use sptitu order titulo
do arma
@23,01 clear to 23,78
select 1
use spmatri
go top
set clock on
wcuenta=0
wcuento=0
@14,21 to 16,57
@15,23 say 'Aguarde..,estoy armando un archivo' color n/w*
do while .not. eof()
   @18,20 say numero
   @18,26 say catego
   wcuenta=wcuenta+1
   @18,35 say wcuenta pict '99999'
   @18,60 say inscr
   IF INSCR <> {  /  /  }
   ELSE
      IF FECHAB <>{  /  /  }
         INSCR=FECHAB
      ENDIF
   ENDIF   
   if year(inscr) > 1992
*   if habili < 1992
      do armasu
      wcuento=wcuento+1
      @19,35 say wcuento pict '99999'
   endif   
   select 1
   skip
enddo
*@12,01 clear to 12,78       
@15,23 say '     Aguarde..,voy a ordenarlo   ' color n/w*
select 3
sort to spestads on nomtit 
do imprime
@04,01 clear to 23,78
close all
return

procedure imprime
wop=1
@23,01 clear to 23,78
@15,23 say 'Verifique estado de la impresora  '
@23,34 get wop pict '@*H LP\<1;LP\<2;\<Salir'
read
if wop<>3
   @15,23 say '     En proceso de impresi¢n    '   
   select 4
   use spestads
   go top
   set console off
   set printer on
   set device to printer
   if wop=1
      set printer to 'LPT1'
   else
      set printer to 'LPT2'
   endif      
   ???chr(27)+chr(67)+chr(72)
*   ???chr(27)+chr(48)
*   ???chr(27)+chr(15)
   wlin=90
   whoja=0
   winscri=0
   whabili=0
   wcarne=0
   wfallec=0
   wotros=0
   wtotal=0
   do while .not. eof()
      if wlin > 66
            do titulos
      endif
      wtotal=inscri+habili+carnde+fallec+otro
      if wtotal<>0   
      ?nomtit 
      ??inscri pict '99999' at 40 
      ??habili pict '99999' at 47
      ??carnde  pict '99999' at 55
      ??fallec pict '99999' at 63
      ??otro  pict '99999' at 73
      winscri= winscri+inscri
      whabili= whabili+habili
      wcarne = wcarne+carnde
      wfallec= wfallec+fallec
      wotros = wotros+ otro
      wlin=wlin+1
    *  if wlin > 66
    *     do titulos
       endif
       skip
   enddo
*   ???chr(27)+chr(18)
*    ???chr(27)+chr(50)
*    ???chr(27)+chr(80)
   ?
   ? winscri pict '99999' at 40
   ?? whabili pict '99999' at 48
   ?? wcarne pict  '99999' at 55
   ?? wfallec pict '99999' at 63
   ?? wotros  pict '99999' at 73
   eject
   set printer off
   set device to screen
   set safety on
endif   
@04,01 clear to 23,78
return

procedure titulos
whoja=whoja+1
IF WHOJA<> 1
if wlin > 66
   eject
endif
endif
? 'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS - MENDOZA' 
?
?'CANTIDAD DE PROFESIONALES POR TITULO, MATRICULADOS   ' AT 20
? 'Fecha: ' at 40
?? wfecha 
?? ' Hoja Nro. ' at 60
??whoja pict '999'
?
? '      TITULO                             1997    1996    1995    1994 '
?? '     1993' AT 70
wlin = 6
return

procedure arma
do while .not. eof()
   wnuind=recno()
   wnomtit=titplur
   wtitulo=titulo
   select 3
   append blank
   replace numind  with wnuind
   replace codtit with wtitulo
   replace nomtit with wnomtit
   replace inscri with 0
   replace habili with 0
   replace carnde  with 0
   replace fallec with 0
   replace otro  with 0
   select 5
   skip
enddo
select 3
use spestad
index on codtit to spestai
return

procedure armasu
wtitulo=titulo
whabili=0
wcarne=0
wfallec=0
winscri=0
wotros=0
@05, 10 say inscr
@06, 10 say year(inscr)
if year(inscr) =1997 
   winscri = 1
endif
if year(inscr) = 1996   
   whabili=1
endif
if year(inscr) = 1995 
   wcarne=1
endif
if year(inscr) = 1994 
   wfallec=1
endif
if year(inscr) = 1993 
   wotros=1
endif
wop=0
*@05,20 get wop
*read
select 3
use spestad index spestai
seek(wtitulo)
if found()
   replace inscri with inscri+winscri
   replace habili with habili+whabili
   replace carnde  with carnde+wcarne
   replace fallec with fallec+wfallec
   replace otro  with otro+wotros
endif
return            